import type { Metadata } from 'next'
import SplitSection from '@/components/SplitSection'

export const metadata: Metadata = {
  title: 'Contact Us | LuxyLyfe',
  description: 'Get in touch to inquire about luxury properties, viewings, or partnerships.',
}

export default function ContactUs() {
  return (
    <div>
      <SplitSection
        imageSrc="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1600&q=80"
        imageAlt="Professional customer care agent ready to assist"
        eyebrow="Get in touch"
        title="Contact Us"
        highlight="Contact"
        panelBg="bg-teal-950 text-teal-50"
        gradientClass="from-teal-50 via-emerald-50 to-amber-50"
      >
        <form className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-teal-200">Full Name</label>
              <input className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white placeholder:text-teal-200/60 focus:outline-none focus:ring-2 focus:ring-teal-400" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block text-sm mb-2 text-teal-200">Email</label>
              <input type="email" className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white placeholder:text-teal-200/60 focus:outline-none focus:ring-2 focus:ring-teal-400" placeholder="you@example.com" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-teal-200">Phone</label>
              <input className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white placeholder:text-teal-200/60 focus:outline-none focus:ring-2 focus:ring-teal-400" placeholder="(555) 123-4567" />
            </div>
            <div>
              <label className="block text-sm mb-2 text-teal-200">Topic</label>
              <select className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-400">
                <option className="bg-teal-900">Property Inquiry</option>
                <option className="bg-teal-900">Schedule Viewing</option>
                <option className="bg-teal-900">Partnership</option>
                <option className="bg-teal-900">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-2 text-teal-200">Message</label>
            <textarea rows={4} className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white placeholder:text-teal-200/60 focus:outline-none focus:ring-2 focus:ring-teal-400" placeholder="Tell us how we can help" />
          </div>
          <div className="flex items-center gap-4 pt-2">
            <button type="submit" className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold hover:from-teal-600 hover:to-emerald-600 transition shadow">
              Send Message
            </button>
            <div className="text-sm text-teal-200/80">
              Or email us at <span className="text-teal-200 underline">info@luxylyfe.biz</span>
            </div>
          </div>
        </form>
      </SplitSection>
    </div>
  )
}
