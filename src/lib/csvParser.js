/**
 * Lightweight CSV parser that handles quoted fields with commas.
 * Returns an array of objects keyed by header row.
 */
export function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim() !== '')
  if (lines.length < 2) return []

  const headers = splitCSVLine(lines[0])

  return lines.slice(1).map(line => {
    const values = splitCSVLine(line)
    return headers.reduce((obj, header, i) => {
      obj[header.trim()] = (values[i] ?? '').trim()
      return obj
    }, {})
  })
}

function splitCSVLine(line) {
  const cols = []
  let cur = ''
  let inQuote = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      inQuote = !inQuote
    } else if (c === ',' && !inQuote) {
      cols.push(cur)
      cur = ''
    } else {
      cur += c
    }
  }
  cols.push(cur)
  return cols
}

/**
 * Fetch and parse a CSV file from the public directory.
 * @param {string} path - e.g. '/config/students_raw.csv'
 */
export async function fetchCSV(path) {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`Failed to load CSV: ${path} (${res.status})`)
  const text = await res.text()
  return parseCSV(text)
}
