import { useMemo } from 'react'
import { REPORT_TYPES } from '../data/catalog.js'
import { buildAlerts, hotspotCells, CELL } from '../lib/hotspots.js'

const LEVELS = { critical: { label: 'Critical', color: '#FF5A5F' }, high: { label: 'High', color: '#F59A3C' }, medium: { label: 'Medium', color: '#C4A7FF' } }

export default function Alerts({ reports, onShow }) {
  const alerts = useMemo(() => buildAlerts(reports), [reports])
  const cells = useMemo(() => hotspotCells(reports).slice(0, 6), [reports])
  const top = cells[0]?.score ?? 1

  return (
    <section className="page">
      <header className="page-head">
        <h1>Alerts and hotspots</h1>
        <p>Alerts are raised from community reports: poaching, habitat disturbance, pollution, and sightings of endangered species. Hotspots rank {CELL}° map cells by how many threatened animals and reports fall inside them.</p>
      </header>

      <div className="two">
        <div>
          <h2>Alerts ({alerts.length})</h2>
          {alerts.length === 0 && <p className="muted">No alerts. Reports about habitat disturbance, pollution or poaching, and sightings of endangered species, show up here.</p>}
          <ul className="alert-list">
            {alerts.map(a => {
              const lv = LEVELS[a.level]
              const t = REPORT_TYPES.find(x => x.id === a.report.type) ?? REPORT_TYPES[0]
              return (
                <li key={a.id} style={{ '--c': lv.color }}>
                  <span className="pill" style={{ '--c': lv.color }}>{lv.label}</span>
                  <div>
                    <strong>{a.report.title}</strong>
                    <span>{a.why} · {t.label} · {a.report.lat.toFixed(2)}, {a.report.lon.toFixed(2)}{a.report.sample ? ' · Sample (demo data)' : ''}</span>
                  </div>
                  <button className="btn ghost sm" onClick={() => onShow(a.report)}>Show on map</button>
                </li>
              )
            })}
          </ul>
        </div>

        <div>
          <h2>Top hotspots</h2>
          <ol className="hot-list">
            {cells.map((c, i) => (
              <li key={`${c.lat},${c.lon}`}>
                <div className="top-row">
                  <strong>{c.region ?? `${c.lat}°, ${c.lon}°`}</strong>
                  <span className="top-pct">score {c.score}</span>
                </div>
                <div className="bar-track"><span className="bar-fill" style={{ width: `${(c.score / top) * 100}%`, background: i === 0 ? 'var(--cr)' : 'var(--en)' }} /></div>
                <small className="muted">{c.species} threatened-animal records · {c.reports} reports · cell {c.lat}° to {c.lat + CELL}° N, {c.lon}° to {c.lon + CELL}° E</small>
              </li>
            ))}
          </ol>
          <p className="source-line">Score: critically endangered 3, endangered 2, vulnerable 1 per record; reports 1 to 4 by type. The GBIF part covers the map sample of up to 60 species per area.</p>
        </div>
      </div>
    </section>
  )
}
