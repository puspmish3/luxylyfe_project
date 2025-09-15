import Link from 'next/link'

export default function Header() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/40">
      <div className="container mx-auto px-4">
        <nav className="flex h-16 items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              LuxyLyfe
            </span>
          </Link>

          <ul className="hidden md:flex items-center gap-6 text-slate-700">
            <li><Link href="/mission" className="hover:text-emerald-700 transition-colors">Mission</Link></li>
            <li><Link href="/vision" className="hover:text-emerald-700 transition-colors">Vision</Link></li>
            <li><Link href="/projects" className="hover:text-emerald-700 transition-colors">Projects</Link></li>
            <li><Link href="/about-us" className="hover:text-emerald-700 transition-colors">About</Link></li>
            <li><Link href="/contact-us" className="hover:text-emerald-700 transition-colors">Contact</Link></li>
          </ul>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 transition shadow-sm">
              Login
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
