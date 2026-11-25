import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/archivo'
import '@fontsource-variable/jetbrains-mono'
import './globals.css'
import { ZonesProvider, ZonesGate } from '@/components/ZonesProvider'
import TopNav from '@/components/TopNav'

export const metadata = {
  title: { default: 'REFOREST AI — Tumbang Nusa', template: '%s · REFOREST AI' },
  description: 'Intelijen restorasi gambut KHDTK Tumbang Nusa: peta keparahan kebakaran, rekomendasi restorasi, pemantauan vegetasi, dan digital twin hutan.',
}

export const viewport = { themeColor: '#0b1311' }

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <ZonesProvider>
          <div className="flex min-h-dvh flex-col lg:h-dvh">
            <TopNav />
            <main className="flex flex-1 flex-col lg:min-h-0">
              <ZonesGate>{children}</ZonesGate>
            </main>
          </div>
        </ZonesProvider>
      </body>
    </html>
  )
}
