// Builds src/data/gbif-snapshot.json from the public GBIF API (no key needed).
import { writeFileSync, mkdirSync } from 'node:fs'
const REGIONS = [
  { id: 'atlantic', name: 'Atlantic Forest', country: 'BR', lat: [-30, -5], lon: [-55, -35] },
  { id: 'ghats', name: 'Western Ghats', country: 'IN', lat: [8, 21], lon: [73, 78] },
  { id: 'madagascar', name: 'Madagascar', country: 'MG', lat: [-26, -11], lon: [43, 51] },
  { id: 'borneo', name: 'Borneo & Sumatra', country: null, lat: [-5, 7], lon: [95, 119] },
  { id: 'amazon', name: 'Amazon Basin', country: 'BR', lat: [-10, 3], lon: [-74, -50] },
]
const base = 'https://api.gbif.org/v1/occurrence/search'
const q = (r, extra) => {
  const p = new URLSearchParams({ hasCoordinate: 'true', hasGeospatialIssue: 'false', occurrenceStatus: 'PRESENT', ...extra })
  ;['CR', 'EN', 'VU'].forEach(c => p.append('iucnRedListCategory', c))
  p.append('decimalLatitude', `${r.lat[0]},${r.lat[1]}`)
  p.append('decimalLongitude', `${r.lon[0]},${r.lon[1]}`)
  p.append('kingdomKey', '1') // animals
  if (r.country) p.append('country', r.country)
  return `${base}?${p}`
}
const get = async u => { const r = await fetch(u); if (!r.ok) throw new Error(u + ' ' + r.status); return r.json() }
const out = { fetchedAt: new Date().toISOString(), source: 'GBIF.org occurrence API', regions: [] }
for (const r of REGIONS) {
  const meta = await get(q(r, { limit: 0, facet: 'iucnRedListCategory', facetLimit: 5 }))
  const cat = Object.fromEntries((meta.facets?.[0]?.counts ?? []).map(c => [c.name, c.count]))
  const species = await get(q(r, { limit: 0, facet: 'speciesKey', facetLimit: 60 }))
  const keys = (species.facets?.[0]?.counts ?? []).map(c => c.name)
  const points = []
  for (const k of keys) {
    const d = await get(q(r, { limit: 1, speciesKey: k }))
    const o = d.results?.[0]; if (!o) continue
    points.push({ key: o.key, species: o.species ?? o.scientificName, common: o.vernacularName ?? null, cls: o.class ?? null,
      lat: o.decimalLatitude, lon: o.decimalLongitude, iucn: o.iucnRedListCategory, year: o.year ?? null,
      dataset: o.datasetName ?? o.institutionCode ?? null, link: `https://www.gbif.org/occurrence/${o.key}` })
  }
  out.regions.push({ id: r.id, name: r.name, total: meta.count, byCategory: cat, points })
  console.log(r.name, meta.count, points.length)
}
mkdirSync('src/data', { recursive: true })
writeFileSync('src/data/gbif-snapshot.json', JSON.stringify(out))
