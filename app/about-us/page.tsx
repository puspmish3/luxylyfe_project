import type { Metadata } from 'next'
import SplitSection from '@/components/SplitSection'

export const metadata: Metadata = {
  title: 'About Us | LuxyLyfe',
  description: 'Bespoke, high‑end properties with white‑glove guidance for discerning clients.',
}

export default function AboutUs() {
  return (
    <div>
      <SplitSection
        imageSrcs={[
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1542621334-a254cf47733d?auto=format&fit=crop&w=1600&q=80',
          'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=1600&q=80'
        ]}
        imageAlt="High-rise apartment buildings"
        eyebrow="About"
        title="About LuxyLyfe"
        highlight="About"
        panelBg="bg-indigo-950 text-indigo-50"
        gradientClass="from-rose-50 via-pink-50 to-purple-50"
        slideIntervalMs={4500}
      >
        <div>
          <h2 className="text-lg font-semibold text-indigo-200 mb-2">Who We Serve</h2>
          <p className="leading-relaxed text-indigo-100/90">
            We specialize in bespoke, high‑end properties tailored to discerning clients seeking
            exceptional craftsmanship and service.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-indigo-200 mb-2">Our Promise</h2>
          <p className="leading-relaxed text-indigo-100/90">
            From curated listings to white‑glove guidance, we deliver an elevated experience at every step.
          </p>
        </div>
      </SplitSection>
    </div>
  )
}
