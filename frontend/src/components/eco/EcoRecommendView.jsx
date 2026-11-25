'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Download, Filter } from 'lucide-react'
import { useZones } from '@/components/ZonesProvider'
import { Badge, PageContainer } from '@/components/ui'
import { useApiAll } from '@/hooks/useApi'
import { priorityTone } from '@/lib/zones'

const recommendationPath = (zoneId) => `/zones/${zoneId}/recommendation`
const number = (n) => n.toLocaleString('id-ID')

function Recommendation({ rec, state }) {
  if (!rec) {
    return (
      <p className="text-sm text-muted">
        {state === 'loading' ? 'Memuat rekomendasi…' : 'Rekomendasi belum tersedia (butuh backend).'}
      </p>
    )
  }
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Intervensi utama: {rec.strategy}</h3>
      <ol className="space-y-1 text-sm text-muted">
        {[...rec.actions].sort((a, b) => a.step - b.step).map((a) => (
          <li key={a.step} className="flex gap-2">
            <span className="font-mono text-xs text-outline">{a.step}.</span>
            <span>
              {a.action} <span className="text-outline">· tahun {a.target_year}</span>
            </span>
          </li>
        ))}
      </ol>
      <ul className="flex flex-wrap gap-1.5">
        {rec.species.map((s) => (
          <li key={s.latin_name} className="rounded-full bg-white px-2.5 py-1 text-xs ring-1 ring-line">
            {s.common_name} <i className="text-outline">{s.latin_name}</i>
            <span className="ml-1 font-mono text-primary">{number(s.seedlings_per_ha)}/ha</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function EcoCard({ zone, rank, rec, state, onSimulate }) {
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-line bg-white p-5 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold leading-snug">{rank}. {zone.name}</h2>
          <p className="mt-0.5 text-xs text-outline">
            <span className="font-mono">{zone.id}</span> · dNBR +{zone.dnbr.toFixed(2)} · {zone.area} Ha · gambut {zone.depth.toFixed(1)} m
          </p>
        </div>
        <Badge tone={zone.tone} dot={zone.severityColor} className="shrink-0">{zone.severityShort}</Badge>
      </header>

      <div className="flex flex-wrap gap-2">
        <Badge tone={priorityTone(zone.priorityCode)}>{zone.priorityLabel}</Badge>
        <Badge tone="hydro" dot="#0284C7">TMAT {zone.watertable} cm</Badge>
      </div>

      <div className="rounded-md bg-surface p-3">
        <Recommendation rec={rec} state={state} />
      </div>

      <footer className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-3">
        <dl className="text-xs">
          <div className="flex gap-2">
            <dt className="text-outline">Total bibit</dt>
            <dd className="font-mono font-semibold">{rec ? number(rec.total_seedlings) : '—'}</dd>
          </div>
          <div className="mt-1 flex gap-2">
            <dt className="text-outline">Kepadatan</dt>
            <dd className="font-mono font-semibold">{rec ? `${number(rec.seedlings_per_ha)} bibit/ha` : '—'}</dd>
          </div>
        </dl>
        <Link
          href="/forest-digital-twin"
          onClick={onSimulate}
          className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary/90"
        >
          Simulasi 3D
        </Link>
      </footer>
    </article>
  )
}

export default function EcoRecommendView() {
  const { zones, source, setSelected } = useZones()
  const [filter, setFilter] = useState('all')
  const { data: recs, loading, failed } = useApiAll(source === 'api' ? zones.map((z) => z.id) : [], recommendationPath)
  const state = loading ? 'loading' : 'idle'

  // Urut: prioritas restorasi (dari backend), lalu dNBR tertinggi.
  const visible = useMemo(() => {
    const sorted = [...zones].sort((a, b) => a.priorityCode.localeCompare(b.priorityCode) || b.dnbr - a.dnbr)
    if (filter === 'high') return sorted.filter((z) => z.high)
    if (filter === 'low') return sorted.filter((z) => !z.high)
    return sorted
  }, [zones, filter])

  const exportable = visible.filter((z) => recs[z.id])

  function exportCsv() {
    const rows = [
      ['zone_id', 'zone_name', 'severity', 'priority', 'area_ha', 'dnbr', 'water_table_cm', 'strategy', 'seedlings_per_ha', 'total_seedlings', 'actions', 'species'],
      ...exportable.map((z) => {
        const r = recs[z.id]
        return [
          z.id, z.name, z.severity, z.priorityLabel, z.area, z.dnbr, z.watertable,
          r.strategy, r.seedlings_per_ha, r.total_seedlings,
          r.actions.map((a) => `${a.step}. ${a.action} (tahun ${a.target_year})`).join('; '),
          r.species.map((s) => `${s.common_name} (${s.latin_name}) ${s.seedlings_per_ha}/ha`).join('; '),
        ]
      }),
    ]
    const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'rencana-restorasi.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PageContainer>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-display text-2xl font-bold">Rekomendasi strategi restorasi per zona</h1>
          <p className="mt-1 text-sm text-muted">
            Diurutkan menurut prioritas restorasi, lalu nilai dNBR tertinggi. Strategi, spesies, dan jumlah bibit dihitung backend dari data zona.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border border-line bg-white px-2.5 py-2">
            <Filter className="size-4 text-muted" />
            <select
              value={filter} onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter tingkat keparahan"
              className="bg-transparent text-sm outline-none"
            >
              <option value="all">Semua keparahan ({zones.length} zona)</option>
              <option value="high">Sedang-tinggi &amp; tinggi</option>
              <option value="low">Rendah – sedang-rendah</option>
            </select>
          </div>
          <button
            onClick={exportCsv}
            disabled={exportable.length === 0}
            title={exportable.length ? `Ekspor ${exportable.length} zona yang tampil` : 'Tidak ada rekomendasi untuk diekspor'}
            className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="size-4" /> Ekspor rencana (CSV)
          </button>
        </div>
      </section>

      {failed > 0 && (
        <p role="alert" className="rounded-md bg-warn-soft px-3 py-2 text-sm text-warn-ink">
          Rekomendasi untuk {failed} zona gagal dimuat.
        </p>
      )}

      <section aria-label="Daftar zona prioritas restorasi" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((z, i) => (
          <EcoCard key={z.id} zone={z} rank={i + 1} rec={recs[z.id]} state={state} onSimulate={() => setSelected(z.id)} />
        ))}
      </section>
    </PageContainer>
  )
}
