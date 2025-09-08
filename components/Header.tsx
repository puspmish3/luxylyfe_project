import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/50 fixed w-full top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          LuxyLyfe
        </h1>
      </div>
    </header>
  )
}
