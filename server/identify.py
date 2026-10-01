"""CNN species identification: OpenCV preprocessing + pretrained MobileNetV2 (Keras)."""
import json
import os
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache

os.environ.setdefault('TF_CPP_MIN_LOG_LEVEL', '2')
import cv2
import numpy as np
from keras.applications import MobileNetV2
from keras.applications.mobilenet_v2 import decode_predictions, preprocess_input

GBIF = 'https://api.gbif.org/v1'
BACKBONE = 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c'
IUCN_CODES = {'CR', 'EN', 'VU', 'NT', 'LC', 'DD', 'EX', 'EW'}


# ImageNet common name -> scientific name, for well-known species that GBIF does not list under that exact common name.
ALIASES = {
    'tiger': 'Panthera tigris', 'lion': 'Panthera leo', 'leopard': 'Panthera pardus', 'snow leopard': 'Panthera uncia',
    'jaguar': 'Panthera onca', 'cheetah': 'Acinonyx jubatus', 'giant panda': 'Ailuropoda melanoleuca',
    'lesser panda': 'Ailurus fulgens', 'brown bear': 'Ursus arctos', 'american black bear': 'Ursus americanus',
    'ice bear': 'Ursus maritimus', 'sloth bear': 'Melursus ursinus', 'orangutan': 'Pongo pygmaeus',
    'gorilla': 'Gorilla gorilla', 'chimpanzee': 'Pan troglodytes', 'african elephant': 'Loxodonta africana',
    'indian elephant': 'Elephas maximus', 'indri': 'Indri indri', 'koala': 'Phascolarctos cinereus',
    'hippopotamus': 'Hippopotamus amphibius', 'komodo dragon': 'Varanus komodoensis',
    'american alligator': 'Alligator mississippiensis', 'proboscis monkey': 'Nasalis larvatus',
    'bald eagle': 'Haliaeetus leucocephalus', 'platypus': 'Ornithorhynchus anatinus', 'african grey': 'Psittacus erithacus',
    'white wolf': 'Canis lupus', 'red wolf': 'Canis rufus', 'siamang': 'Symphalangus syndactylus',
    'leatherback turtle': 'Dermochelys coriacea', 'loggerhead': 'Caretta caretta',
}

_model = None


def model():
    global _model
    if _model is None:
        _model = MobileNetV2(weights='imagenet')  # weights download once, no API key
    return _model


def category(idx):
    """ImageNet class index -> what kind of thing it is. 0-397 are animals."""
    if 151 <= idx <= 268 or 281 <= idx <= 285:
        return 'domestic'  # dog breeds, house cats
    if idx <= 397:
        return 'wildlife'
    if idx in (984, 985):  # daisy, yellow lady's slipper
        return 'plant'
    return 'other'


def preprocess(raw):
    """Decode, centre-crop to square, resize to 224x224, normalise to [-1, 1]. Also returns quality checks."""
    img = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError('That file is not a readable image.')
    h, w = img.shape[:2]
    s = min(h, w)
    y, x = (h - s) // 2, (w - s) // 2
    sq = img[y:y + s, x:x + s]
    gray = cv2.cvtColor(sq, cv2.COLOR_BGR2GRAY)
    quality = {
        'width': int(w), 'height': int(h),
        'sharpness': float(cv2.Laplacian(gray, cv2.CV_64F).var()),
        'brightness': float(gray.mean()),
    }
    rgb = cv2.cvtColor(cv2.resize(sq, (224, 224), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2RGB)
    return preprocess_input(rgb.astype('float32'))[None], quality


def _get(url):
    with urllib.request.urlopen(url, timeout=6) as r:
        return json.load(r)


def _category(key):
    code = _get(f'{GBIF}/species/{key}/iucnRedListCategory').get('code')
    return code if code in IUCN_CODES else None


@lru_cache(maxsize=512)
def iucn_status(label):
    """Look the label up on GBIF: curated alias first, otherwise a species whose listed common names include the
    label exactly (GBIF's fuzzy search alone returns unrelated species)."""
    try:
        sci = ALIASES.get(label.lower())
        if sci:
            m = _get(f'{GBIF}/species/match?' + urllib.parse.urlencode({'name': sci, 'kingdom': 'Animalia'}))
            key = m.get('usageKey')
            if key:
                return {'scientific': sci, 'iucn': _category(key), 'link': f'https://www.gbif.org/species/{key}'}
        q = urllib.parse.urlencode({
            'q': label, 'qField': 'VERNACULAR', 'rank': 'SPECIES', 'datasetKey': BACKBONE,
            'status': 'ACCEPTED', 'limit': 20,
        })
        for x in _get(f'{GBIF}/species/search?{q}').get('results', []):
            names = {v.get('vernacularName', '').strip().lower() for v in x.get('vernacularNames', [])}
            if label.lower() in names:
                key = x.get('nubKey') or x['key']
                return {'scientific': x['scientificName'].split(' (')[0], 'iucn': _category(key),
                        'link': f'https://www.gbif.org/species/{key}'}
        return None
    except Exception:
        return None


def identify(raw):
    x, quality = preprocess(raw)
    probs = model().predict(x, verbose=0)
    top = decode_predictions(probs, top=3)[0]
    order = np.argsort(probs[0])[::-1][:3]
    items = []
    for (_, name, p), idx in zip(top, order):
        items.append({'label': name.replace('_', ' '), 'confidence': float(p), 'kind': category(int(idx))})
    with ThreadPoolExecutor(3) as ex:
        looked = list(ex.map(lambda i: iucn_status(i['label']) if i['kind'] in ('wildlife', 'plant') else None, items))
    for i, st in zip(items, looked):
        i['gbif'] = st

    warnings = []
    if items[0]['kind'] == 'domestic':
        warnings.append('This looks like a pet or domestic animal, not wildlife.')
    elif items[0]['kind'] == 'other':
        warnings.append('This does not look like an animal or plant the model knows. Treat the result as unreliable.')
    if items[0]['confidence'] < 0.35:
        warnings.append('Low confidence. Try a clearer, closer photo with the animal centred.')
    if quality['sharpness'] < 60:
        warnings.append('The photo looks blurry.')
    if quality['brightness'] < 50:
        warnings.append('The photo is very dark.')
    elif quality['brightness'] > 215:
        warnings.append('The photo is very bright or washed out.')
    return {
        'top': items, 'quality': quality, 'warnings': warnings,
        'model': 'MobileNetV2, ImageNet pretrained (Keras)',
        'note': 'Covers about 400 animal types and 2 plants. A model fine-tuned on iNaturalist would cover many more species.',
    }
