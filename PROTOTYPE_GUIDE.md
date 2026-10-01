# Biodiversity Data Hub: Prototype Guide

Smart Biodiversity Monitoring System · Community Engagement Project (BIT25437A0B) · AIT Pune
Team: Prince Singh (4236), Priyanshu Kumar (4237), Rahul (4239), Harsh Pundir (4222) · Guide: Dr. Sangeeta Jadav

This guide explains the software prototype in simple language: what it does, what technology is inside, how each part works, and answers to questions a teacher is likely to ask.

---

## 1. What is the prototype? (30-second version)

It is a **website** with a small **Python server** behind it. It helps with biodiversity monitoring in five ways:

1. **Map** shows where threatened animals have been recorded around the world, plus hotspots.
2. **Identify** lets you upload a photo, and an AI model (a CNN) tells you what animal or plant it probably is, and whether that species is endangered.
3. **Analyze** trains three machine-learning models (Random Forest, SVM, Decision Tree) on biodiversity data and compares them.
4. **Alerts** lists threats (poaching, habitat damage, pollution, endangered-species sightings) and ranks hotspots.
5. **Report** lets ordinary people log what they see, so the community can take part.

There are also **Datasets** and **Papers** tabs (a finder for open datasets and the research we studied) and a **Project** tab (team, objectives, data sources).

It is a **software-only prototype**. It uses real public data (GBIF) and a real pretrained AI model.

---

## 2. The big picture: how the pieces connect

```
 Browser (React website)                          Python server (Flask)
 ┌──────────────────────────┐                    ┌─────────────────────────────┐
 │ Map  Identify  Analyze   │  photo / CSV       │ /api/identify               │
 │ Alerts  Report  Datasets │ ─────────────────► │   OpenCV → MobileNetV2 CNN  │
 │ Papers  Project          │                    │   → GBIF IUCN lookup        │
 │                          │ ◄───────────────── │ /api/analyze                │
 │ Leaflet map              │  JSON results      │   scikit-learn RF/SVM/DT    │
 │ localStorage (reports)   │                    └─────────────────────────────┘
 └──────────────────────────┘                                  │
        │                                                      ▼
        ▼                                             GBIF public API (species
 Static data file:                                    status) , no key needed
 gbif-snapshot.json (300 threatened-animal records)
 Esri map tiles (the background map)
```

- The **website (front end)** is what the user sees.
- The **Flask server (back end)** does the heavy AI work, because Python has the best AI libraries.
- They talk using **HTTP requests** that send and receive **JSON** (a simple text format for data).
- The Map, Datasets, Papers, Report and Alerts tabs work **without** the server. Only **Identify** and **Analyze** need it.

---

## 3. Technology used and why

| Technology | What it is (simple) | Where we use it | Why we chose it |
|---|---|---|---|
| **Python 3.12** | Main language for AI | The whole backend | Best ecosystem for machine learning |
| **Flask** | A tiny Python web server framework | `server/app.py`: receives photos and CSVs, returns results | Simple, perfect for a small API |
| **OpenCV** | Library for image processing | Reads the photo, crops, resizes, checks blur and brightness | Standard tool for image preprocessing |
| **TensorFlow / Keras** | Library for neural networks | Runs the MobileNetV2 CNN | Industry standard, has pretrained models |
| **scikit-learn** | Library for classic machine learning | Random Forest, SVM, Decision Tree, metrics, train/test split | Easy, reliable, well documented |
| **Pandas** | Library for tables of data | Loads the GBIF records and uploaded CSVs, cleans missing values | Standard for tabular data |
| **NumPy** | Library for fast number arrays | Image arrays and model math | Used by all the libraries above |
| **React 19** | JavaScript library for building web pages | The whole website | Makes interactive pages easy to build and update |
| **Vite** | Build tool and dev server | Runs the website while developing; builds the final site | Very fast, simple setup |
| **Leaflet** | JavaScript map library | The interactive maps | Free, light, widely used |
| **GBIF API** | Free global database of species sightings | Map data, and species conservation status | Real scientific data, no key needed |
| **Esri tiles** | Free background map images | The dark world map | No key needed for this basemap |
| **localStorage** | Small storage inside the browser | Saves community reports on the user's device | No database needed for a prototype |
| **VS Code, Git** | Editor and version control | Development | Standard |

