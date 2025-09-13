import type { Metadata } from 'next'
import SplitSection from '@/components/SplitSection'

export const metadata: Metadata = {
  title: 'Our Vision | LuxyLyfe',
  description: 'Redefining luxury living with innovative design, sustainability, and timeless communities.',
}

export default function Vision() {
  return (
    <div>
      <SplitSection
        imageSrcs={[
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1542621334-a254cf47733d?auto=format&fit=crop&w=1600&q=80'
        ]}
        imageAlt="Modern architecture representing forward-looking vision"
        eyebrow="About"
        title="Our Vision"
        highlight="Our"
        panelBg="bg-slate-900 text-slate-50"
        gradientClass="from-blue-50 via-cyan-50 to-emerald-50"
        slideIntervalMs={4500}
      >
        <div>
          <h2 className="text-lg font-semibold text-cyan-200 mb-2">Elevating Luxury</h2>
          <p className="leading-relaxed text-slate-100/90">
            We aim to redefine luxury living with innovative designs, sustainable practices,
            and curated experiences that elevate everyday life.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-cyan-200 mb-2">Future Focus</h2>
          <p className="leading-relaxed text-slate-100/90">
            By anticipating lifestyle trends and investing in technology, we build communities
            that feel timeless and forward‑looking.
          </p>
        </div>
      </SplitSection>
    </div>
  )
}
