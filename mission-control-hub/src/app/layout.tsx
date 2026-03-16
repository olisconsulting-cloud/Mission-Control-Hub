import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' })

export const metadata: Metadata = {
  title: {
    default: 'Mission Control Hub',
    template: '%s | Mission Control Hub',
  },
  description: 'AI-powered mission control for teams. Manage agents, track tasks, ship faster.',
  keywords: ['AI', 'mission control', 'project management', 'kanban', 'agents'],
  openGraph: {
    title: 'Mission Control Hub',
    description: 'AI-powered mission control for teams',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} grid-bg font-[family-name:var(--font-body)]`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
