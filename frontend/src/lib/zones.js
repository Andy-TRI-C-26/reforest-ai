// Kelas keparahan: label dan ambang dNBR sama persis dengan backend
// (services/severity.rs). Warna sama dengan `severity_color` dari backend,
// supaya legenda dan poligon peta selalu cocok.
export const SEVERITY_CLASSES = [
  { label: 'Tidak Terbakar', short: 'Tidak terbakar', range: '< 0.10', color: '#2dd4bf', tone: 'success' },
  { label: 'Keparahan Rendah', short: 'Rendah', range: '0.10 – 0.26', color: '#55b5a1', tone: 'success' },
  { label: 'Keparahan Sedang-Rendah', short: 'Sedang-rendah', range: '0.27 – 0.43', color: '#eab308', tone: 'warning' },
  { label: 'Keparahan Sedang-Tinggi', short: 'Sedang-tinggi', range: '0.44 – 0.65', color: '#f97316', tone: 'warning' },
  { label: 'Keparahan Tinggi', short: 'Tinggi', range: '≥ 0.66', color: '#ef4444', tone: 'error' },
]

const BY_LABEL = Object.fromEntries(SEVERITY_CLASSES.map((c) => [c.label, c]))
const HIGH_LABELS = new Set(['Keparahan Sedang-Tinggi', 'Keparahan Tinggi'])

const PRIORITY_LABELS = {
  PRIORITY_1: 'Prioritas 1 - Kritis',
  PRIORITY_2: 'Prioritas 2 - Sedang',
  PRIORITY_3: 'Prioritas 3 - Alami',
}
const PRIORITY_TONES = { PRIORITY_1: 'error', PRIORITY_2: 'warning', PRIORITY_3: 'success' }
export const priorityTone = (code) => PRIORITY_TONES[code] ?? 'success'

// Hanya dipakai bila data tidak membawa label keparahan (mode data lokal).
function labelFromDnbr(dnbr) {
  if (dnbr < 0.1) return 'Tidak Terbakar'
  if (dnbr <= 0.26) return 'Keparahan Rendah'
  if (dnbr <= 0.43) return 'Keparahan Sedang-Rendah'
  if (dnbr <= 0.65) return 'Keparahan Sedang-Tinggi'
  return 'Keparahan Tinggi'
}

// Aturan yang sama dengan repository backend: prioritas diturunkan dari keparahan.
function priorityFromSeverity(label) {
  if (HIGH_LABELS.has(label)) return 'PRIORITY_1'
  if (label === 'Keparahan Sedang-Rendah') return 'PRIORITY_2'
  return 'PRIORITY_3'
}

// GeoJSON FeatureCollection -> daftar zona untuk UI.
// Keparahan dan prioritas SELALU dipercaya dari backend (bisa berasal dari prediksi model,
// jadi tidak boleh dihitung ulang dari dNBR di frontend).
export function normalizeZones(collection) {
  return (collection?.features ?? []).map((feature) => {
    const p = feature.properties
    const label = p.severity_label ?? p.severity ?? labelFromDnbr(p.dnbr)
    const cls = BY_LABEL[label] ?? BY_LABEL[labelFromDnbr(p.dnbr)]
    const priorityCode = p.priority ?? priorityFromSeverity(label)
    return {
      id: p.id,
      name: p.name,
      area: p.area_ha,
      nbrPre: p.nbr_pre,
      nbrPost: p.nbr_post,
      dnbr: p.dnbr,
      ndvi: p.ndvi,
      depth: p.peat_depth_m,
      distance: p.canal_distance_m,
      watertable: p.water_table_cm,
      severity: label,
      severityShort: cls.short,
      severityColor: p.severity_color ?? cls.color,
      tone: cls.tone,
      high: HIGH_LABELS.has(label),
      critical: label === 'Keparahan Tinggi',
      priorityCode,
      priorityLabel: p.priority_label ?? PRIORITY_LABELS[priorityCode],
      observedAt: p.observed_at ?? null,
      confidence: p.model_confidence ?? null,
      // GeoJSON = [lng, lat], Leaflet = [lat, lng]
      coords: feature.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]),
    }
  })
}

export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
