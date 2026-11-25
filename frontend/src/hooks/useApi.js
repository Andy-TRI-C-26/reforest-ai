'use client'

import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'

const IDLE = { data: null, loading: false, error: '' }
const LOADING = { data: null, loading: true, error: '' }

// path = null -> request dilewati (mis. saat backend tidak tersedia).
export default function useApi(path) {
  const [result, setResult] = useState({ path: null, data: null, error: '' })

  useEffect(() => {
    if (!path) return
    const controller = new AbortController()
    apiGet(path, { signal: controller.signal })
      .then((data) => setResult({ path, data, error: '' }))
      .catch((err) => {
        if (err.name !== 'AbortError') setResult({ path, data: null, error: err.message })
      })
    return () => controller.abort()
  }, [path])

  if (!path) return IDLE
  if (result.path !== path) return LOADING // hasil lama milik path sebelumnya
  return { data: result.data, loading: false, error: result.error }
}

// Ambil satu endpoint untuk banyak key sekaligus (mis. rekomendasi tiap zona).
// pathFor harus fungsi stabil (didefinisikan di luar komponen). keys = [] -> dilewati.
export function useApiAll(keys, pathFor) {
  const signature = keys.join('|')
  const [result, setResult] = useState({ signature: null, data: {}, failed: 0 })

  useEffect(() => {
    if (!signature) return
    const controller = new AbortController()
    const list = signature.split('|')
    Promise.allSettled(list.map((key) => apiGet(pathFor(key), { signal: controller.signal }))).then((settled) => {
      if (controller.signal.aborted) return
      const data = {}
      let failed = 0
      settled.forEach((s, i) => {
        if (s.status === 'fulfilled') data[list[i]] = s.value
        else failed += 1
      })
      setResult({ signature, data, failed })
    })
    return () => controller.abort()
  }, [signature, pathFor])

  const loading = Boolean(signature) && result.signature !== signature
  return { data: loading || !signature ? {} : result.data, loading, failed: loading ? 0 : result.failed }
}
