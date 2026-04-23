import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: '#1d3461',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'ניהול תיקים',
  description: 'מערכת ניהול משימות ותיקים לעורכי דין',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ניהול תיקים',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="font-sans antialiased bg-background">
        {children}
      </body>
    </html>
  )
}
