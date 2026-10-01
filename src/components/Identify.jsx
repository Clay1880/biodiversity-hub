import { useState } from 'react'
import { identifyImage, OFFLINE_MSG } from '../lib/api.js'
import { shrink } from '../lib/image.js'
import { IUCN } from '../data/catalog.js'

const pct = n => `${Math.round(n * 100)}%`

export default function Identify({ onAdd, go }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [res, setRes] = useState(null)
  const [pos, setPos] = useState({ lat: '', lon: '' })
  const [saved, setSaved] = useState(false)

  const pick = e => {
    const f = e.target.files?.[0]
    if (!f) return
    if (preview) URL.revokeObjectURL(preview)
    setFile(f); setPreview(URL.createObjectURL(f)); setRes(null); setErr(''); setSaved(false)
  }

  const run = async () => {
    setBusy(true); setErr(''); setRes(null); setSaved(false)
    try {
      setRes(await identifyImage(file))
    } catch (e) {
      setErr(e.message === 'offline' ? OFFLINE_MSG : e.message)
    } finally {
      setBusy(false)
    }
  }

  const locate = () => {
    if (!navigator.geolocation) return setErr('This browser cannot share your location. Type the coordinates instead.')
    navigator.geolocation.getCurrentPosition(
      p => { setErr(''); setPos({ lat: p.coords.latitude.toFixed(5), lon: p.coords.longitude.toFixed(5) }) },
      () => setErr('Location is blocked. Type the coordinates instead.'),
    )
  }

  const best = res?.top[0]
  const lat = parseFloat(pos.lat), lon = parseFloat(pos.lon)
  const validPos = Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180

  const save = async () => {
    const st = best.gbif
    onAdd({
      id: crypto.randomUUID(), type: 'sighting', title: best.label,
      notes: `Identified from a photo by the CNN (${res.model}) with ${pct(best.confidence)} confidence.` +
        (st?.iucn ? ` IUCN Red List: ${IUCN[st.iucn]?.label ?? st.iucn}.` : ''),
      lat, lon, photo: await shrink(file), species: st?.scientific ?? best.label, iucn: st?.iucn ?? null,
      identifiedBy: 'cnn', createdAt: new Date().toISOString(),
    })
    setSaved(true)
  }

  return (
    <section className="page">
      <header className="page-head">
        <h1>Identify a species from a photo</h1>
        <p>Upload a wildlife or plant photo. The image is cleaned with OpenCV and a CNN (MobileNetV2) suggests what it is. The top guess is checked against the IUCN Red List through GBIF.</p>
      </header>

      <div className="two tool">
        <div className="form">
          <div className="field">
            <span>Photo</span>
            <input type="file" accept="image/*" onChange={pick} />
          </div>
          {preview && <img className="id-preview" src={preview} alt="Photo selected for identification" />}
          <button className="btn big-btn" onClick={run} disabled={!file || busy}>{busy ? 'Identifying…' : 'Identify species'}</button>
          {err && <p className="err" role="alert">{err}</p>}
        </div>

        <div aria-live="polite">
          {!res && !busy && <p className="muted">Results appear here. Works best with one animal or plant, centred and in focus.</p>}
          {busy && <p className="muted">Running the model…</p>}
          {res && (
            <div className="result">
              {res.warnings.map(w => <p key={w} className="warn" role="note">{w}</p>)}
              <ol className="top3">
                {res.top.map((t, i) => (
                  <li key={t.label} className={i === 0 ? 'first' : ''}>
                    <div className="top-row">
                      <strong>{t.label}</strong>
                      {t.gbif?.iucn && IUCN[t.gbif.iucn] && <span className="pill" style={{ '--c': IUCN[t.gbif.iucn].color }}>{IUCN[t.gbif.iucn].label}</span>}
                      {t.gbif?.iucn && !IUCN[t.gbif.iucn] && <span className="pill" style={{ '--c': '#9FB5AE' }}>IUCN: {t.gbif.iucn}</span>}
                      <span className="top-pct">{pct(t.confidence)}</span>
                    </div>
                    <div className="bar-track"><span className="bar-fill" style={{ width: pct(t.confidence), background: i === 0 ? 'var(--moss)' : 'var(--line)' }} /></div>
                    <small className="muted">
                      {t.gbif ? <>{t.gbif.scientific} · <a href={t.gbif.link} target="_blank" rel="noreferrer">GBIF species page ↗</a>{!t.gbif.iucn && ' · not assessed on the Red List'}</>
                        : t.kind === 'domestic' ? 'Domestic animal' : 'Conservation status not looked up'}
                    </small>
                  </li>
                ))}
              </ol>

              <div className="save">
                <h2>Save as a sighting</h2>
                <p className="muted">Adds the photo and result to the map, and raises an alert if the species is endangered.</p>
                <div className="latlon">
                  <label className="field"><span>Latitude</span><input inputMode="decimal" value={pos.lat} onChange={e => setPos(p => ({ ...p, lat: e.target.value }))} placeholder="18.52" /></label>
                  <label className="field"><span>Longitude</span><input inputMode="decimal" value={pos.lon} onChange={e => setPos(p => ({ ...p, lon: e.target.value }))} placeholder="73.85" /></label>
                  <button type="button" className="btn ghost" onClick={locate}>Use my location</button>
                </div>
                <button className="btn" onClick={save} disabled={!validPos || saved}>{saved ? 'Saved' : 'Save sighting'}</button>
                {saved && <p className="ok" role="status">Saved. <button className="link" onClick={() => go('map')}>See it on the map</button> or <button className="link" onClick={() => go('alerts')}>check alerts</button>.</p>}
              </div>

              <p className="source-line">{res.model}. {res.note} Photo sharpness {Math.round(res.quality.sharpness)}, brightness {Math.round(res.quality.brightness)}/255.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