**No API keys are needed.** GBIF, the Esri tiles and the pretrained model weights are all free and keyless.

---

## 4. Folder structure

```
biodiversity-hub/
├─ server/                  ← Python backend
│  ├─ app.py                  Flask routes (/api/identify, /api/analyze, /api/health)
│  ├─ identify.py             OpenCV preprocessing + CNN + IUCN lookup
│  ├─ analyze.py              Random Forest / SVM / Decision Tree training
│  └─ requirements.txt        Python packages needed
├─ src/                     ← React website
│  ├─ App.jsx                 Tabs and shared state (reports)
│  ├─ components/             One file per tab (MapView, Identify, Analyze, Alerts, Report, ...)
│  ├─ lib/                    Helpers: api.js, hotspots.js, regions.js, image.js
│  └─ data/                   gbif-snapshot.json and catalog.js (datasets, papers, project info)
├─ scripts/fetch-gbif.mjs   ← Refreshes the GBIF snapshot from the internet
├─ vite.config.js           ← Sends /api requests to the Flask server in development
└─ README.md                ← How to run it
```

---

## 5. How to run it

Two terminals:

```
# Terminal 1: backend
pip install -r server/requirements.txt
python server/app.py          # starts at http://localhost:5000 (wait ~20 s the first time)

# Terminal 2: website
npm install
npm run dev                   # open http://localhost:5173
```

If you see "The analysis server is not running", it just means Terminal 1 is not running.

---

## 6. Each part explained

### 6.1 Map tab

**What it shows:** Threatened animals recorded in five biodiversity hotspot regions: Atlantic Forest, Western Ghats, Madagascar, Borneo & Sumatra, Amazon Basin.

**Where the data comes from:** the **GBIF** (Global Biodiversity Information Facility) API. We ran `scripts/fetch-gbif.mjs` once and saved the answer in `src/data/gbif-snapshot.json`. This is a **snapshot**, so the website does not need the internet for the data (only for the map background).

**Numbers:** the counts in the side panel cover **every** record GBIF has (hundreds of thousands per region). The dots on the map are a **sample**: one record for each of the 60 most-recorded threatened species per region, so 300 dots in total.

**Colour meaning (IUCN Red List categories):**
- **CR** Critically Endangered (red): extremely high risk of extinction
- **EN** Endangered (orange): very high risk
- **VU** Vulnerable (yellow): high risk

**Hotspot heat layer:** coloured squares on the map. Darker and redder means more threat. See section 6.4 for the formula.

**Community reports** also appear as dots on the map.

### 6.2 Identify tab (the CNN)

**What happens when you click "Identify species":**

1. The browser sends the photo to the Flask server (`POST /api/identify`).
2. **OpenCV preprocessing** (in `identify.py`):
   - Decodes the image.
   - **Crops the centre to a square**, so the animal is not stretched.
   - **Resizes to 224 × 224 pixels** (the size the CNN expects).
   - Converts colours from BGR (OpenCV's order) to RGB (the CNN's order).
   - **Normalises** pixel values from 0–255 to −1…1 (this is the MobileNetV2 standard).
   - Also measures **sharpness** (variance of the Laplacian: low means blurry) and **brightness** (average grey level) to warn about bad photos.
3. **CNN prediction:** the model **MobileNetV2** looks at the image and gives a probability for each of 1,000 classes. We show the **top 3**.
4. **Conservation status:** for each guess, the server asks the GBIF API for the species' **IUCN Red List category** and shows it as a coloured tag (e.g. Tiger → Endangered).
5. The result is sent back and shown. You can then **save it as a sighting** (needs latitude and longitude), which puts it on the map and raises an alert if the species is Endangered or Critically Endangered.

**What is a CNN? (easy explanation)**
A Convolutional Neural Network is a program that learns to recognise pictures. Early layers learn simple things like edges and colours, middle layers learn shapes like ears or stripes, and the last layers combine those into "this is a tiger". It learns by looking at millions of labelled photos.

