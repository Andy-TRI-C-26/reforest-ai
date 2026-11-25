const TONES = {
  success: 'bg-primary-soft text-[#002111]',
  warning: 'bg-warn-soft text-warn-ink',
  error: 'bg-danger-soft text-danger-ink',
  hydro: 'bg-[#cce5ff] text-[#001d31]',
}

export function Badge({ tone = 'success', dot, children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold leading-none ${TONES[tone]} ${className}`}
    >
      {dot && <span className="size-2 shrink-0 rounded-full" style={{ background: dot }} />}
      {children}
    </span>
  )
}

export function PageContainer({ children }) {
  return (
    <div className="w-full lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 lg:px-6">{children}</div>
    </div>
  )
}
