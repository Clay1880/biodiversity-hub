import { useMemo, useState } from 'react'
import { CHECKED_ON, DATASETS, KINDS, PAPERS, SOURCES } from '../data/catalog.js'
import { SourceBadge } from './SourceBadge.jsx'

export default function Datasets({ onOpenPaper }) {
  const [q, setQ] = useState('')
  const [source, setSource] = useState('All')
  const [kind, setKind] = useState('All')
  const [copied, setCopied] = useState(null)

  const list = useMemo(() => {
    const t = q.trim().toLowerCase()
    return DATASETS.filter(d =>
      (source === 'All' || d.source === source) &&
      (kind === 'All' || d.kind === kind) &&
      (!t || `${d.title} ${d.blurb} ${d.kind} ${d.source}`.toLowerCase().includes(t)))
  }, [q, source, kind])

  const count = s => DATASETS.filter(d => d.source === s).length

  const copy = async d => {
    try { await navigator.clipboard.writeText(`${d.title}. ${d.source}. ${d.url} (accessed ${CHECKED_ON})`) } catch { /* clipboard blocked */ }
    setCopied(d.id); setTimeout(() => setCopied(null), 1600)
  }

  return (
    <section className="page">
      <header className="page-head">
        <h1>Find datasets</h1>
        <p>Open datasets and code for biodiversity monitoring, taken from Kaggle, GitHub and open science portals. Each card links straight to the source.</p>
      </header>

      <div className="toolbar">
        <input className="search" type="search" placeholder="Search birds, satellite, camera traps…" value={q}
          onChange={e => setQ(e.target.value)} aria-label="Search datasets" />
        <div className="chips">
          <button className={'chip' + (source === 'All' ? ' on' : '')} onClick={() => setSource('All')}>All sources ({DATASETS.length})</button>
          {Object.keys(SOURCES).map(s => (
            <button key={s} className={'chip' + (source === s ? ' on' : '')} onClick={() => setSource(s)} style={{ '--c': SOURCES[s].color }}>
              <i className="chip-dot" />{SOURCES[s].label} ({count(s)})
            </button>
          ))}
        </div>
        <div className="chips">
          <button className={'chip soft' + (kind === 'All' ? ' on' : '')} onClick={() => setKind('All')}>Any topic</button>
          {KINDS.map(k => (
            <button key={k} className={'chip soft' + (kind === k ? ' on' : '')} onClick={() => setKind(k)}>{k}</button>
          ))}
        </div>
      </div>

      <p className="count" aria-live="polite">{list.length} {list.length === 1 ? 'result' : 'results'} · links checked {CHECKED_ON}</p>

      <div className="grid">
        {list.map(d => (
          <article key={d.id} className="card ds" style={{ '--c': SOURCES[d.source].color }}>
            <div className="card-top">
              <SourceBadge source={d.source} />
              <span className="tag">{d.kind}</span>
            </div>
            <h3>{d.title}</h3>
            <p>{d.blurb}</p>
            <p className="meta">Format: {d.format}</p>
            <div className="rel">
              {d.papers.map(id => {
                const p = PAPERS.find(x => x.id === id)
                return <button key={id} className="pill" onClick={() => onOpenPaper(id)} title={p.title}>{p.short}</button>
              })}
            </div>
            <div className="card-actions">
              <a className="btn" href={d.url} target="_blank" rel="noreferrer">Open on {SOURCES[d.source].label} ↗</a>
              <button className="btn ghost" onClick={() => copy(d)}>{copied === d.id ? 'Copied' : 'Copy citation'}</button>
            </div>
          </article>
        ))}
        {list.length === 0 && (
          <div className="empty">
            <p>Nothing matches “{q}”. Try a broader word like “bird” or “satellite”, or reset the filters.</p>
            <button className="btn" onClick={() => { setQ(''); setSource('All'); setKind('All') }}>Reset filters</button>
          </div>
        )}
      </div>
    </section>
  )
}
