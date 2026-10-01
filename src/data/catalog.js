// Every entry carries its own source so the UI can always show where it came from.
// Links were checked on 1 Oct 2026.
export const CHECKED_ON = '1 Oct 2026'

export const SOURCES = {
  Kaggle: { color: '#20BEFF', label: 'Kaggle' },
  GitHub: { color: '#C4A7FF', label: 'GitHub' },
  GBIF: { color: '#7FD68A', label: 'GBIF' },
  Portal: { color: '#E8C547', label: 'Open portal' },
}

export const KINDS = ['Species images', 'Bird sound', 'Camera traps', 'Land cover', 'Forest & fire', 'Occurrence records']

export const DATASETS = [
  {
    id: 'inat2019', source: 'Kaggle', kind: 'Species images',
    title: 'iNaturalist 2019 at FGVC6',
    blurb: 'Fine-grained species classification from citizen-science photos of plants and animals.',
    url: 'https://www.kaggle.com/c/inaturalist-2019-fgvc6', papers: ['p4'], format: 'Images',
  },
  {
    id: 'animals90', source: 'Kaggle', kind: 'Species images',
    title: 'Animal Image Dataset (90 different animals)',
    blurb: 'Labelled photos across 90 animal classes. A quick starting point for a species-recognition demo.',
    url: 'https://www.kaggle.com/datasets/iamsouravbanerjee/animal-image-dataset-90-different-animals', papers: ['p4', 'p5'], format: 'Images',
  },
  {
    id: 'birdclef23', source: 'Kaggle', kind: 'Bird sound',
    title: 'BirdCLEF 2023',
    blurb: 'Identify bird species from soundscape recordings. Shows what acoustic sensors can do for monitoring.',
    url: 'https://www.kaggle.com/competitions/birdclef-2023', papers: ['p4'], format: 'Audio',
  },
  {
    id: 'cornell', source: 'Kaggle', kind: 'Bird sound',
    title: 'Cornell Birdcall Identification',
    blurb: 'Recognise bird calls in audio recordings, the same task that field recorders in remote habitats face.',
    url: 'https://www.kaggle.com/c/birdsong-recognition', papers: ['p4'], format: 'Audio',
  },
  {
    id: 'amazonspace', source: 'Kaggle', kind: 'Land cover',
    title: 'Planet: Understanding the Amazon from Space',
    blurb: 'Satellite image chips labelled with land cover and land-use tags across the Amazon basin.',
    url: 'https://www.kaggle.com/c/planet-understanding-the-amazon-from-space', papers: ['p2', 'p8'], format: 'Images',
  },
  {
    id: 'deepglobe', source: 'Kaggle', kind: 'Land cover',
    title: 'DeepGlobe Land Cover Classification',
    blurb: 'Satellite imagery segmented into land-cover classes such as forest, agriculture, urban and water.',
    url: 'https://www.kaggle.com/datasets/balraj98/deepglobe-land-cover-classification-dataset', papers: ['p2', 'p8'], format: 'Images + masks',
  },
  {
    id: 'brfires', source: 'Kaggle', kind: 'Forest & fire',
    title: 'Forest Fires in Brazil',
    blurb: 'Fire counts by Brazilian state and month. Useful for charting land-use pressure over time.',
    url: 'https://www.kaggle.com/datasets/gustavomodelli/forest-fires-in-brazil', papers: ['p1', 'p2'], format: 'CSV',
  },
  {
    id: 'covertype', source: 'Kaggle', kind: 'Forest & fire',
    title: 'Forest Cover Type Prediction',
    blurb: 'Map variables used to predict the forest cover type of 30 m cells in a US national forest.',
    url: 'https://www.kaggle.com/c/forest-cover-type-prediction', papers: ['p8'], format: 'CSV',
  },
  {
    id: 'megadetector', source: 'GitHub', kind: 'Camera traps',
    title: 'MegaDetector',
    blurb: 'AI model that finds animals, people and vehicles in camera-trap images so ecologists skip the empty frames.',
    url: 'https://github.com/agentmorris/MegaDetector', papers: ['p4', 'p5'], format: 'Model + code',
  },
  {
    id: 'inatcomp', source: 'GitHub', kind: 'Species images',
    title: 'visipedia/inat_comp',
    blurb: 'Official repository for the iNaturalist challenge datasets and their annotation files.',
    url: 'https://github.com/visipedia/inat_comp', papers: ['p4'], format: 'Code + links',
  },
  {
    id: 'inatopen', source: 'GitHub', kind: 'Occurrence records',
    title: 'iNaturalist Open Data',
    blurb: 'Documentation for the open, licensed iNaturalist photos and observations that also feed GBIF.',
    url: 'https://github.com/inaturalist/inaturalist-open-data', papers: ['p4'], format: 'Docs + metadata',
  },
  {
    id: 'birdnet', source: 'GitHub', kind: 'Bird sound',
    title: 'BirdNET-Analyzer',
    blurb: 'Open tool that identifies bird species from audio recordings.',
    url: 'https://github.com/kahst/BirdNET-Analyzer', papers: ['p4'], format: 'Model + code',
  },
  {
    id: 'eurosat', source: 'GitHub', kind: 'Land cover',
    title: 'EuroSAT',
    blurb: 'Sentinel-2 satellite patches labelled with ten land-use and land-cover classes.',
    url: 'https://github.com/phelber/EuroSAT', papers: ['p2', 'p8'], format: 'Images',
  },
  {
    id: 'gbif', source: 'GBIF', kind: 'Occurrence records',
    title: 'GBIF Occurrence Search',
    blurb: 'Billions of species sighting records, free to search and download. This prototype’s map uses a snapshot from its API.',
    url: 'https://www.gbif.org/occurrence/search', papers: ['p1', 'p2'], format: 'API + CSV',
  },
  {
    id: 'lila', source: 'Portal', kind: 'Camera traps',
    title: 'LILA BC',
    blurb: 'Labelled Information Library of Alexandria: a home for conservation datasets, mostly camera-trap images.',
    url: 'https://lila.science', papers: ['p4', 'p5'], format: 'Images',
  },
  {
    id: 'gfw', source: 'Portal', kind: 'Forest & fire',
    title: 'Global Forest Watch',
    blurb: 'Near-real-time maps of tree-cover loss and forest alerts, with downloadable data.',
    url: 'https://www.globalforestwatch.org', papers: ['p1', 'p2', 'p8'], format: 'Maps + data',
  },
]

