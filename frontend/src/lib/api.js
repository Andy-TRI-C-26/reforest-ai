// Semua request lewat /api/* — diteruskan ke backend oleh route handler
// di src/app/api/[...path]/route.js (alamat backend dari env BACKEND_URL).
// Backend membalas error sebagai { error: { code, message } }.
async function request(path, init) {
  const response = await fetch(`/api${path}`, init)
  if (!response.ok) {
    let message = `API ${path} gagal: ${response.status}`
    try {
      const body = await response.json()
      if (body?.error?.message) message = body.error.message
    } catch {
      // body bukan JSON — pakai pesan bawaan
    }
    throw new Error(message)
  }
  return response.json()
}

export const apiGet = (path, init) => request(path, init)

export const apiPost = (path, body, init) =>
  request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    ...init,
  })
