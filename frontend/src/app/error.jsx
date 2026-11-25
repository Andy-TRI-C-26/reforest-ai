'use client'

export default function Error({ error, reset }) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="max-w-md rounded-lg border border-danger bg-danger-soft p-5 text-danger-ink">
        <p className="font-semibold">Terjadi kesalahan saat menampilkan halaman</p>
        <p className="mt-1 text-sm">{error.message}</p>
        <button onClick={reset} className="mt-3 rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white">
          Coba lagi
        </button>
      </div>
    </div>
  )
}
