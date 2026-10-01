import { SOURCES } from '../data/catalog.js'

const ICONS = {
  Kaggle: <path d="M6 3v18M6 13l9-10M8.5 11.2 16 21" />,
  GitHub: <path d="M9 19c-4 1.5-4-2-6-2.500M15 22v-3.500a3 3 0 0 0-.8-2.300c2.800-.3 5.800-1.400 5.800-6.200a4.800 4.800 0 0 0-1.300-3.300 4.500 4.500 0 0 0-.1-3.300s-1.100-.3-3.500 1.300a12 12 0 0 0-6.200 0C6.500 2.700 5.400 3 5.400 3a4.500 4.500 0 0 0-.1 3.300A4.800 4.800 0 0 0 4 9.600c0 4.800 3 5.900 5.800 6.200a3 3 0 0 0-.8 2.300V22" />,
  GBIF: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
  Portal: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" /></>,
}

export function SourceBadge({ source }) {
  const s = SOURCES[source]
  return (
    <span className="badge" style={{ '--c': s.color }}>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {ICONS[source]}
      </svg>
      {s.label}
    </span>
  )
}