**What is MobileNetV2?**
A small, fast CNN designed to run on ordinary computers and phones. It has about **3.5 million parameters** (the numbers it learned). It is **pretrained on ImageNet**, a dataset of about 1.3 million photos in 1,000 categories.

**What is "pretrained" / transfer learning?**
Instead of training a CNN from scratch (which needs huge data and days of computing), we download a model that someone already trained and use it. This is standard practice.

**Safety checks we added:**
- If the top guess is a **pet** (dog breeds, house cats), we say it is a domestic animal, not wildlife.
- If the top guess is not an animal or plant (a car, a lamp), we warn that the result is unreliable.
- If confidence is **below 35%**, we warn the user.
- We only show an IUCN status when we can match the species **correctly**. GBIF's name search can return wrong species for a common name, so we accept only an exact common-name match or a small table of known species (for example tiger = *Panthera tigris*). Otherwise it shows "Conservation status not looked up".

### 6.3 Analyze tab (Random Forest, SVM, Decision Tree)

**What it does:** trains three classic machine-learning models on a table of data and compares how well they predict one column.

**Default data:** the 300 GBIF records. Each row has: region, animal class (Aves, Mammalia, ...), latitude, longitude, year, and the IUCN category. **Task:** predict the IUCN category (CR / EN / VU) from the other columns.

**You can also upload your own CSV** (for example sensor readings or field survey data). The page asks which column to predict, and the same pipeline runs.

**Steps in `analyze.py`:**
1. **Clean:** drop rows where the target is missing; fill missing numbers with the median; fill missing categories with "missing".
2. **Split:** **80% train / 20% test**, using a **stratified** split (each class appears in both parts in the same proportion) and a fixed `random_state=42` so results are repeatable.
3. **Prepare features:** numbers are **scaled** (StandardScaler: mean 0, spread 1, which SVM needs); categories are **one-hot encoded** (each category becomes its own 0/1 column).
4. **Train the three models** on the 80%.
5. **Test** on the unseen 20% and report the scores.

**The three models (easy explanations):**

| Model | Idea in simple words | Our setting |
|---|---|---|
| **Decision Tree** | A flowchart of yes/no questions ("is latitude > 10?") that ends in an answer. Easy to understand, can memorise the training data. | `max_depth=8` limits how many questions deep |
| **Random Forest** | Many decision trees, each trained on a random part of the data, that **vote**. More accurate and stable than one tree. | 200 trees |
| **SVM** (Support Vector Machine) | Draws the best boundary between classes, with the biggest gap between them. The RBF kernel lets the boundary bend. | RBF kernel |

**Scores shown (explained):**
- **Accuracy:** share of test rows predicted correctly.
- **Precision:** when the model says "CR", how often is it right?
- **Recall:** of all real "CR" rows, how many did it find?
- **F1:** a balance of precision and recall (macro = averaged over all classes, so rare classes count equally).
- **Confusion matrix:** a table of true class (rows) against predicted class (columns). The diagonal is the correct answers.
- **Feature importance** (Random Forest): which columns the forest relied on most.
- **Baseline:** accuracy if you **always guess the most common class** ("Vulnerable"). A useful model must beat this.

**Our actual result (honest):** Random Forest 60%, SVM 65%, Decision Tree 55%, against a baseline of 65%. **None beats the baseline.** This is expected: where and when an animal is seen does not tell you how threatened it is. The tool shows this instead of hiding it. The Analyze tab shows the real numbers each time you run it.

### 6.4 Alerts tab and hotspot formula

**Hotspot score.** The world is divided into **2° × 2° grid cells**. Each cell gets a score:

- Each threatened-animal record adds: **CR = 3, EN = 2, VU = 1**.
- Each community report adds: **poaching = 4, habitat disturbance = 3, pollution = 2, sighting = 1**.

Higher score means a bigger hotspot. The map colours cells yellow, orange or red by their score compared with the highest cell.

**Alert rules** (from community reports):

