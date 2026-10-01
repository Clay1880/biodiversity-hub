import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import snapshot from '../data/gbif-snapshot.json'
import { IUCN, REPORT_TYPES } from '../data/catalog.js'
import { SourceBadge } from './SourceBadge.jsx'
import { BOXES } from '../lib/regions.js'
import { hotspotCells, CELL } from '../lib/hotspots.js'

const WORLD = [[-40, -80], [35, 125]]
const pad = () => ({ paddingTopLeft: [window.innerWidth > 860 ? 410 : 20, 30], paddingBottomRight: [30, window.innerWidth > 860 ? 70 : 260] })
const fmt = n => n.toLocaleString('en-US')
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const dateLabel = new Date(snapshot.fetchedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

function dot(iucn) {
  return L.divIcon({ className: '', html: `<span class="dot dot-${iucn}"></span>`, iconSize: [16, 16], iconAnchor: [8, 8] })
}
function reportIcon(color) {
  return L.divIcon({ className: '', html: `<span class="rdot" style="--c:${color}"></span>`, iconSize: [18, 18], iconAnchor: [9, 9] })
}

export default function MapView({ reports, onGoReport, focusReport, regionRequest }) {
  const el = useRef(null)
  const map = useRef(null)
  const layers = useRef({})
  const [region, setRegion] = useState('all')
  const [on, setOn] = useState({ CR: true, EN: true, VU: true })
  const [showReports, setShowReports] = useState(true)
  const [showHot, setShowHot] = useState(true)
  const [panelOpen, setPanelOpen] = useState(true)

  useEffect(() => { if (regionRequest) setRegion(regionRequest.id) }, [regionRequest])

  const regions = snapshot.regions
  const current = region === 'all' ? null : regions.find(r => r.id === region)
  const stats = useMemo(() => {
    const src = current ? [current] : regions
    const by = { CR: 0, EN: 0, VU: 0 }
    let total = 0
    src.forEach(r => { total += r.total; Object.entries(r.byCategory).forEach(([k, v]) => { by[k] += v }) })
    return { total, by }
  }, [current, regions])

  // create map once
  useEffect(() => {
    const m = L.map(el.current, { zoomControl: false, worldCopyJump: true, minZoom: 2 }).fitBounds(WORLD, pad())
    L.control.zoom({ position: 'bottomright' }).addTo(m)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ', maxZoom: 14,
    }).addTo(m)
    layers.current.boxes = L.layerGroup().addTo(m)
    layers.current.points = L.layerGroup().addTo(m)
    layers.current.hot = L.layerGroup().addTo(m)
    layers.current.reports = L.layerGroup().addTo(m)
    regions.forEach(r => {
      const rect = L.rectangle(BOXES[r.id], { color: '#7FD68A', weight: 1, dashArray: '4 5', fillOpacity: 0.05, interactive: true })
      rect.bindTooltip(r.name, { sticky: true, className: 'tip' })
      rect.on('click', () => setRegion(r.id))
      rect.addTo(layers.current.boxes)
    })
    map.current = m
    setTimeout(() => m.invalidateSize(), 50)
    return () => m.remove()
  }, [regions])

  // species points
  useEffect(() => {
    const g = layers.current.points
    g.clearLayers()
    regions.forEach(r => {
      if (current && r.id !== current.id) return
      r.points.forEach(p => {
        if (!on[p.iucn]) return
        const mk = L.marker([p.lat, p.lon], { icon: dot(p.iucn), riseOnHover: true })
        mk.bindPopup(
          `<div class="pop"><div class="pop-tag" style="--c:${IUCN[p.iucn].color}">${IUCN[p.iucn].label}</div>
           <h4><i>${esc(p.species)}</i></h4>
           <p>${esc(r.name)}${p.cls ? ' · ' + esc(p.cls) : ''}${p.year ? ' · recorded ' + p.year : ''}</p>
           <p class="pop-src">Source: GBIF.org${p.dataset ? ' — ' + esc(p.dataset) : ''}</p>
           <a href="${esc(p.link)}" target="_blank" rel="noreferrer">Open record on GBIF ↗</a></div>`,
          { autoPanPaddingTopLeft: [window.innerWidth > 860 ? 410 : 20, 70], autoPanPaddingBottomRight: [30, 80] },
        )
        mk.addTo(g)
      })
    })
  }, [on, current, regions])

  // community reports
  useEffect(() => {
    const g = layers.current.reports
    g.clearLayers()
    if (!showReports) return
    reports.forEach(r => {
      const t = REPORT_TYPES.find(x => x.id === r.type) ?? REPORT_TYPES[0]
      const mk = L.marker([r.lat, r.lon], { icon: reportIcon(t.color) })
      mk.bindPopup(
        `<div class="pop"><div class="pop-tag" style="--c:${t.color}">${esc(t.label)}</div>
         <h4>${esc(r.title)}</h4>
         ${r.photo ? `<img src="${r.photo}" alt="" class="pop-img"/>` : ''}
         <p>${esc(r.notes)}</p>
         <p class="pop-src">Source: ${r.sample ? 'Sample report (demo data)' : r.identifiedBy === 'cnn' ? 'Identified by CNN from a photo · unverified' : 'Community report · unverified'}</p></div>`,
      )
      mk.addTo(g)
    })
  }, [reports, showReports])

  // hotspot cells
  useEffect(() => {
    const g = layers.current.hot
    g.clearLayers()
    if (!showHot) return
    const cells = hotspotCells(reports)
    const max = cells[0]?.score ?? 1
    cells.forEach(c => {
      const t = c.score / max
      const rect = L.rectangle([[c.lat, c.lon], [c.lat + CELL, c.lon + CELL]], {
        stroke: false, fillColor: t > 0.66 ? '#FF5A5F' : t > 0.33 ? '#F59A3C' : '#E8C547', fillOpacity: 0.12 + 0.38 * t, interactive: true,
      })
      rect.bindTooltip(`Hotspot score ${c.score}${c.region ? ' · ' + c.region : ''}: ${c.species} threatened-animal records, ${c.reports} reports`, { sticky: true, className: 'tip' })
      rect.addTo(g)
    })
  }, [reports, showHot])

  // fly to region
  useEffect(() => {
    if (!map.current) return
    map.current.flyToBounds(region === 'all' ? WORLD : BOXES[region], { duration: 1.1, ...pad() })
  }, [region])

  useEffect(() => {
    if (focusReport && map.current) {
      map.current.flyTo([focusReport.lat, focusReport.lon], 7, { duration: 1 })
    }
  }, [focusReport])

  const barMax = Math.max(stats.by.CR, stats.by.EN, stats.by.VU, 1)

  return (
    <div className="map-page">
      <div ref={el} className="map" role="application" aria-label="Map of threatened species records" />

      <aside className={'panel' + (panelOpen ? '' : ' closed')}>
        <button className="panel-toggle" onClick={() => setPanelOpen(o => !o)} aria-expanded={panelOpen}>
          {panelOpen ? 'Hide panel' : 'Show panel'}
        </button>
        <div className="panel-body">
          <p className="panel-kicker">Threatened animals recorded in</p>
          <h2 className="panel-title">{current ? current.name : 'Five biodiversity hotspots'}</h2>

          <div className="chips" role="tablist" aria-label="Hotspot">
            <button className={'chip' + (region === 'all' ? ' on' : '')} onClick={() => setRegion('all')}>All</button>
            {regions.map(r => (
              <button key={r.id} className={'chip' + (region === r.id ? ' on' : '')} onClick={() => setRegion(r.id)}>
                {r.name}
              </button>
            ))}
          </div>

          <div className="big">
            <span className="big-n">{fmt(stats.total)}</span>
            <span className="big-l">records of critically endangered, endangered or vulnerable animals with a location</span>
          </div>

          <ul className="bars">
            {['CR', 'EN', 'VU'].map(k => (
              <li key={k} className={on[k] ? '' : 'off'}>
                <button onClick={() => setOn(o => ({ ...o, [k]: !o[k] }))} aria-pressed={on[k]} title="Show or hide on map">
                  <span className="bar-label"><i style={{ background: IUCN[k].color }} />{IUCN[k].label}</span>
                  <span className="bar-track"><span className="bar-fill" style={{ width: `${(stats.by[k] / barMax) * 100}%`, background: IUCN[k].color }} /></span>
                  <span className="bar-n">{fmt(stats.by[k])}</span>
                </button>
              </li>
            ))}
          </ul>

          <p className="note">
            The map shows one record for each of up to 60 of the most-recorded threatened species per area. Counts cover every record.
            Click a point to open the original record.
          </p>

          <label className="toggle">
            <input type="checkbox" checked={showHot} onChange={e => setShowHot(e.target.checked)} />
            <span>Show hotspot heat (darker means more threatened records and reports)</span>
          </label>
          <label className="toggle">
            <input type="checkbox" checked={showReports} onChange={e => setShowReports(e.target.checked)} />
            <span>Show community reports ({reports.length})</span>
          </label>
          <button className="btn ghost" onClick={onGoReport}>Report something you saw</button>
        </div>
      </aside>

      <div className="source-chip">
        <SourceBadge source="GBIF" />
        <span>Occurrence snapshot from api.gbif.org, {dateLabel}. Mostly iNaturalist research-grade observations. IUCN Red List categories via GBIF.</span>
      </div>
    </div>
  )
}
