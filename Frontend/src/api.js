export async function apiGet(path) {
  const response = await fetch(`/api${path}`)
  if (!response.ok) {
    throw new Error(`API ${path} gagal: ${response.status}`)
  }
  return response.json()
}

export async function apiPost(path, body) {
  const response = await fetch(`/api${path}`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`API ${path} gagal: ${response.status}`)
  return response.json()
}
