'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { fetchPageContent, getContentsBySection, PageContent } from '@/lib/content'

interface FooterLink {
  title: string
  url: string
  isExternal?: boolean
}

export default function Footer() {
  const [footerContent, setFooterContent] = useState<PageContent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFooterContent = async () => {
      try {
        const response = await fetchPageContent('FOOTER', true)
        if (response.content) {
          setFooterContent(response.content)
        }
      } catch (error) {
        console.error('Error loading footer content:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFooterContent()
  }, [])

  // Helper function to parse links from content
  const parseLinks = (content: string): FooterLink[] => {
    if (!content) return []
    try {
      return JSON.parse(content)
    } catch {
      // Fallback: treat as plain text with line breaks
      return content.split('\n').filter(line => line.trim()).map(line => ({
        title: line.trim(),
        url: '#'
      }))
    }
  }

  // Get content sections
  const navigationContent = getContentsBySection(footerContent, 'NAVIGATION')[0]
  const servicesContent = getContentsBySection(footerContent, 'SERVICES')[0]
  const contactInfoContent = getContentsBySection(footerContent, 'CONTACT_INFO')[0]
  const legalContent = getContentsBySection(footerContent, 'LEGAL')[0]

  // Default fallback content
  const defaultNavLinks: FooterLink[] = [
    { title: 'Home', url: '/' },
    { title: 'Mission', url: '/mission' },
    { title: 'Vision', url: '/vision' },
    { title: 'Projects', url: '/projects' },
    { title: 'About Us', url: '/about-us' },
    { title: 'Contact Us', url: '/contact-us' },
    { title: 'Member Login', url: '/member-login' },
    { title: 'Admin Login', url: '/admin-login' }
  ]

  const defaultServices: FooterLink[] = [
    { title: 'Luxury Property Sales', url: '#' },
    { title: 'Property Management', url: '#' },
    { title: 'Investment Consulting', url: '#' },
    { title: 'Concierge Services', url: '#' },
    { title: 'Property Valuation', url: '#' }
  ]

  const defaultLegalLinks: FooterLink[] = [
    { title: 'Privacy Policy', url: '#' },
    { title: 'Terms of Service', url: '#' },
    { title: 'Cookie Policy', url: '#' }
  ]

  // Use CMS content or fallback to defaults
  const navLinks = navigationContent ? parseLinks(navigationContent.content || '') : defaultNavLinks
  const serviceLinks = servicesContent ? parseLinks(servicesContent.content || '') : defaultServices
  const legalLinks = legalContent ? parseLinks(legalContent.content || '') : defaultLegalLinks

  // Parse contact info
  const getContactInfo = () => {
    if (!contactInfoContent?.content) {
      return {
        address: '123 Luxury Avenue\nBeverly Hills, CA 90210',
        phone: '(555) 123-4567',
        email: 'info@luxylyfe.biz'
      }
    }

    try {
      return JSON.parse(contactInfoContent.content)
    } catch {
      return {
        address: '123 Luxury Avenue\nBeverly Hills, CA 90210',
        phone: '(555) 123-4567',
        email: 'info@luxylyfe.biz'
      }
    }
  }

  const contactInfo = getContactInfo()

  if (loading) {
    return (
      <footer className="bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 text-slate-700 border-t border-slate-200/50">
        <div className="container mx-auto px-4 py-10">
          <div className="animate-pulse">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="h-32 bg-slate-200 rounded"></div>
              <div className="h-32 bg-slate-200 rounded"></div>
              <div className="h-32 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 text-slate-700 border-t border-slate-200/50">
      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Navigation Links */}
          <div className="col-span-1">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">
              {navigationContent?.title || 'Quick Links'}
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {navLinks.map((link, index) => (
                link.isExternal ? (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                  >
                    {link.title}
                  </a>
                ) : (
                  <Link
                    key={index}
                    href={link.url}
                    className="text-slate-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                  >
                    {link.title}
                  </Link>
                )
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="col-span-1">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">
              {servicesContent?.title || 'Services'}
            </h4>
            <div className="space-y-2">
              {serviceLinks.map((service, index) => (
                service.isExternal ? (
                  <a
                    key={index}
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-slate-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                  >
                    {service.title}
                  </a>
                ) : (
                  <a
                    key={index}
                    href={service.url}
                    className="block text-slate-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                  >
                    {service.title}
                  </a>
                )
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">
              {contactInfoContent?.title || 'Contact Info'}
            </h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <svg className="w-4 h-4 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {contactInfo.address.split('\n').map((line: string, index: number) => (
                    <span key={index}>
                      {line}
                      {index < contactInfo.address.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <p className="text-slate-600 text-sm">{contactInfo.phone}</p>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-slate-600 text-sm">{contactInfo.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-300/50 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-500 text-sm">
            © 2025 LuxyLyfe. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-3 md:mt-0">
            {legalLinks.map((link, index) => (
              link.isExternal ? (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-slate-700 text-sm transition-colors duration-200"
                >
                  {link.title}
                </a>
              ) : (
                <a
                  key={index}
                  href={link.url}
                  className="text-slate-500 hover:text-slate-700 text-sm transition-colors duration-200"
                >
                  {link.title}
                </a>
              )
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
