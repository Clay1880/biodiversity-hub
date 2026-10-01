import { useState } from 'react'
import { analyze, OFFLINE_MSG } from '../lib/api.js'

const pct = n => `${(n * 100).toFixed(1)}%`

export default function Analyze() {
  const [out, setOut] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [csv, setCsv] = useState(null)
  const [cols, setCols] = useState(null)
  const [target, setTarget] = useState('')
  const [sel, setSel] = useState(null)

  const handle = e => setErr(e.message === 'offline' ? OFFLINE_MSG : e.message)

  const run = async (file, tgt) => {
    setBusy(true); setErr(''); setOut(null)
    try {
      const d = await analyze(file, tgt)
      if (d.needsTarget) { setCols(d); setTarget(d.suggested[0] ?? d.columns[d.columns.length - 1]) }
      else { setCols(null); setOut(d); setSel(null) }
    } catch (e) { handle(e) } finally { setBusy(false) }
  }

  const best = out && [...out.results].sort((a, b) => b.f1 - a.f1)[0]
  const shown = out && (out.results.find(r => r.model === sel) ?? best)
  const beats = out && out.results.some(r => r.accuracy > out.baseline + 0.005)

  return (
    <section className="page">
      <header className="page-head">
        <h1>Compare Random Forest, SVM and Decision Tree</h1>
        <p>Train three scikit-learn models on tabular biodiversity data with an 80% train / 20% test split, then compare them. Use the GBIF records behind the map, or upload your own CSV, such as sensor readings or field survey data.</p>
      </header>

      <div className="analyze-actions">
        <button className="btn big-btn" onClick={() => { setCsv(null); run(null, null) }} disabled={busy}>
          {busy ? 'Training…' : 'Train on the GBIF records'}
        </button>
        <span className="muted">or</span>
        <label className="field file-inline">
          <span>Upload a CSV</span>
          <input type="file" accept=".csv,text/csv" onChange={e => { const f = e.target.files?.[0]; if (f) { setCsv(f); setOut(null); run(f, null) } }} />
        </label>
      </div>

      {err && <p className="err" role="alert">{err}</p>}

      {cols && (
        <div className="target-pick">
          <p><strong>{csv?.name}</strong> has {cols.rows.toLocaleString('en-US')} rows. Which column should the models predict?</p>
          <div className="latlon">
            <select value={target} onChange={e => setTarget(e.target.value)} aria-label="Column to predict">
              {cols.columns.map(c => <option key={c} value={c}>{c}{cols.suggested.includes(c) ? '' : ' (not a category)'}</option>)}
            </select>
            <button className="btn" onClick={() => run(csv, target)} disabled={busy}>Train models</button>
          </div>
        </div>
      )}

      {out && (
        <div className="analysis" aria-live="polite">
          <p className="muted">
            Data: {out.source}. {out.rows.toLocaleString('en-US')} rows ({out.train} train, {out.test} test). Predicting <b>{out.target}</b> ({out.labels.join(', ')}) from {out.features.join(', ')}.
          </p>

          <table className="metrics">
            <thead><tr><th>Model</th><th>Accuracy</th><th>Precision</th><th>Recall</th><th>F1</th></tr></thead>
            <tbody>
              {out.results.map(r => (
                <tr key={r.model} className={r.model === shown.model ? 'on' : ''} onClick={() => setSel(r.model)}>
                  <td><button className="link" onClick={() => setSel(r.model)}>{r.model}</button>{r.model === best.model && <span className="pill" style={{ '--c': 'var(--moss)' }}>best F1</span>}</td>
                  <td>{pct(r.accuracy)}</td><td>{pct(r.precision)}</td><td>{pct(r.recall)}</td><td>{pct(r.f1)}</td>
                </tr>
              ))}
              <tr className="base"><td>Always guess “{out.baselineLabel}”</td><td>{pct(out.baseline)}</td><td colSpan="3">baseline to beat</td></tr>
            </tbody>
          </table>

          <p className={beats ? 'ok' : 'warn'} role="note">
            {beats
              ? 'At least one model beats the always-guess-the-most-common baseline on accuracy.'
              : 'No model beats the always-guess-the-most-common baseline. These features carry little signal for this target, which is a real result: where and when an animal is seen does not predict how threatened it is.'}
          </p>

          <div className="two">
            <div>
              <h2>Confusion matrix · {shown.model}</h2>
              <p className="muted small">Rows are the true value, columns are the prediction, on the {out.test} test rows.</p>
              <table className="cm">
                <thead><tr><th />{out.labels.map(l => <th key={l}>{l}</th>)}</tr></thead>
                <tbody>
                  {shown.confusion.map((row, i) => (
                    <tr key={i}><th>{out.labels[i]}</th>
                      {row.map((v, j) => <td key={j} className={i === j ? 'diag' : ''} style={{ '--a': Math.min(1, v / Math.max(1, ...row)) }}>{v}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h2>What the Random Forest relied on</h2>
              <p className="muted small">Top features by importance.</p>
              <ul className="imps">
                {out.importances.map(f => (
                  <li key={f.feature}><span>{f.feature}</span><span className="bar-track"><span className="bar-fill" style={{ width: `${(f.weight / out.importances[0].weight) * 100}%`, background: 'var(--moss)' }} /></span><b>{(f.weight * 100).toFixed(1)}%</b></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
