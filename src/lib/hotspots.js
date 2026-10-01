import snapshot from '../data/gbif-snapshot.json'
import { regionFor } from './regions.js'

// Hotspot score = weighted count of records in a grid cell.
// Threatened animals: critically endangered 3, endangered 2, vulnerable 1.
// Community reports: logging/poaching 4, habitat disturbance 3, pollution 2, sighting 1.
const SPECIES_W = { CR: 3, EN: 2, VU: 1 }
const REPORT_W = { poaching: 4, habitat: 3, pollution: 2, sighting: 1 }
export const CELL = 2 // degrees

export function hotspotCells(reports) {
  const cells = new Map()
  const add = (lat, lon, w, kind) => {
    const la = Math.floor(lat / CELL) * CELL, lo = Math.floor(lon / CELL) * CELL
    const k = `${la},${lo}`
    const c = cells.get(k) ?? { lat: la, lon: lo, score: 0, species: 0, reports: 0 }
    c.score += w; c[kind] += 1
    cells.set(k, c)
  }
  snapshot.regions.forEach(r => r.points.forEach(p => add(p.lat, p.lon, SPECIES_W[p.iucn] ?? 1, 'species')))
  reports.forEach(r => add(r.lat, r.lon, REPORT_W[r.type] ?? 1, 'reports'))
  return [...cells.values()]
    .map(c => ({ ...c, region: regionFor(c.lat + CELL / 2, c.lon + CELL / 2) }))
    .sort((a, b) => b.score - a.score)
}

// Alerts come from community reports: threats are alerts, and so is any sighting of a CR/EN species.
export function buildAlerts(reports) {
  const out = []
  reports.forEach(r => {
    let level = null, why = ''
    if (r.type === 'poaching') { level = 'critical'; why = 'Logging or poaching reported' }
    else if (r.type === 'habitat') { level = 'high'; why = 'Habitat disturbance reported' }
    else if (r.type === 'pollution') { level = 'medium'; why = 'Pollution reported' }
    else if (r.iucn === 'CR') { level = 'critical'; why = 'Critically endangered species sighted' }
    else if (r.iucn === 'EN') { level = 'high'; why = 'Endangered species sighted' }
    if (level) out.push({ id: r.id, level, why, report: r })
  })
  const rank = { critical: 0, high: 1, medium: 2 }
  return out.sort((a, b) => rank[a.level] - rank[b.level])
}
