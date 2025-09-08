import type { Metadata } from 'next'
import Header from '../components/Header'
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
      <body className="pt-20">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
