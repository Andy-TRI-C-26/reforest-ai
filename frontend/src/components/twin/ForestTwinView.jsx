'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useZones } from '@/components/ZonesProvider'
import useApi from '@/hooks/useApi'
import { apiPost } from '@/lib/api'

const GambutScene = dynamic(() => import('./GambutScene'), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-panel-muted">Memuat scene 3D…</div>,
})

function Metric({ label, value, className }) {
  return (
    <div className="rounded-md border border-panel-line bg-panel/90 px-3 py-2 backdrop-blur">
      <span className="block text-[11px] text-panel-muted">{label}</span>
      <span className={`font-mono text-base font-bold sm:text-lg ${className}`}>{value}</span>
    </div>
  )
}

export default function ForestTwinView() {
  const { zones, selected, source } = useZones()
  const [year, setYear] = useState(5)
  const [sim, setSim] = useState({ data: null, error: '' })
  const zone = zones.find((z) => z.id === selected) ?? zones[0]
  const live = source === 'api'
  const { data: rec } = useApi(live && zone ? `/zones/${zone.id}/recommendation` : null)

  // Nilai skenario dihitung backend (POST /api/scenarios). Jeda singkat agar geser slider tidak membanjiri API.
  useEffect(() => {
    if (!live || !zone) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      apiPost('/scenarios', { zone_id: zone.id, year }, { signal: controller.signal })
        .then((data) => setSim({ data, error: '' }))
        .catch((err) => {
          if (err.name !== 'AbortError') setSim({ data: null, error: err.message })
        })
    }, 150)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [zone, year, live])

  // Hasil milik zona lain tidak ditampilkan; hasil tahun sebelumnya tetap dipakai sampai yang baru tiba.
  const scenario = sim.data?.zone_id === zone?.id ? sim.data : null
  const dash = '—'

  return (
    <section className="relative isolate min-h-[760px] flex-1 overflow-hidden bg-map text-white lg:min-h-0">
      <div className="absolute inset-0">{zone && <GambutScene zone={zone} scenario={scenario} />}</div>

      <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="pointer-events-auto max-w-xl rounded-lg border border-panel-line bg-panel/90 p-4 backdrop-blur">
          <p className="flex items-center gap-2 text-xs text-panel-muted">
            <span className="size-2 rounded-full bg-forest" />
            Simulasi 3D topografi gambut · {zone?.name}
          </p>
          <h1 className="mt-1 font-display text-lg font-semibold leading-snug">Tahun {year}</h1>
          {!live && <p className="mt-1 text-sm text-warn">Simulasi membutuhkan backend, yang saat ini tidak terjangkau.</p>}
          {sim.error && <p role="alert" className="mt-1 text-sm text-danger">{sim.error}</p>}
          {rec && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {[...rec.actions].sort((a, b) => a.step - b.step).map((a) => {
                const done = a.target_year <= year
                return (
                  <li
                    key={a.step}
                    className={`rounded-full px-2.5 py-1 text-xs ring-1 ${done ? 'bg-forest/20 text-forest ring-forest/40' : 'text-panel-muted ring-panel-line'}`}
                  >
                    Thn {a.target_year} · {a.action}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        <div className="pointer-events-auto grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric label="Tinggi muka air" value={scenario ? `${scenario.water_table_cm.toFixed(1)} cm` : dash} className="text-sky-400" />
          <Metric label="Pemulihan kanopi" value={scenario ? `${scenario.canopy_recovery_percent.toFixed(0)}%` : dash} className="text-forest" />
          <Metric label="Serapan karbon" value={scenario ? `${scenario.carbon_sequestration_t_per_ha.toFixed(1)} tC/Ha` : dash} className="text-white" />
          <Metric label="Pohon restorasi" value={scenario ? scenario.restored_tree_count : dash} className="text-white" />
        </div>
      </div>

      <section
        aria-label="Kontrol skenario dan lini masa 3D"
        className="absolute inset-x-3 bottom-3 z-10 rounded-lg border border-panel-line bg-panel/90 p-4 backdrop-blur"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
          <div className="shrink-0">
            <p className="mb-1.5 text-xs text-panel-muted">Skenario intervensi</p>
            <div className="flex gap-1 rounded-md bg-black/25 p-1">
              <button
                disabled
                title="Skenario tanpa intervensi belum didukung backend"
                className="cursor-not-allowed rounded px-3 py-1.5 text-xs font-semibold text-panel-muted opacity-40"
              >
                Tanpa intervensi
              </button>
              <button aria-pressed="true" className="rounded bg-forest px-3 py-1.5 text-xs font-semibold text-[#002113]">
                Rewetting + tanam spesies gambut
              </button>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="year" className="text-xs text-panel-muted">Proyeksi lini masa restorasi</label>
              <span className="font-mono text-sm font-bold text-forest">Tahun {year}</span>
            </div>
            <input
              id="year" type="range" min="0" max="10" step="1" value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full accent-forest"
            />
            <div className="mt-1 flex justify-between text-[11px] text-panel-muted">
              <span>Thn 0</span>
              <span>Thn 5</span>
              <span>Thn 10</span>
            </div>
          </div>
        </div>
      </section>
    </section>
  )
}
