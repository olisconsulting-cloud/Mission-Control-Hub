import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' })

export const metadata: Metadata = {
  title: 'Mission Control Hub',
  description: 'AI-powered mission control for teams',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} grid-bg font-[family-name:var(--font-body)]`}>
        {children}
      </body>
    </html>
  )
}
