// Pengganti `location = /health` di nginx.conf (health check diteruskan ke backend).
export const dynamic = 'force-dynamic'

const BACKEND = (process.env.BACKEND_URL || 'http://localhost:8080').replace(/\/$/, '')

export async function GET() {
  try {
    const upstream = await fetch(`${BACKEND}/health`, { cache: 'no-store' })
    return new Response(upstream.body, { status: upstream.status })
  } catch {
    return new Response('backend tidak terjangkau', { status: 502 })
  }
}
