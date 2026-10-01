import { useEffect, useState } from 'react'
import MapView from './components/MapView.jsx'
import Datasets from './components/Datasets.jsx'
import Report from './components/Report.jsx'
import Papers from './components/Papers.jsx'
import Project from './components/Project.jsx'
import Identify from './components/Identify.jsx'
import Analyze from './components/Analyze.jsx'
import Alerts from './components/Alerts.jsx'
import { buildAlerts } from './lib/hotspots.js'

const TABS = [
  { id: 'map', label: 'Map' },
  { id: 'identify', label: 'Identify' },
  { id: 'analyze', label: 'Analyze' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'datasets', label: 'Datasets' },
  { id: 'report', label: 'Report' },
  { id: 'papers', label: 'Papers' },
  { id: 'project', label: 'Project' },
]

const STORE = 'biohub.reports.v1'
const SAMPLES = [
  { id: 's1', type: 'habitat', title: 'Forest edge cleared for farmland', notes: 'Sample entry so the demo is not empty: a strip of trees removed next to a stream.', lat: -22.4, lon: -46.9, sample: true },
  { id: 's2', type: 'sighting', title: 'Hornbill pair feeding on fig tree', notes: 'Sample entry: two birds seen at dawn near a forest trail.', lat: 14.2, lon: 75.1, sample: true },
  { id: 's3', type: 'pollution', title: 'Plastic waste on river bank', notes: 'Sample entry: waste piling up where the river meets the wetland.', lat: 1.3, lon: 103.8, sample: true },
]

function loadReports() {
  try {
    const raw = localStorage.getItem(STORE)
    if (raw) return JSON.parse(raw)
  } catch { /* storage unavailable */ }
  return SAMPLES
}

export default function App() {
  const [tab, setTab] = useState(() => {
    const h = location.hash.slice(1)
    return TABS.some(t => t.id === h) ? h : 'map'
  })
  const [reports, setReports] = useState(loadReports)
  const [paper, setPaper] = useState(null)
  const [focus, setFocus] = useState(null)
  const [regionReq, setRegionReq] = useState(null)

  useEffect(() => { try { localStorage.setItem(STORE, JSON.stringify(reports)) } catch { /* ignore */ } }, [reports])
  useEffect(() => { location.hash = tab }, [tab])

  const alertCount = buildAlerts(reports).length

  const go = id => { window.scrollTo(0, 0); setTab(id) }

  return (
    <>
      <header className="top">
        <button className="brand" onClick={() => go('map')} aria-label="Biodiversity Data Hub, go to map">
          <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
            <circle cx="16" cy="16" r="15" fill="none" stroke="#7FD68A" strokeWidth="1.5" />
            <path d="M9 22c0-8 6-13 14-13 0 8-5 14-13 14z" fill="#7FD68A" />
            <path d="M9 23c4-5 8-8 11-10" stroke="#071a1f" strokeWidth="1.5" fill="none" />
          </svg>
          <span>Biodiversity Data Hub</span>
        </button>
        <nav aria-label="Main">
          {TABS.map(t => (
            <button key={t.id} className={'tab' + (tab === t.id ? ' on' : '')} onClick={() => go(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
              {t.label}{t.id === 'alerts' && alertCount > 0 && <span className="count-dot">{alertCount}</span>}
            </button>
          ))}
        </nav>
      </header>

      <main className={tab === 'map' ? 'main-map' : ''}>
        {tab === 'map' && (
          <MapView reports={reports} focusReport={focus} regionRequest={regionReq} onGoReport={() => go('report')} />
        )}
        {tab === 'identify' && <Identify onAdd={r => setReports(rs => [r, ...rs])} go={go} />}
        {tab === 'analyze' && <Analyze />}
        {tab === 'alerts' && <Alerts reports={reports} onShow={r => { setFocus({ ...r, n: Date.now() }); go('map') }} />}
        {tab === 'datasets' && <Datasets onOpenPaper={id => { setPaper(id); go('papers') }} />}
        {tab === 'report' && (
          <Report
            reports={reports}
            onAdd={r => setReports(rs => [r, ...rs])}
            onRemove={id => setReports(rs => rs.filter(r => r.id !== id))}
            onShow={r => { setFocus({ ...r, n: Date.now() }); go('map') }}
          />
        )}
        {tab === 'papers' && <Papers openId={paper} onViewRegion={id => { setRegionReq({ id, n: Date.now() }); go('map') }} />}
        {tab === 'project' && <Project go={go} />}
      </main>
    </>
  )
}