export const PAPERS = [
  {
    id: 'p1', short: 'Atlantic Forest · 2020', kind: 'Research paper', theme: 'Causes',
    title: 'The erosion of biodiversity and biomass in the Atlantic Forest biodiversity hotspot',
    venue: 'Nature Communications', year: 2020, doi: '10.1038/s41467-020-20217-w',
    scope: 'Nearly 1,800 forest survey plots compared fragmented forest with intact forest.',
    findings: [
      'Forest fragments showed significant losses in biodiversity and biomass.',
      'Many areas had fewer tree species and fewer individuals of important species types.',
      'Fragmentation erodes carbon storage and biodiversity even where forest cover still appears to exist.',
      'Protected areas, especially large ones, help reduce this erosion.',
    ],
    region: 'atlantic',
  },
  {
    id: 'p2', short: 'Drivers of loss · 2022', kind: 'Research paper', theme: 'Causes',
    title: 'The direct drivers of recent global anthropogenic biodiversity loss',
    venue: 'Science Advances', year: 2022, doi: '10.1126/sciadv.abm9982',
    scope: 'Ranks the direct human-caused drivers of biodiversity loss on land, in freshwater and at sea.',
    findings: [
      'Land- and sea-use change is the dominant direct driver of recent biodiversity loss.',
      'Direct exploitation of natural resources is the second most significant driver.',
      'Pollution, climate change and invasive species are also significant contributors.',
      'The ranking differs between land and sea, so conservation must address several pressures at once.',
    ],
  },
  {
    id: 'p3', short: 'Climate & conservation · 2024', kind: 'Technical paper', theme: 'Strategies',
    title: 'Biodiversity conservation in the context of climate change: facing challenges and management strategies',
    venue: 'Science of the Total Environment', year: 2024, doi: '10.1016/j.scitotenv.2024.173377',
    scope: 'Reviews how climate change raises the difficulty of conservation and what management can do.',
    findings: [
      'Climate change creates increasing challenges for biodiversity conservation.',
      'Invasive species and human pressures compound the climate threat.',
      'Management strategies need to adapt as conditions change.',
    ],
  },
  {
    id: 'p6', short: 'Beyond climate · 2021', kind: 'Research paper', theme: 'Causes',
    title: 'Biodiversity loss due to more than climate change',
    venue: 'Science', year: 2021, doi: '10.1126/science.abm6216',
    scope: 'Challenges the view that climate change is the sole main driver of ecological decline.',
    findings: [
      'Climate change is often wrongly treated as the only primary cause of ecological deterioration.',
      'Focusing only on decarbonisation hides other planetary boundaries such as biosphere integrity.',
      'Habitat destruction, exploitation and pollution get too little systematic attention and funding.',
      'Policy should integrate biosphere integrity alongside climate targets.',
    ],
  },
  {
    id: 'p4', short: 'AI & IoT · 2024', kind: 'Technical paper', theme: 'Technology',
    title: 'AI and IoT in biodiversity assessment',
    venue: 'Journal of Aquaculture & Marine Biology (MedCrave)', year: 2024, doi: '10.15406/jamb.2024.13.00404',
    scope: 'How AI and Internet of Things devices improve data collection and automated species identification.',
    findings: [
      'IoT devices such as camera traps and acoustic sensors capture continuous data in remote habitats.',
      'Machine-learning models identify species from camera and sensor data.',
      'Automated monitoring overcomes the limits of manual surveys.',
      'Data quality, standardisation, privacy and technical capacity remain challenges.',
    ],
  },
  {
    id: 'p5', short: 'Robotics & AI · 2026', kind: 'Technical paper', theme: 'Technology',
    title: 'Robotics and AI in wildlife conservation',
    venue: 'AI and Robotics in Animal Science (Cornous Books)', year: 2026, doi: '10.37446/edibook202024/54-66',
    scope: 'Uses of drones, rovers and AI for tracking wildlife and watching remote habitats.',
    findings: [
      'AI can rapidly analyse large volumes of acoustic-sensor and satellite data.',
      'Drones and robots survey remote areas with minimal disturbance.',
      'Automated systems lower survey costs and improve accuracy.',
      'They help detect illegal activity such as poaching and map animal movements.',
    ],
  },
  {
    id: 'p7', short: 'Wetland IoT · 2023', kind: 'Technical paper', theme: 'Technology',
    title: 'Toward low-cost and sustainable IoT systems for soil monitoring in coastal wetlands',
    venue: 'IEEE CIC (conference)', year: 2023, doi: '10.1109/cic58953.2023.00017',
    scope: 'An energy-efficient IoT sensor network for monitoring soil health in coastal wetlands.',
    findings: [
      'Coastal wetlands are highly vulnerable to climate change and invasive species.',
      'Traditional monitoring is labour-intensive, expensive and slow.',
      'Low-cost sensors with energy management can run without a power grid.',
      'Continuous real-time data helps track ecosystem degradation.',
    ],
  },
  {
    id: 'p8', short: 'Cerrado ML · 2025', kind: 'Technical paper', theme: 'Technology',
    title: 'Machine-learning-based Cerrado land cover classification using PlanetScope imagery',
    venue: 'Remote Sensing (MDPI)', year: 2025, doi: '10.3390/rs17030480',
    scope: 'Machine learning on high-resolution satellite imagery to map land cover in a threatened hotspot.',
    findings: [
      'Human activity drives severe biodiversity loss and alters natural fire dynamics.',
      'Machine learning on satellite imagery is a scalable, non-invasive way to map habitat change.',
      'Natural vegetation types are hard to tell apart from altered land because spectral signatures look alike.',
      'Automated remote sensing supports preserving ecosystem services.',
    ],
  },
  {
    id: 'p9', short: 'Invasive flowers CNN', kind: 'IEEE paper', theme: 'IEEE survey',
    title: 'Detection And Alert System Of Invasive Flower Species Using CNN',
    venue: 'IEEE Xplore',
    url: 'https://ieeexplore.ieee.org/document/10127403',
    scope: 'Methods listed in our literature survey: CNN, machine learning, anomaly detection, image processing.',
    findings: [
      'CNN can be used to automatically identify flower species from images.',
      'Image-based identification can help detect potentially invasive species.',
      'Anomaly detection can identify flowers that differ from the expected native species.',
      'The approach can support biodiversity protection and ecological monitoring.',
    ],
  },
  {
    id: 'p10', short: 'Poacher detection ML', kind: 'IEEE paper', theme: 'IEEE survey',
    title: 'Enhancing Wildlife Protection: Poacher Detection Using Machine Learning Models',
    venue: 'IEEE Xplore',
    url: 'https://ieeexplore.ieee.org/abstract/document/10911994',
    scope: 'Methods listed in our literature survey: SVM, Random Forest, Decision Tree, CNN, data augmentation, multiple datasets.',
    findings: [
      'SVM, Random Forest, Decision Tree and CNN can be applied to poaching-detection tasks.',
      'Machine-learning models can help automate the identification of suspicious activities from collected data.',
      'CNN-based analysis is useful for processing images related to wildlife protection.',
      'Combining different ML approaches provides a technical framework for automated wildlife-surveillance systems.',
    ],
  },
  {
    id: 'p11', short: 'IoT in conservation', kind: 'IEEE paper', theme: 'IEEE survey',
    title: 'IoT Applications in Wildlife Conservation: Tracking and Protecting Endangered Species',
    venue: 'IEEE Xplore',
    url: 'https://ieeexplore.ieee.org/abstract/document/10395145',
    scope: 'Methods listed in our literature survey: IoT devices, motion sensors, cameras, environmental sensors, Random Forest, real-time analytics.',
    findings: [
      'IoT devices can provide continuous monitoring of wildlife and environmental conditions.',
      'Motion sensors and cameras can collect information about animal movement and activity.',
      'Random Forest can be used to analyse and classify collected wildlife data.',
      'Real-time data analysis can support wildlife tracking, species identification and conservation monitoring.',
    ],
  },
  {
    id: 'p12', short: 'IoT forest health DL', kind: 'IEEE paper', theme: 'IEEE survey',
    title: 'IoT-Enhanced Deep Learning System for Forest Health and Monitoring',
    venue: 'IEEE Xplore',
    url: 'https://ieeexplore.ieee.org/abstract/document/11468819',
    scope: 'Methods listed in our literature survey: IoT sensors, MobileNet, DeepForest, YOLOv8, WebRTC, Streamlit.',
    findings: [
      'IoT sensors enable continuous collection of forest environmental data such as temperature and humidity.',
      'Deep-learning models can automate tree and species detection and forest monitoring.',
      'CNN-based models such as MobileNet are suitable for image-based identification tasks.',
      'Combining IoT, deep learning and video or image analysis can provide an integrated forest-monitoring system.',
    ],
  },
]

