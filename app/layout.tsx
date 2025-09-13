import type { Metadata } from 'next'
import Footer from '../components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'LuxyLyfe - Luxury Homes',
  description: 'Luxury Homes Website',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
  <body>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
