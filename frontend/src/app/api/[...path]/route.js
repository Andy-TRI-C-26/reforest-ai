// Pengganti `location /api/ { proxy_pass http://backend:8080; }` di nginx.conf.
// Dibaca saat runtime, jadi BACKEND_URL bisa diganti tanpa build ulang.
export const dynamic = 'force-dynamic'

const BACKEND = (process.env.BACKEND_URL || 'http://localhost:8080').replace(/\/$/, '')
const SKIP = ['connection', 'keep-alive', 'transfer-encoding', 'content-encoding', 'content-length', 'host']

async function proxy(request, { params }) {
  const { path } = await params
  const { search } = new URL(request.url)
  const target = `${BACKEND}/api/${path.map(encodeURIComponent).join('/')}${search}`

  const headers = new Headers(request.headers)
  SKIP.forEach((h) => headers.delete(h))
  const hasBody = !['GET', 'HEAD'].includes(request.method)

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: 'no-store',
      redirect: 'manual',
    })
    const out = new Headers(upstream.headers)
    SKIP.forEach((h) => out.delete(h))
    return new Response(upstream.body, { status: upstream.status, headers: out })
  } catch {
    return Response.json({ error: 'Backend tidak terjangkau' }, { status: 502 })
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE }
