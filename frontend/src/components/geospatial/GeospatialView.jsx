'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Droplet, Flame, Layers, LocateFixed, Leaf, Sprout, TriangleAlert } from 'lucide-react'
import { useZones } from '@/components/ZonesProvider'
import { Badge } from '@/components/ui'
import useApi from '@/hooks/useApi'
import { SEVERITY_CLASSES, formatDate, priorityTone } from '@/lib/zones'
import { legendFor } from './ZoneMap'

// Leaflet butuh `window`, jadi hanya dirender di browser.
const ZoneMap = dynamic(() => import('./ZoneMap'), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-panel-muted">Memuat peta…</div>,
})

const LAYERS = [
  { id: 'dnbr', label: 'Keparahan (dNBR)' },
  { id: 'ndvi', label: 'NDVI (kerapatan vegetasi)' },
  { id: 'priority', label: 'Prioritas restorasi' },
]
const PRIORITIES = [
  { code: 'PRIORITY_1', label: 'Prioritas 1 - Kritis' },
  { code: 'PRIORITY_2', label: 'Prioritas 2 - Sedang' },
  { code: 'PRIORITY_3', label: 'Prioritas 3 - Alami' },
]

function Kpi({ icon: Icon, iconClass, label, value, valueClass = '', sub }) {
  return (
    <article className="rounded-md border border-panel-line bg-panel/95 px-3 py-2 text-white backdrop-blur">
      <header className="flex items-center justify-between gap-2 text-xs text-panel-muted">
        <h2 className="font-medium">{label}</h2>
        <Icon className={`size-4 ${iconClass}`} />
      </header>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <p className={`whitespace-nowrap font-display text-lg font-bold sm:text-xl ${valueClass}`}>{value}</p>
        <span className="truncate font-mono text-[11px] text-panel-muted">{sub}</span>
      </div>
    </article>
  )
}

