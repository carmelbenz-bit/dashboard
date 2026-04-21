import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'ניהול תיקים - מערכת לעורכי דין',
  description: 'מערכת ניהול משימות ותיקים לעורכי דין',
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
