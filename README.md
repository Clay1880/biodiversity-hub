# Biodiversity Data Hub (CEP prototype)

Smart Biodiversity Monitoring System, AIT Pune. Software prototype: a React web app plus a Flask backend with the ML models.

## Quick start (Windows)
Double-click `start.bat`. It installs missing packages on the first run, starts the backend and the website in two windows, and opens the browser.

## Share it with another laptop
Run `share.bat`. It starts both servers and a free Cloudflare tunnel (install once: `winget install Cloudflare.cloudflared`). Open the `trycloudflare.com` link it shows on any device, or `http://YOUR-IP:5173` on the same Wi-Fi. It works only while your laptop and the windows stay open.

## Run manually (two terminals)
    # 1. Backend (CNN + Random Forest / SVM / Decision Tree)
    pip install -r server/requirements.txt
    python server/app.py          # http://localhost:5000, first start downloads the MobileNetV2 weights (14 MB)

    # 2. Web app
    npm install
    npm run dev                   # http://localhost:5173 (proxies /api to the backend)

No API keys are needed: GBIF, the Esri basemap tiles and the Keras pretrained weights are all free and keyless.
`npm run build` makes a static site in `dist/`; for it to reach the backend set `VITE_API_URL=http://localhost:5000` first.
Map, Datasets, Report and Papers work without the backend. Identify and Analyze need it.

## What each tab does
- **Map:** snapshot of threatened-animal (IUCN CR/EN/VU) records from GBIF (`src/data/gbif-snapshot.json`, refresh with `node scripts/fetch-gbif.mjs`), community reports, and a hotspot heat layer.
- **Identify:** upload a photo. OpenCV crops, resizes and normalises it; MobileNetV2 (ImageNet pretrained, Keras) returns the top 3 guesses; the IUCN status comes from GBIF. Save the result as a sighting.
- **Analyze:** Random Forest, SVM and Decision Tree (scikit-learn, 80/20 split) on the GBIF records or an uploaded CSV, with accuracy, precision, recall, F1, confusion matrix, feature importance and a majority-class baseline.
- **Alerts:** alerts from reports (poaching, habitat disturbance, pollution, endangered-species sightings) and a hotspot ranking.
- **Report:** log sightings and threats; saved in the browser's localStorage. Three entries are labelled "Sample (demo data)".
- **Datasets / Papers:** 16 hand-checked dataset links and 8 papers with DOIs.

## Honest limits
- The CNN is an ImageNet model: about 400 animal types and 2 plants. Fine-tuning on iNaturalist is future work.
- On the GBIF records, predicting threat level from location, year and class does not beat always guessing "Vulnerable". The Analyze tab shows this baseline instead of hiding it.
- Reports live in one browser only.

## 5-minute demo order
1. Map: click Atlantic Forest, toggle hotspots and categories, open a GBIF record.
2. Identify: upload a tiger or elephant photo, save it as a sighting.
3. Alerts: the endangered sighting appears; show it on the map.
4. Analyze: train on the GBIF records, point out the baseline.
5. Report, Datasets and Papers: add a report, find a dataset, open a paper.