| Situation | Alert level |
|---|---|
| Logging or poaching reported | Critical |
| Critically endangered species sighted | Critical |
| Habitat disturbance reported | High |
| Endangered species sighted | High |
| Pollution reported | Medium |

A plain sighting of a non-threatened species does **not** raise an alert. Each alert has a "Show on map" button.

### 6.5 Report tab (community participation)

A form where anyone can log a **wildlife sighting, habitat disturbance, pollution, or logging/poaching**, with a title, notes, an optional photo and a location (click the map or use "Use my location").

- Reports are saved in the browser's **localStorage**. They stay on that device and are labelled **unverified**.
- Photos are shrunk to a small JPEG so they fit in storage.
- You can download all reports as a **CSV**.
- Three starter entries are labelled **"Sample (demo data)"** so the demo is not empty.

### 6.6 Datasets and Papers tabs

- **Datasets:** 16 hand-checked links to open datasets (Kaggle, GitHub, GBIF, portals) for species images, bird sound, camera traps, land cover and forest/fire data. You can search and filter them, and each shows which papers relate to it.
- **Papers:** 8 papers from our literature survey, each with a DOI link to the original.

---

## 7. Likely teacher questions and answers

**Q1. What problem does this solve?**
Biodiversity monitoring is mostly manual, slow and scattered. The prototype puts species records, AI identification, threat reports and hotspots in one place, and lets the community help.

**Q2. Is the data real?**
Yes. The map data is real, from GBIF (a global scientific database, mostly iNaturalist research-grade observations). The three sample reports are labelled demo data. Everything else a user adds is their own.

**Q3. Is the AI model trained by you?**
No. We use **MobileNetV2 pretrained on ImageNet** (transfer learning), which is standard practice. Training our own CNN would need a large dataset and a lot of computing time. Fine-tuning it on an iNaturalist subset is our planned next step.

**Q4. How accurate is the CNN?**
We did not measure our own accuracy because we did not train it. On clear photos of animals it knows (we tested a tiger at 81% and an African elephant at 60% confidence) it works well. It only knows about 400 animal types and 2 plants, so it fails on species outside that list. We show a confidence score and warnings for unreliable results.

**Q5. The PPT says CNN accuracy 75% and SVM 93%. Where is that from?**
Those figures come from the literature survey, not from our prototype. Our own measured results for tabular data are in the Analyze tab (RF 60%, SVM 65%, DT 55%), and they do not beat the always-guess-the-most-common baseline. We can explain this honestly: location, year and class are weak predictors of threat level.

**Q6. Why is the SVM accuracy equal to the baseline?**
Because the classes are imbalanced (65% of records are "Vulnerable"), and the SVM mostly predicts "Vulnerable". That is why we also show F1, precision and recall, which expose this, and the confusion matrix.

**Q7. Why Random Forest, SVM and Decision Tree together?**
They are the classic classifiers named in our literature survey. Comparing them on the same data shows which suits the data. The Decision Tree is simple and explainable; the Random Forest improves on it by combining many trees; the SVM is a different approach (boundaries between classes).

**Q8. What is overfitting and how do you avoid it?**
Overfitting is when a model memorises the training data and fails on new data. We test on a **separate 20%** the model never saw, limit the tree depth (8), and use a forest of 200 trees that vote, which reduces memorising.

**Q9. Why 80/20 split? What is stratified?**
80% to learn from, 20% to test fairly. Stratified means every class (CR, EN, VU) appears in both parts in the same proportion, so the test is not accidentally missing a class.

**Q10. What is preprocessing and why do you do it?**
Models need clean, uniform input. For images: crop to square, resize to 224×224, normalise pixels. For tables: fill missing values, scale numbers, one-hot encode categories.

