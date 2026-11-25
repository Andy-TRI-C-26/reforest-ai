'use client'

import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useZones } from '@/components/ZonesProvider'
import { Badge, PageContainer } from '@/components/ui'
import { useApiAll } from '@/hooks/useApi'

const monitoringPath = (zoneId) => `/zones/${zoneId}/monitoring`
const TICK = { fill: '#6F778E', fontSize: 11, fontFamily: 'var(--font-mono)' }

const METRICS = {
  ndvi: { label: 'NDVI', restored: 'restored_ndvi', unrestored: 'unrestored_ndvi' },
  nbr: { label: 'NBR', restored: 'restored_nbr', unrestored: 'unrestored_nbr' },
}
const RESOLUTIONS = {
  monthly: { label: 'Bulanan', key: 'monthly_series' },
  quarterly: { label: 'Kuartalan', key: 'series' },
}
const STATUSES = [
  { match: 'Kritis', tone: 'error', dot: '#EF4444' },
  { match: 'Awal', tone: 'warning', dot: '#F59E0B' },
  { match: 'Progresif', tone: 'success', dot: '#10B981' },
]
const statusStyle = (status = '') => STATUSES.find((s) => status.includes(s.match)) ?? { tone: 'warning', dot: '#F59E0B' }

function Segmented({ value, onChange, options, label }) {
  return (
    <div role="group" aria-label={label} className="flex gap-1 rounded-md bg-surface p-1 ring-1 ring-line">
      {Object.entries(options).map(([key, o]) => (
        <button
          key={key} onClick={() => onChange(key)} aria-pressed={value === key}
          className={`rounded px-3 py-1 text-xs font-semibold ${value === key ? 'bg-primary text-white' : 'text-muted hover:text-ink'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Stat({ label, value, children }) {
  return (
    <div className="rounded-lg border border-line bg-white px-4 py-3 shadow-sm">
      <p className="text-xs text-outline">{label}</p>
      <div className="mt-1 font-display text-xl font-bold">{value}</div>
      {children}
    </div>
  )
}

export default function GreenMonitorView() {
  const { zones, selected, setSelected, source } = useZones()
  const [metric, setMetric] = useState('ndvi')
  const [resolution, setResolution] = useState('monthly')
  const zone = zones.find((z) => z.id === selected) ?? zones[0]
  const { data: monitoring, loading, failed } = useApiAll(source === 'api' ? zones.map((z) => z.id) : [], monitoringPath)
  const mon = monitoring[zone.id]

  const m = METRICS[metric]
  const points = mon?.[RESOLUTIONS[resolution].key] ?? []
  const chartData = points.map((p) => ({
    label: p.period,
    restored: p[m.restored],
    unrestored: p[m.unrestored],
    baseline: metric === 'ndvi' ? p.baseline_ndvi : undefined,
  }))
  const baseline = points.at(-1)?.baseline_ndvi

  const rows = [...zones]
    .sort((a, b) => a.ndvi - b.ndvi)
    .map((z) => ({ ...z, mon: monitoring[z.id] }))
  const statusCounts = STATUSES.map((s) => ({
    ...s,
    count: rows.filter((r) => r.mon && statusStyle(r.mon.recovery_status).match === s.match).length,
  }))
  const emptyText = loading ? 'Memuat data pemantauan…' : 'Time-series tidak tersedia — backend tidak terjangkau.'

  return (
    <PageContainer>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-display text-2xl font-bold">Pemantauan tren vegetasi (time-series NDVI &amp; NBR)</h1>
          <p className="mt-1 text-sm text-muted">
            Pembandingan zona yang direstorasi dengan zona tanpa intervensi terhadap baseline hutan gambut sehat.
          </p>
        </div>
        {mon && (
          <div className="flex flex-wrap gap-2">
            {statusCounts.map((s) => (
              <Badge key={s.match} tone={s.tone} dot={s.dot}>
                {s.match === 'Kritis' ? 'Stagnan / kritis' : s.match === 'Awal' ? 'Regenerasi awal' : 'Pemulihan progresif'}: {s.count} zona
              </Badge>
            ))}
          </div>
        )}
      </section>

      {failed > 0 && (
        <p role="alert" className="rounded-md bg-warn-soft px-3 py-2 text-sm text-warn-ink">
          Data pemantauan untuk {failed} zona gagal dimuat.
        </p>
      )}

      {mon && (
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Ringkasan zona terpilih">
          <Stat label="Total area terdampak" value={`${mon.total_impacted_ha.toLocaleString('id-ID', { maximumFractionDigits: 1 })} Ha`} />
          <Stat label="Pemulihan kanopi" value={`${mon.canopy_recovery_percent}%`} />
          <Stat label="Indeks kesehatan gambut" value={mon.peat_health_index.toFixed(1)} />
          <Stat label="Status pemulihan" value={<Badge tone={statusStyle(mon.recovery_status).tone} dot={statusStyle(mon.recovery_status).dot}>{mon.recovery_status}</Badge>} />
        </section>
      )}

      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold">Kurva pemulihan indeks vegetasi</h2>
            <label className="mt-1 flex items-center gap-2 text-xs text-outline">
              Zona
              <select
                value={zone.id} onChange={(e) => setSelected(e.target.value)}
                className="rounded border border-line bg-white px-2 py-1 text-xs text-ink"
              >
                {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Segmented value={metric} onChange={setMetric} options={METRICS} label="Indeks" />
            <Segmented value={resolution} onChange={setResolution} options={RESOLUTIONS} label="Resolusi waktu" />
          </div>
        </header>

        {chartData.length === 0 ? (
          <p className="grid h-72 place-items-center text-sm text-outline">{emptyText}</p>
        ) : (
          <>
            <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
              {metric === 'ndvi' && baseline != null && (
                <li className="flex items-center gap-2"><span className="w-5 border-t-2 border-dashed border-outline" />Baseline gambut sehat (NDVI {baseline.toFixed(2)})</li>
              )}
              <li className="flex items-center gap-2"><span className="h-0.5 w-5 bg-forest" />Direstorasi</li>
              <li className="flex items-center gap-2"><span className="h-0.5 w-5 bg-hydro" />Kontrol (tanpa intervensi)</li>
            </ul>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="restoredFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
                  <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} minTickGap={12} />
                  <YAxis domain={metric === 'ndvi' ? [0, 1] : ['auto', 'auto']} tick={TICK} axisLine={false} tickLine={false} />
                  {metric === 'nbr' && <ReferenceLine y={0} stroke="#94A3B8" />}
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12 }}
                    formatter={(v) => (typeof v === 'number' ? v.toFixed(3) : v)}
                  />
                  {metric === 'ndvi' && (
                    <Area type="monotone" dataKey="baseline" name="Baseline sehat" stroke="#6F778E" strokeWidth={1.5} strokeDasharray="6 4" fill="transparent" />
                  )}
                  <Area type="monotone" dataKey="restored" name={`${m.label} direstorasi`} stroke="#10B981" strokeWidth={3} fill="url(#restoredFill)" />
                  <Area type="monotone" dataKey="unrestored" name={`${m.label} kontrol`} stroke="#0284C7" strokeWidth={2.5} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </section>

      <section className="rounded-lg border border-line bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
          <h2 className="font-display text-base font-semibold">Kondisi pemulihan per zona</h2>
          <span className="text-xs text-outline">Klik nama zona untuk menampilkannya di grafik</span>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-surface text-xs text-muted">
              <tr>
                <th className="px-5 py-2.5 font-semibold">Zona &amp; luas</th>
                <th className="px-3 py-2.5 font-semibold">NDVI</th>
                <th className="px-3 py-2.5 font-semibold">NBR pra → pasca</th>
                <th className="px-3 py-2.5 font-semibold">TMAT</th>
                <th className="px-3 py-2.5 font-semibold">Pemulihan kanopi</th>
                <th className="px-3 py-2.5 font-semibold">Indeks kesehatan gambut</th>
                <th className="px-5 py-2.5 font-semibold">Status pemulihan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((z) => {
                const st = statusStyle(z.mon?.recovery_status)
                return (
                  <tr key={z.id} className={z.id === zone.id ? 'bg-primary-soft/30' : 'hover:bg-surface/60'}>
                    <td className="px-5 py-3">
                      <button onClick={() => setSelected(z.id)} className="block text-left font-medium hover:underline">{z.name}</button>
                      <span className="font-mono text-xs text-outline">{z.id} · {z.area} Ha</span>
                    </td>
                    <td className="px-3 py-3 font-mono">{z.ndvi.toFixed(2)}</td>
                    <td className="px-3 py-3 font-mono">{z.nbrPre.toFixed(2)} → {z.nbrPost.toFixed(2)}</td>
                    <td className="px-3 py-3 font-mono text-hydro">{z.watertable} cm</td>
                    <td className="px-3 py-3 font-mono">{z.mon ? `${z.mon.canopy_recovery_percent}%` : '—'}</td>
                    <td className="px-3 py-3 font-mono">{z.mon ? z.mon.peat_health_index.toFixed(1) : '—'}</td>
                    <td className="px-5 py-3">
                      {z.mon ? <Badge tone={st.tone} dot={st.dot}>{z.mon.recovery_status}</Badge> : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </PageContainer>
  )
}
