'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, Box, Leaf, Map as MapIcon, MapPin, TreePine, WifiOff } from 'lucide-react'
import { useZones } from './ZonesProvider'

export const MODULES = [
  { href: '/geospatial', label: 'Geospatial Map', icon: MapIcon },
  { href: '/eco-recommend', label: 'EcoRecommend', icon: Leaf },
  { href: '/green-monitor', label: 'Green Monitor', icon: Activity },
  { href: '/forest-digital-twin', label: 'Forest Digital Twin', icon: Box },
]

export default function TopNav() {
  const pathname = usePathname()
  const { source, status } = useZones()

  return (
    <header className="sticky top-0 z-[2000] shrink-0 border-b border-line bg-white">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 lg:gap-x-6 py-2 lg:px-6">
        <div className="flex items-center gap-3">
          <Link href="/geospatial" className="flex items-center gap-3" aria-label="REFOREST AI — ke peta">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-white">
              <TreePine className="size-5" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-base font-semibold">REFOREST AI</span>
              <span className="hidden text-xs text-muted sm:block">Intelijen Restorasi Gambut</span>
            </span>
          </Link>
          <span className="hidden items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-line 2xl:inline-flex">
            <MapPin className="size-3.5" /> KHDTK Tumbang Nusa, Pulang Pisau
          </span>
        </div>

        <nav aria-label="Modul REFOREST AI" className="order-3 -mx-4 w-[calc(100%+2rem)] overflow-x-auto px-4 lg:order-none lg:mx-0 lg:w-auto lg:flex-1 lg:px-0">
          <ul className="flex gap-1">
            {MODULES.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      active ? 'bg-primary text-white' : 'text-muted hover:bg-surface hover:text-ink'
                    }`}
                  >
                    <Icon className="size-4" />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-3">
          {status === 'ready' && source === 'local' && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-warn-soft px-2.5 py-1 text-xs font-semibold text-warn-ink"
              title="Backend tidak terjangkau. Memakai data GeoJSON bawaan; rekomendasi dan time-series tidak tersedia."
            >
              <WifiOff className="size-3.5" /> Data lokal
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
