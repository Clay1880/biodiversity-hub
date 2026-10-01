export const BOXES = {
  atlantic: [[-30, -55], [-5, -35]],
  ghats: [[8, 73], [21, 78]],
  madagascar: [[-26, 43], [-11, 51]],
  borneo: [[-5, 95], [7, 119]],
  amazon: [[-10, -74], [3, -50]],
}
export const NAMES = {
  atlantic: 'Atlantic Forest', ghats: 'Western Ghats', madagascar: 'Madagascar', borneo: 'Borneo & Sumatra', amazon: 'Amazon Basin',
}

export function regionFor(lat, lon) {
  for (const [id, [[s, w], [n, e]]] of Object.entries(BOXES)) {
    if (lat >= s && lat <= n && lon >= w && lon <= e) return NAMES[id]
  }
  return null
}
