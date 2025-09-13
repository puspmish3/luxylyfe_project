import type { Metadata } from 'next'
import SplitSection from '@/components/SplitSection'

export const metadata: Metadata = {
  title: 'Our Mission | LuxyLyfe',
  description: 'We connect discerning residents with top‑tier luxury homes through integrity, quality, and community.',
}

export default function Mission() {
  return (
    <div>
      <SplitSection
        imageSrcs={[
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80'
        ]}
        imageAlt="Smiling person representing our friendly, modern brand"
        eyebrow="About"
        title="Our Mission"
        highlight="Our"
        panelBg="bg-emerald-950 text-emerald-50"
        gradientClass="from-amber-50 via-rose-50 to-emerald-50"
        slideIntervalMs={4500}
      >
        <div>
          <h2 className="text-lg font-semibold text-emerald-200 mb-2">Who We Are</h2>
          <p className="leading-relaxed text-emerald-100/90">
            At LuxyLyfe, we connect discerning residents with top‑tier luxury homes and local services.
            Our promise is elegant design, curated experiences, and trusted relationships.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-emerald-200 mb-2">Our Values</h2>
          <ul className="list-disc list-inside space-y-1 text-emerald-100/90">
            <li>Integrity in every interaction</li>
            <li>Uncompromising quality</li>
            <li>Community‑first partnerships</li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-emerald-200 mb-2">Team</h2>
          <p className="leading-relaxed text-emerald-100/90">
            Our team blends luxury expertise with local insight, ensuring every client receives
            attentive, tailored guidance—from discovery to closing and beyond.
          </p>
        </div>
      </SplitSection>
    </div>
  )
}
