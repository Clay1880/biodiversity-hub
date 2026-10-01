import { useEffect, useRef, useState } from 'react'
import { DATASETS, DRIVERS, PAPERS, SOURCES } from '../data/catalog.js'
import { SourceBadge } from './SourceBadge.jsx'

const THEMES = ['All', 'IEEE survey', 'Causes', 'Strategies', 'Technology']

export default function Papers({ openId, onViewRegion }) {
  const [theme, setTheme] = useState('All')
  const [open, setOpen] = useState(openId ?? 'p2')
  const refs = useRef({})

  useEffect(() => {
    if (!openId) return
    setTheme('All'); setOpen(openId)
    setTimeout(() => refs.current[openId]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60)
  }, [openId])

  const list = PAPERS.filter(p => theme === 'All' || p.theme === theme)

  return (
    <section className="page">
      <header className="page-head">
        <h1>Research behind the project</h1>
        <p>The papers from our literature survey, including the four IEEE papers from our slides. Open one to read its findings and jump to datasets that could back it up.</p>
      </header>

      <div className="drivers">
        <div>
          <h2>What is driving the loss?</h2>
          <p className="muted">Direct drivers of recent biodiversity loss, as reported in <a href="https://doi.org/10.1126/sciadv.abm9982" target="_blank" rel="noreferrer">Science Advances, 2022</a>. The paper ranks the top two; the rest are also named as significant.</p>
        </div>
        <ol className="driver-list">
          {DRIVERS.map(d => (
            <li key={d.name} className={d.rank ? 'top r' + d.rank : ''}>
              <span className="driver-name">{d.name}</span>
              <span className="driver-note">{d.rank ? `No. ${d.rank} · ` : ''}{d.note}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="chips" style={{ margin: '28px 0 16px' }}>
        {THEMES.map(t => <button key={t} className={'chip' + (theme === t ? ' on' : '')} onClick={() => setTheme(t)}>{t}</button>)}
      </div>

      <div className="papers">
        {list.map(p => {
          const isOpen = open === p.id
          const related = DATASETS.filter(d => d.papers.includes(p.id))
          return (
            <article key={p.id} ref={el => { refs.current[p.id] = el }} className={'paper' + (isOpen ? ' open' : '')}>
              <button className="paper-head" onClick={() => setOpen(isOpen ? null : p.id)} aria-expanded={isOpen}>
                <span className="paper-kind">{p.kind}</span>
                <h3>{p.title}</h3>
                <span className="paper-venue">{p.venue}{p.year ? `, ${p.year}` : ''}</span>
              </button>
              {isOpen && (
                <div className="paper-body">
                  <p className="scope">{p.scope}</p>
                  <ul>{p.findings.map(f => <li key={f}>{f}</li>)}</ul>
                  <div className="paper-links">
                    <a className="btn" href={p.doi ? `https://doi.org/${p.doi}` : p.url} target="_blank" rel="noreferrer">{p.doi ? 'Read paper (DOI) ↗' : 'Read on IEEE Xplore ↗'}</a>
                    {p.region && <button className="btn ghost" onClick={() => onViewRegion(p.region)}>See the Atlantic Forest on the map</button>}
                  </div>
                  {related.length > 0 && (
                    <div className="related">
                      <h4>Datasets that relate to this paper</h4>
                      <ul>
                        {related.map(d => (
                          <li key={d.id} style={{ '--c': SOURCES[d.source].color }}>
                            <SourceBadge source={d.source} />
                            <a href={d.url} target="_blank" rel="noreferrer">{d.title}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
