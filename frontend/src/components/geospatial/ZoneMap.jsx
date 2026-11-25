'use client'

import { useEffect, useState } from 'react'
import { MapContainer, Polygon, TileLayer, Tooltip, ZoomControl, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const FALLBACK_CENTER = [-2.3456, 114.089]

const PRIORITY_COLORS = { PRIORITY_1: '#EF4444', PRIORITY_2: '#F59E0B', PRIORITY_3: '#10B981' }
const NDVI_CLASSES = [
  { min: 0.6, color: '#22c55e', label: 'Tinggi', range: '> 0.60' },
  { min: 0.45, color: '#84cc16', label: 'Sedang', range: '0.45 – 0.60' },
  { min: 0.3, color: '#F59E0B', label: 'Rendah', range: '0.30 – 0.45' },
  { min: -Infinity, color: '#EF4444', label: 'Sangat rendah', range: '< 0.30' },
]
const ndviClass = (ndvi) => NDVI_CLASSES.find((c) => ndvi > c.min) ?? NDVI_CLASSES.at(-1)

export function fillFor(zone, layer) {
  if (layer === 'priority') return PRIORITY_COLORS[zone.priorityCode] ?? '#94A3B8'
  if (layer === 'ndvi') return ndviClass(zone.ndvi).color
  return zone.severityColor
}

// Legenda mengikuti layer yang sedang tampil di peta.
export function legendFor(layer, severityClasses, priorityLabels) {
  if (layer === 'ndvi') return { title: 'Legenda NDVI', rows: NDVI_CLASSES.map((c) => ({ color: c.color, label: c.label, range: c.range })) }
  if (layer === 'priority') return { title: 'Legenda prioritas restorasi', rows: priorityLabels.map((p) => ({ color: PRIORITY_COLORS[p.code], label: p.label, range: '' })) }
  return { title: 'Legenda keparahan', rows: severityClasses.map((c) => ({ color: c.color, label: c.short, range: c.range })) }
}

function FocusZone({ zone, tick }) {
  const map = useMap()
  useEffect(() => {
    if (tick > 0 && zone) map.flyToBounds(zone.coords, { padding: [48, 48], maxZoom: 14, duration: 0.8 })
  }, [map, tick]) // eslint-disable-line -- hanya saat tombol "fokus" ditekan
  return null
}

function Readout() {
  const map = useMap()
  const [pos, setPos] = useState(null)
  const [zoom, setZoom] = useState(map.getZoom())
  useMapEvents({
    mousemove: (e) => setPos(e.latlng),
    mouseout: () => setPos(null),
    zoomend: () => setZoom(map.getZoom()),
  })
  const c = pos ?? map.getCenter()
  const lat = `${Math.abs(c.lat).toFixed(4)}° ${c.lat < 0 ? 'LS' : 'LU'}`
  const lng = `${Math.abs(c.lng).toFixed(4)}° ${c.lng < 0 ? 'BB' : 'BT'}`
  return (
    <div className="pointer-events-none absolute bottom-3 right-14 z-[1000] hidden items-center gap-2 rounded-full border border-panel-line bg-panel/95 px-3 py-1 font-mono text-[11px] text-panel-muted sm:flex">
      <span>{lat}, {lng}</span>
      <span aria-hidden>|</span>
      <span>Zoom {zoom}</span>
    </div>
  )
}

export default function ZoneMap({ zones, selected, onSelect, layer, tileOpacity, focusTick }) {
  const [tileFallback, setTileFallback] = useState(false)
  const selectedZone = zones.find((z) => z.id === selected)

  // Bingkai awal = seluruh zona, dengan ruang untuk panel layer (kiri) dan KPI (atas) di layar lebar.
  const [initialView] = useState(() => {
    const points = zones.flatMap((z) => z.coords)
    if (!points.length) return { center: FALLBACK_CENTER, zoom: 12 }
    const wide = window.innerWidth >= 1024
    return {
      bounds: points,
      boundsOptions: { paddingTopLeft: [wide ? 320 : 24, wide ? 100 : 24], paddingBottomRight: [24, 24], maxZoom: 14 },
    }
  })

  return (
    <MapContainer {...initialView} minZoom={10} zoomControl={false} className="h-full w-full bg-map!">
      {tileFallback ? (
        <TileLayer
          attribution="Tiles &copy; Esri"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        />
      ) : (
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={tileOpacity}
          eventHandlers={{ tileerror: () => setTileFallback(true) }}
        />
      )}
      <ZoomControl position="bottomright" />
      {zones.map((zone) => {
        const isSelected = zone.id === selected
        const color = fillFor(zone, layer)
        return (
          <Polygon
            key={zone.id}
            positions={zone.coords}
            pathOptions={{
              color: isSelected ? '#FFFFFF' : color,
              fillColor: color,
              fillOpacity: isSelected ? 0.55 : 0.35,
              weight: isSelected ? 2.5 : 1.5,
            }}
            eventHandlers={{ click: () => onSelect(zone.id) }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1}>
              <b className="font-mono">{zone.id}</b>
              <br />
              dNBR {zone.dnbr.toFixed(2)} · {zone.severity}<br />{zone.priorityLabel}
            </Tooltip>
          </Polygon>
        )
      })}
      <FocusZone zone={selectedZone} tick={focusTick} />
      <Readout />
    </MapContainer>
  )
}
