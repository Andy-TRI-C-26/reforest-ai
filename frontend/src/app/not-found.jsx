import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="font-display text-2xl font-bold">Halaman tidak ditemukan</h1>
      <Link href="/geospatial" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
        Kembali ke peta
      </Link>
    </div>
  )
}
