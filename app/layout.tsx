import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Providers } from '@/components/providers'
import { Header } from '@/components/header'

const _geist = Geist({ 
  subsets: ["latin"],
  variable: "--font-geist-sans"
});
const _geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono"
});

export const metadata: Metadata = {
  title: 'Reflow - On-Chain Activity Indexer',
  description: 'Web3 analytics dashboard for DeFi protocols',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${_geist.variable} ${_geistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background min-h-screen">
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