**Q11. Where do the IUCN categories come from?**
The IUCN Red List (the world's authority on extinction risk), accessed through GBIF. Categories: CR, EN, VU and others (NT, LC, DD).

**Q12. What is an API? What is JSON?**
An API is a way for programs to ask each other for data over the internet. JSON is the simple text format they use, for example `{"label": "tiger", "confidence": 0.81}`.

**Q13. Why do you need both React and Flask?**
React builds the user interface in the browser. Flask runs Python, where our AI libraries live. The browser cannot run TensorFlow or scikit-learn easily, so the browser sends the photo or file to Flask and shows the answer.

**Q14. Why is the map data a snapshot instead of live?**
It is faster, works offline, and avoids hitting GBIF's servers on every page load. We can refresh it any time with `node scripts/fetch-gbif.mjs`.

**Q15. Why only 300 dots on the map when GBIF has hundreds of thousands of records?**
Drawing hundreds of thousands of points would make the page slow. We show one record for each of the 60 most-recorded threatened species per region, and the panel counts still cover **all** records.

**Q16. Where is the data stored? Is there a database?**
No database in the prototype. Map data is a JSON file; community reports are in the browser's localStorage. Limitation: reports are not shared between users. Future work: a shared database.

**Q17. How do you know a report is true?**
We don't, so every community report is labelled **unverified**. A real deployment would add verification by forest officers or researchers.

**Q18. How is a hotspot decided?**
By the weighted count per 2° grid cell (section 6.4). Critical threats and critically endangered species weigh more.

**Q19. How is this connected to the community problem?**
Anyone can report sightings and threats, the map and alerts make threats visible, and the Datasets and Papers tabs help students and researchers find open data. Target users: forest and wildlife departments, environmental authorities, researchers, conservation organisations, local communities and volunteers.

**Q20. How does it handle bad input?**
It rejects files that are not images, warns about blurry, dark or low-confidence photos, rejects CSVs that cannot be used (too few rows, no usable target column), and shows a clear message if the server is off.

**Q21. How do you keep user data private?**
Reports stay in the user's own browser. Photos sent for identification are processed in memory by the Flask server and not saved to disk. No login or personal data is collected.

**Q22. What are the limitations?** (Say these yourself; it shows maturity.)
- The CNN is a general ImageNet model: about 400 animal types and 2 plants.
- On our tabular data, the models do not beat the baseline.
- The map shows a snapshot, not live data.
- Reports are stored in one browser only and are unverified.
- Alerts depend only on user reports.

**Q23. What is your future work?**
- Fine-tune the CNN on an iNaturalist subset for far more species.
- A shared database for community reports, with verification.
- Satellite imagery and GIS for live deforestation tracking.
- Better features for the tabular models (climate, land cover, habitat) so they can beat the baseline.

**Q24. Does it need internet?**
Only for the map background tiles, the first download of the model weights, and the GBIF status lookup in Identify. Everything else runs locally.

---

## 8. Quick demo script (5 minutes)

1. **Map:** click *Atlantic Forest*, toggle CR/EN/VU and the hotspot layer, click a dot and open its GBIF record.
2. **Identify:** upload a tiger or elephant photo, point at the confidence bar and the Endangered tag, enter coordinates and **Save sighting**.
3. **Alerts:** the sighting now appears as a High alert; click *Show on map*.
4. **Analyze:** click *Train on the GBIF records*, explain the table, and point out the baseline line and the honest message.
5. **Report, Datasets, Papers:** add a report, find a dataset, open a paper.

Start the Flask server **before** the demo, and run one test identification first so the model is already warm.

---

## 9. Glossary

- **API:** a way for programs to request data from each other.
- **Backend / frontend:** the server part / the part in the browser.
- **Baseline:** the score of the simplest possible guess; a model must beat it.
- **CNN:** a neural network for images.
- **Confusion matrix:** table of true vs. predicted classes.
- **CSV:** a simple table file.
- **GBIF:** Global Biodiversity Information Facility, a free database of species sightings.
- **IUCN Red List:** the global list of species extinction risk.
- **JSON:** a text format for data.
- **One-hot encoding:** turning a category into separate 0/1 columns.
- **Overfitting:** memorising training data and failing on new data.
- **Pretrained model:** a model already trained by someone else.
- **Normalisation:** scaling values to a standard range.
- **Stratified split:** a train/test split that keeps class proportions.
- **Transfer learning:** reusing a pretrained model for a new task.