// Metadata model dari GET /api/model/metadata. Hanya field yang ada yang ditampilkan.
function ModelSummary({ source }) {
  const { data } = useApi(source === 'api' ? '/model/metadata' : null)
  if (!data) return null
  const features = Array.isArray(data.feature_importance) ? data.feature_importance : []
  return (
    <div className="space-y-2 border-t border-panel-line pt-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{data.model ?? 'Model klasifikasi'}</h3>
        {typeof data.accuracy_percent === 'number' && (
          <span className="font-mono font-bold text-forest">{data.accuracy_percent.toFixed(1)}%</span>
        )}
      </div>
      {data.validation && <p className="text-panel-muted">Akurasi · validasi {data.validation}</p>}
      {features.length > 0 && (
        <ul className="space-y-1.5">
          {features.map((f) => (
            <li key={f.feature}>
              <div className="flex justify-between text-panel-muted">
                <span>{f.feature}</span>
                <span className="font-mono">{Number(f.importance).toFixed(2)}</span>
              </div>
              <div className="mt-0.5 h-1 rounded-full bg-panel-line">
                <div className="h-1 rounded-full bg-forest" style={{ width: `${Math.min(100, Math.max(0, f.importance * 100))}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function LayerPanel({ layer, setLayer, tileOn, setTileOn, opacity, setOpacity, source, observedAt }) {
  const legend = legendFor(layer, SEVERITY_CLASSES, PRIORITIES)
  return (
    <aside
      aria-label="Kontrol layer dan model"
      className="space-y-4 border-t border-panel-line bg-panel/95 p-4 text-sm text-white backdrop-blur lg:absolute lg:bottom-3 lg:left-3 lg:z-[1000] lg:max-h-[calc(100%-7.5rem)] lg:w-72 lg:overflow-y-auto lg:rounded-lg lg:border"
    >
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <Layers className="size-4 text-forest" /> Layer
        </h2>
        {observedAt && <span className="text-[11px] text-panel-muted">Observasi {formatDate(observedAt)}</span>}
      </div>

      <div className="space-y-2">
        <label className="flex items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-2">
            <input type="checkbox" checked={tileOn} onChange={(e) => setTileOn(e.target.checked)} className="accent-forest" />
            Peta dasar
          </span>
          <span className="font-mono text-forest">{opacity}%</span>
        </label>
        <input
          type="range" min="0" max="100" value={opacity} aria-label="Opasitas peta dasar"
          onChange={(e) => setOpacity(Number(e.target.value))}
          className="w-full accent-forest"
        />
      </div>

      <fieldset className="space-y-1.5">
        <legend className="sr-only">Layer data</legend>
        {LAYERS.map(({ id, label }) => (
          <label key={id} className="flex cursor-pointer items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-2">
              <input type="radio" name="layer" checked={layer === id} onChange={() => setLayer(id)} className="accent-forest" />
              {label}
            </span>
            <span className={layer === id ? 'text-forest' : 'text-panel-muted'}>{layer === id ? 'Aktif' : 'Off'}</span>
          </label>
        ))}
      </fieldset>

      <div className="space-y-1.5 border-t border-panel-line pt-3">
        <h3 className="text-xs font-semibold">{legend.title}</h3>
        {legend.rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <span className="size-3 rounded-sm" style={{ background: row.color }} />
              {row.label}
            </span>
            {row.range && <span className="font-mono text-[11px] text-panel-muted">{row.range}</span>}
          </div>
        ))}
      </div>

      <ModelSummary source={source} />
    </aside>
  )
}

function Row({ label, children }) {
  return (
    <>
      <dt className="text-panel-muted">{label}</dt>
      <dd className="text-right font-mono">{children}</dd>
    </>
  )
}

function Inspector({ zone, source, onFocus, onRecommend }) {
  const { data: mon } = useApi(source === 'api' ? `/zones/${zone.id}/monitoring` : null)
  return (
    <aside
      aria-label="Detail zona terpilih"
      className="flex shrink-0 flex-col justify-between gap-5 border-t border-panel-line bg-panel p-5 text-white lg:w-80 lg:overflow-y-auto lg:border-l lg:border-t-0 xl:w-[340px]"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs text-panel-muted">Zona terpilih</span>
            <h2 className="font-display text-lg font-semibold leading-snug">{zone.name}</h2>
            <p className="font-mono text-xs text-panel-muted">{zone.id} · {zone.area} Ha</p>
          </div>
          <button
            onClick={onFocus}
            aria-label="Fokuskan peta ke zona ini"
            title="Fokuskan peta ke zona ini"
            className="rounded-md border border-panel-line p-2 text-panel-muted hover:bg-panel-line hover:text-white"
          >
            <LocateFixed className="size-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge tone={zone.tone} dot={zone.severityColor}>{zone.severity}</Badge>
          <Badge tone={priorityTone(zone.priorityCode)}>{zone.priorityLabel}</Badge>
          <Badge tone="hydro" dot="#0284C7">TMAT {zone.watertable} cm</Badge>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border border-panel-line bg-black/20 p-3">
            <p className="text-xs text-panel-muted">Nilai dNBR</p>
            <p className={`font-mono text-xl font-bold ${zone.high ? 'text-danger' : 'text-warn'}`}>+{zone.dnbr.toFixed(2)}</p>
          </div>
          <div className="rounded-md border border-panel-line bg-black/20 p-3">
            <p className="text-xs text-panel-muted">NDVI pascabakar</p>
            <p className="font-mono text-xl font-bold text-warn">{zone.ndvi.toFixed(2)}</p>
          </div>
        </div>

        <div className="rounded-md border border-panel-line bg-black/20 p-3">
          <h3 className="mb-2 text-xs font-semibold">Kondisi gambut &amp; hidrologi</h3>
          <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 text-xs">
            <Row label="NBR pra → pasca">{zone.nbrPre.toFixed(2)} → {zone.nbrPost.toFixed(2)}</Row>
            <Row label="Kedalaman gambut">{zone.depth.toFixed(1)} m</Row>
            <Row label="Jarak ke kanal">{zone.distance} m</Row>
            {mon && (
              <>
                <Row label="Indeks kesehatan gambut">{mon.peat_health_index.toFixed(1)}</Row>
                <Row label="Pemulihan kanopi">{mon.canopy_recovery_percent}%</Row>
              </>
            )}
          </dl>
          {mon && <p className="mt-2 text-xs text-panel-muted">Status: {mon.recovery_status}</p>}
        </div>

        <p className="text-xs text-panel-muted">
          Observasi {formatDate(zone.observedAt)}
          {zone.confidence != null && ` · keyakinan model ${(zone.confidence * 100).toFixed(1)}%`}
        </p>
      </div>

      <div className="space-y-2">
        <button
          onClick={onRecommend}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-forest px-4 py-2.5 text-sm font-semibold text-[#002113] hover:bg-forest/90"
        >
          <Leaf className="size-4" /> Lihat rekomendasi restorasi
        </button>
        <p className="text-center text-xs text-panel-muted">Klik poligon zona pada peta untuk memperbarui inspeksi.</p>
      </div>
    </aside>
  )
}

export default function GeospatialView() {
  const router = useRouter()
  const { zones, selected, setSelected, source } = useZones()
  const [layer, setLayer] = useState('dnbr')
  const [opacity, setOpacity] = useState(85)
  const [tileOn, setTileOn] = useState(true)
  const [focusTick, setFocusTick] = useState(0)

  const zone = zones.find((z) => z.id === selected) ?? zones[0]
  const totalArea = zones.reduce((sum, z) => sum + z.area, 0)
  const highCount = zones.filter((z) => z.high).length
  const criticalCount = zones.filter((z) => z.critical).length
  const priority1 = zones.filter((z) => z.priorityCode === 'PRIORITY_1').length
  const avgNdvi = zones.reduce((sum, z) => sum + z.ndvi, 0) / (zones.length || 1)

  return (
    <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
      <section className="relative isolate flex flex-col bg-map lg:min-w-0 lg:flex-1">
        <div className="z-[1000] grid grid-cols-2 gap-2 p-2 lg:absolute lg:inset-x-3 lg:top-3 lg:grid-cols-4 lg:p-0">
          <Kpi
            icon={Flame} iconClass="text-orange-500" label="Total area terdampak"
            value={`${totalArea.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Ha`}
            sub={`${zones.length} zona`}
          />
          <Kpi
            icon={TriangleAlert} iconClass="text-danger" label="Keparahan sedang-tinggi+"
            value={`${highCount} zona`} valueClass="text-danger" sub={`${criticalCount} tinggi`}
          />
          <Kpi
            icon={Sprout} iconClass="text-forest" label="Rata-rata NDVI pasca"
            value={avgNdvi.toFixed(2)} sub="pascabakar"
          />
          <Kpi
            icon={Droplet} iconClass="text-hydro" label="Prioritas 1 restorasi"
            value={`${priority1} zona`} valueClass="text-forest" sub={`dari ${zones.length} zona`}
          />
        </div>

        <div className="relative h-[58dvh] min-h-[380px] lg:absolute lg:inset-0 lg:h-auto">
          <ZoneMap
            zones={zones} selected={zone?.id} onSelect={setSelected} layer={layer}
            tileOpacity={tileOn ? opacity / 100 : 0.3} focusTick={focusTick}
          />
        </div>

        <LayerPanel
          layer={layer} setLayer={setLayer} tileOn={tileOn} setTileOn={setTileOn}
          opacity={opacity} setOpacity={setOpacity} source={source} observedAt={zone?.observedAt}
        />
      </section>

      {zone && (
        <Inspector
          zone={zone} source={source}
          onFocus={() => setFocusTick((n) => n + 1)}
          onRecommend={() => router.push('/eco-recommend')}
        />
      )}
    </div>
  )
}
