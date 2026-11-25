'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { LoaderCircle, TriangleAlert } from 'lucide-react'
import { apiGet } from '@/lib/api'
import { normalizeZones } from '@/lib/zones'

const ZonesContext = createContext(null)

export function useZones() {
  const ctx = useContext(ZonesContext)
  if (!ctx) throw new Error('useZones harus dipakai di dalam <ZonesProvider>')
  return ctx
}

export function ZonesProvider({ children }) {
  const [zones, setZones] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [source, setSource] = useState('api') // api | local
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const data = await apiGet('/zones')
        return { zones: normalizeZones(data), source: 'api', note: '' }
      } catch (apiError) {
        // Backend tidak terjangkau -> pakai GeoJSON bawaan supaya UI tetap bisa dipakai.
        const res = await fetch('/data/tumbang-nusa-zones.geojson')
        if (!res.ok) throw apiError
        return { zones: normalizeZones(await res.json()), source: 'local', note: apiError.message }
      }
    }

    load()
      .then((result) => {
        if (!active) return
        setZones(result.zones)
        setSource(result.source)
        setError(result.note)
        setSelected((current) => current ?? result.zones[0]?.id ?? null)
        setStatus('ready')
      })
      .catch((err) => {
        if (!active) return
        setError(err.message)
        setStatus('error')
      })

    return () => {
      active = false
    }
  }, [attempt])

  const retry = useCallback(() => {
    setStatus('loading')
    setAttempt((n) => n + 1)
  }, [])

  const value = useMemo(
    () => ({ zones, status, source, error, selected, setSelected, retry }),
    [zones, status, source, error, selected, retry],
  )

  return <ZonesContext.Provider value={value}>{children}</ZonesContext.Provider>
}

// Menahan konten halaman sampai data zona siap.
export function ZonesGate({ children }) {
  const { status, error, retry } = useZones()

  if (status === 'loading') {
    return (
      <div className="flex flex-1 items-center justify-center gap-2 p-10 text-sm text-muted" role="status">
        <LoaderCircle className="size-4 animate-spin" />
        Memuat data geospasial…
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-md rounded-lg border border-danger bg-danger-soft p-5 text-danger-ink">
          <p className="flex items-center gap-2 font-semibold">
            <TriangleAlert className="size-4" /> Gagal memuat data zona
          </p>
          <p className="mt-1 text-sm">{error}</p>
          <button
            onClick={retry}
            className="mt-3 rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Coba lagi
          </button>
        </div>
      </div>
    )
  }

  return children
}
