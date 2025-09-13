"use client"
import Image from 'next/image'
import { ReactNode, useEffect, useState } from 'react'

type SplitSectionProps = {
  imageSrc?: string
  imageSrcs?: string[]
  imageAlt: string
  eyebrow?: string
  title: string
  highlight?: string
  panelBg?: string // e.g., 'bg-slate-900 text-slate-50'
  gradientClass?: string // e.g., 'from-amber-50 via-rose-50 to-emerald-50'
  reverse?: boolean
  children?: ReactNode
  actions?: ReactNode
  minHeightClass?: string // e.g., 'min-h-[80vh]'
  slideIntervalMs?: number
}

export default function SplitSection({
  imageSrc,
  imageSrcs,
  imageAlt,
  eyebrow,
  title,
  highlight,
  panelBg = 'bg-slate-900 text-slate-50',
  gradientClass = 'from-slate-50 via-slate-100 to-slate-200',
  reverse = false,
  children,
  actions,
  minHeightClass = 'min-h-[80vh]',
  slideIntervalMs = 4000,
}: SplitSectionProps) {
  const hasSlideshow = Array.isArray(imageSrcs) && (imageSrcs?.length || 0) > 1
  const slides = hasSlideshow ? (imageSrcs as string[]) : (imageSrc ? [imageSrc] : [])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!hasSlideshow) return
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, Math.max(slideIntervalMs, 2000))
    return () => clearInterval(id)
  }, [hasSlideshow, slides.length, slideIntervalMs])

  return (
    <section className={`grid grid-cols-1 md:grid-cols-2 ${minHeightClass} pt-24`}>
      {/* Visual */}
      <div className={`relative ${reverse ? 'order-2 md:order-2' : 'order-2 md:order-1'}`}>
        <div className={`absolute inset-0 bg-gradient-to-b ${gradientClass}`} aria-hidden />
        {/* Image or Slideshow */}
        {slides.length <= 1 ? (
          <Image
            src={slides[0] || ''}
            alt={imageAlt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover mix-blend-multiply opacity-95"
          />
        ) : (
          <div className="absolute inset-0">
            {slides.map((src, idx) => (
              <Image
                key={`${src}-${idx}`}
                src={src}
                alt={imageAlt}
                fill
                priority={idx === 0}
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`object-cover mix-blend-multiply transition-opacity duration-1000 ${
                  idx === current ? 'opacity-95' : 'opacity-0'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`${panelBg} ${reverse ? 'order-1 md:order-1' : 'order-1 md:order-2'} px-6 md:px-10 lg:px-16 py-12 md:py-16 flex items-center`}>
        <div className="w-full max-w-2xl mx-auto">
          {(eyebrow || title) && (
            <div className="mb-8">
              {eyebrow && (
                <span className="inline-block text-xs tracking-widest uppercase opacity-80">
                  {eyebrow}
                </span>
              )}
              <h1 className="mt-2 text-4xl md:text-5xl font-extrabold leading-tight">
                {highlight ? (
                  <>
                    <span className="opacity-90">{highlight}</span>{' '}
                    {title.replace(highlight, '').trim()}
                  </>
                ) : (
                  title
                )}
              </h1>
            </div>
          )}

          {children && (
            <div className="space-y-8 opacity-90">
              {children}
            </div>
          )}

          {actions && (
            <div className="mt-6 flex flex-wrap gap-3">{actions}</div>
          )}
        </div>
      </div>
    </section>
  )
}
