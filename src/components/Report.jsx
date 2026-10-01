import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { REPORT_TYPES } from '../data/catalog.js'
import { shrink } from '../lib/image.js'

const blank = { type: 'sighting', title: '', notes: '', lat: null, lon: null, photo: null }

export default function Report({ reports, onAdd, onRemove, onShow }) {
  const [f, setF] = useState(blank)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)
  const mapEl = useRef(null)
  const pin = useRef(null)
  const map = useRef(null)

  const place = (lat, lon, pan) => {
    setF(s => ({ ...s, lat, lon }))
    if (!map.current) return
    if (pin.current) pin.current.setLatLng([lat, lon])
    else pin.current = L.circleMarker([lat, lon], { radius: 8, color: '#fff', weight: 2, fillColor: '#7FD68A', fillOpacity: 1 }).addTo(map.current)
    if (pan) map.current.flyTo([lat, lon], 9)
  }

  useEffect(() => {
    const m = L.map(mapEl.current, { center: [15, 20], zoom: 2, minZoom: 2 })
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ', maxZoom: 14,
    }).addTo(m)
    m.on('click', e => place(+e.latlng.lat.toFixed(5), +e.latlng.lng.toFixed(5), false))
    map.current = m
    setTimeout(() => m.invalidateSize(), 50)
    return () => { m.remove(); pin.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const locate = () => {
    if (!navigator.geolocation) return setErr('This browser cannot share your location. Click the map instead.')
    navigator.geolocation.getCurrentPosition(
      p => { setErr(''); place(+p.coords.latitude.toFixed(5), +p.coords.longitude.toFixed(5), true) },
      () => setErr('Location is blocked. Click the map to set the place instead.'),
    )
  }

  const submit = e => {
    e.preventDefault()
    if (!f.title.trim()) return setErr('Add a short title, for example “Hornbill near the river”.')
    if (f.lat == null) return setErr('Click the map to mark where this happened.')
    setErr('')
    const r = { id: crypto.randomUUID(), ...f, title: f.title.trim(), notes: f.notes.trim(), createdAt: new Date().toISOString() }
    onAdd(r)
    setF(blank); setDone(true)
    if (pin.current) { pin.current.remove(); pin.current = null }
    setTimeout(() => setDone(false), 4000)
  }

  const exportCsv = () => {
    const rows = [['id', 'type', 'title', 'notes', 'lat', 'lon', 'created', 'source']]
    reports.forEach(r => rows.push([r.id, r.type, r.title, r.notes, r.lat, r.lon, r.createdAt, r.sample ? 'sample' : 'community']))
    const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'community-reports.csv'; a.click()
  }

  const up = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    const photo = await shrink(file)
    setF(s => ({ ...s, photo }))
  }

  return (
    <section className="page">
      <header className="page-head">
        <h1>Report what you see</h1>
        <p>Log a wildlife sighting or a threat to a habitat. Your report appears on the hotspot map straight away. Reports stay in this browser and are marked unverified.</p>
      </header>

      <div className="report-grid">
        <form onSubmit={submit} className="form" noValidate>
          <fieldset>
            <legend>What are you reporting?</legend>
            <div className="types">
              {REPORT_TYPES.map(t => (
                <label key={t.id} className={'type' + (f.type === t.id ? ' on' : '')} style={{ '--c': t.color }}>
                  <input type="radio" name="type" checked={f.type === t.id} onChange={() => setF(s => ({ ...s, type: t.id }))} />
                  <i />{t.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="field">
            <span>Title</span>
            <input value={f.title} onChange={e => setF(s => ({ ...s, title: e.target.value }))} maxLength={80} placeholder="Hornbill near the river" />
          </label>
          <label className="field">
            <span>What did you notice?</span>
            <textarea rows={3} value={f.notes} onChange={e => setF(s => ({ ...s, notes: e.target.value }))} maxLength={400}
              placeholder="Species, number of animals, what changed in the habitat…" />
          </label>

          <div className="field">
            <span>Photo (optional)</span>
            <input type="file" accept="image/*" onChange={up} />
            {f.photo && <img className="thumb" src={f.photo} alt="Selected upload preview" />}
          </div>

          <div className="field">
            <span>Place {f.lat != null && <em className="coords">{f.lat}, {f.lon}</em>}</span>
            <button type="button" className="btn ghost" onClick={locate}>Use my location</button>
            <small>Or click the map on the right.</small>
          </div>

          {err && <p className="err" role="alert">{err}</p>}
          {done && <p className="ok" role="status">Report added. It is now on the map.</p>}
          <button className="btn big-btn" type="submit">Add report</button>
        </form>

        <div className="pick">
          <div ref={mapEl} className="pick-map" aria-label="Click to choose the place" />
          <p className="source-line">Base map tiles © Esri. Reports are saved in your browser only.</p>
        </div>
      </div>

      <div className="reports">
        <div className="reports-head">
          <h2>Reports on this device ({reports.length})</h2>
          <button className="btn ghost" onClick={exportCsv} disabled={!reports.length}>Download CSV</button>
        </div>
        {reports.length === 0 && <p className="muted">No reports yet. Add one above and it shows up here and on the map.</p>}
        <ul className="report-list">
          {reports.map(r => {
            const t = REPORT_TYPES.find(x => x.id === r.type) ?? REPORT_TYPES[0]
            return (
              <li key={r.id} style={{ '--c': t.color }}>
                {r.photo ? <img src={r.photo} alt="" /> : <span className="rl-dot" />}
                <div>
                  <strong>{r.title}</strong>
                  <span>{t.label} · {r.lat.toFixed(2)}, {r.lon.toFixed(2)} · {r.sample ? 'Sample (demo data)' : r.identifiedBy === 'cnn' ? 'CNN identification' : 'Community report'}</span>
                </div>
                <button className="btn ghost sm" onClick={() => onShow(r)}>Show on map</button>
                <button className="btn ghost sm" onClick={() => onRemove(r.id)} aria-label={`Delete ${r.title}`}>Delete</button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
