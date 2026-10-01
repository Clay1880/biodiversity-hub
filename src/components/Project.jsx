import snapshot from '../data/gbif-snapshot.json'
import { DATASETS, PAPERS, PROJECT, SOURCES } from '../data/catalog.js'
import { SourceBadge } from './SourceBadge.jsx'

export default function Project({ go }) {
  const total = snapshot.regions.reduce((a, r) => a + r.total, 0)
  const bySource = Object.keys(SOURCES).map(s => ({ s, n: DATASETS.filter(d => d.source === s).length })).filter(x => x.n)
  return (
    <section className="page">
      <header className="project-head">
        <p className="muted">{PROJECT.course}</p>
        <h1 className="project-title">{PROJECT.title}</h1>
        <p className="lede">
          A prototype that identifies species from photos, compares machine-learning models on biodiversity data, maps where threatened animals are recorded, flags hotspots and threats, and lets people report what they see.
        </p>
        <dl className="facts">
          <div><dt>Team</dt><dd><ol className="team">{PROJECT.team.map(n => <li key={n}>{n}</li>)}</ol></dd></div>
          <div><dt>Guide</dt><dd>{PROJECT.guide}</dd></div>
          <div><dt>College</dt><dd>{PROJECT.college}</dd></div>
          <div><dt>Year</dt><dd>{PROJECT.year}</dd></div>
        </dl>
      </header>

      <div className="two">
        <div>
          <h2>What the prototype does</h2>
          <ol className="objectives">
            {PROJECT.objectives.map(o => (
              <li key={o.t}>
                <div><strong>{o.t}</strong><p>{o.d}</p></div>
                <button className="btn ghost sm" onClick={() => go(o.where.toLowerCase())}>Open {o.where}</button>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h2>Where the data comes from</h2>
          <ul className="sources">
            <li><SourceBadge source="GBIF" /><span><b>{total.toLocaleString('en-US')}</b> threatened-animal records behind the map. Snapshot from the GBIF API.</span></li>
            {bySource.map(({ s, n }) => (
              <li key={s}><SourceBadge source={s} /><span><b>{n}</b> {n === 1 ? 'dataset or tool' : 'datasets and tools'} in the finder, each linked to its page.</span></li>
            ))}
            <li><span className="badge" style={{ '--c': '#9FB5AE' }}>Papers</span><span><b>{PAPERS.length}</b> papers from the literature survey, each linked by DOI.</span></li>
          </ul>
        </div>
      </div>

      <div className="future">
        <h2>Next steps</h2>
        <ul>{PROJECT.future.map(f => <li key={f}>{f}</li>)}</ul>
      </div>
    </section>
  )
}
