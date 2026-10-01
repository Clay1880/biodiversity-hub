"""Flask API for the Biodiversity Data Hub: /api/identify (CNN) and /api/analyze (RF / SVM / DT).
Run:  python server/app.py   (http://localhost:5000)"""
import threading

from flask import Flask, jsonify, request

import analyze
import identify

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 8 * 1024 * 1024


@app.after_request
def cors(resp):
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return resp


@app.get('/api/health')
def health():
    return jsonify(ok=True, modelLoaded=identify._model is not None)


@app.post('/api/identify')
def identify_route():
    f = request.files.get('image')
    if not f:
        return jsonify(error='Choose a photo first.'), 400
    try:
        return jsonify(identify.identify(f.read()))
    except ValueError as e:
        return jsonify(error=str(e)), 400


@app.post('/api/analyze')
def analyze_route():
    try:
        f = request.files.get('file')
        target = request.form.get('target') or None
        if f is None:
            return jsonify(analyze.run(analyze.snapshot_frame(), 'iucn') | {'source': 'GBIF snapshot'})
        df = analyze.read_csv(f.read())
        if not target:
            return jsonify(needsTarget=True, columns=[str(c) for c in df.columns],
                           suggested=analyze.target_candidates(df), rows=int(len(df)))
        return jsonify(analyze.run(df, target) | {'source': f.filename})
    except (ValueError, KeyError) as e:
        return jsonify(error=str(e)), 400
    except Exception as e:  # unreadable CSV etc.
        return jsonify(error=f'Could not read that file as a CSV table ({type(e).__name__}).'), 400


if __name__ == '__main__':
    threading.Thread(target=identify.model, daemon=True).start()  # warm the CNN
    app.run(port=5000)