export const DRIVERS = [
  { name: 'Land & sea-use change', rank: 1, note: 'Dominant direct driver' },
  { name: 'Direct exploitation', rank: 2, note: 'Second most significant' },
  { name: 'Pollution', note: 'Also significant' },
  { name: 'Climate change', note: 'Also significant' },
  { name: 'Invasive species', note: 'Also significant' },
]

export const PROJECT = {
  title: 'Smart Biodiversity Monitoring and Conservation Awareness System',
  course: 'Community Engagement Project · BIT25437A0B',
  college: 'Army Institute of Technology, Pune · Department of Information Technology',
  team: ['Prince Singh (4236)', 'Priyanshu Kumar (4237)', 'Rahul (4239)', 'Harsh Pundir (4222)'],
  guide: 'Dr. Sangeeta Jadav',
  year: '2026-27 · Second Year, Division A',
  objectives: [
    { t: 'Identify species from photos', d: 'A CNN with OpenCV preprocessing suggests the species and checks its IUCN status.', where: 'Identify' },
    { t: 'Classify biodiversity data', d: 'Random Forest, SVM and Decision Tree compared on tabular data, with an 80/20 split.', where: 'Analyze' },
    { t: 'Show loss hotspots and raise alerts', d: 'A hotspot map and an alert list for threats and endangered sightings.', where: 'Alerts' },
    { t: 'Let people report what they see', d: 'Citizens and researchers log wildlife sightings and habitat disturbance.', where: 'Report' },
    { t: 'Find open data and research', d: 'Datasets and papers behind the work, each linked to its source.', where: 'Datasets' },
  ],
  future: [
    'Fine-tune the CNN on an iNaturalist subset so it covers many more species',
    'Store reports in a shared database so they are not limited to one browser',
    'Satellite imagery and GIS for live deforestation tracking',
  ],
}

export const IUCN = {
  CR: { label: 'Critically endangered', color: '#FF5A5F' },
  EN: { label: 'Endangered', color: '#F59A3C' },
  VU: { label: 'Vulnerable', color: '#E8C547' },
}

export const REPORT_TYPES = [
  { id: 'sighting', label: 'Wildlife sighting', color: '#7FD68A' },
  { id: 'habitat', label: 'Habitat disturbance', color: '#F59A3C' },
  { id: 'pollution', label: 'Pollution', color: '#C4A7FF' },
  { id: 'poaching', label: 'Logging or poaching', color: '#FF5A5F' },
]
