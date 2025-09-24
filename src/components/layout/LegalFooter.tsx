'use client'

import React from 'react'
import Link from 'next/link'
import { brandMessages } from '@/lib/config/brand'

interface LegalFooterProps {
  className?: string
  variant?: 'default' | 'minimal' | 'dark'
}

export default function LegalFooter({ 
  className = '', 
  variant = 'default' 
}: LegalFooterProps) {
  const legalLinks = [
    {
      href: '/legal/privacy',
      label: '개인정보처리방침',
      description: '개인정보 수집·이용·보관 정책'
    },
    {
      href: '/legal/terms',
      label: '서비스 이용약관', 
      description: '서비스 이용 규정 및 약관'
    },
    {
      href: '/legal/location-terms',
      label: '위치정보 이용약관',
      description: '위치기반서비스 이용 약관'
    },
    {
      href: '/legal/cookie-policy',
      label: '쿠키 정책',
      description: '쿠키 및 트래킹 정책'
    }
  ]

  const currentYear = new Date().getFullYear()

  // Variant styles
  const variants = {
    default: {
      bg: 'bg-gray-50 border-t border-gray-200',
      text: 'text-gray-600',
      linkText: 'text-gray-800 hover:text-primary-600',
      brandText: 'text-gray-900'
    },
    minimal: {
      bg: 'bg-white border-t border-gray-100', 
      text: 'text-gray-500',
      linkText: 'text-gray-700 hover:text-primary-600',
      brandText: 'text-gray-800'
    },
    dark: {
      bg: 'bg-gray-900 border-t border-gray-800',
      text: 'text-gray-400',
      linkText: 'text-gray-300 hover:text-white',
      brandText: 'text-white'
    }
  }

  const style = variants[variant]

  return (
    <footer className={`${style.bg} ${className}`}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">📍</span>
              <h3 className={`text-lg font-bold ${style.brandText}`}>
                {brandMessages.appName}
              </h3>
            </div>
            <p className={`text-sm ${style.text} leading-relaxed`}>
              {brandMessages.tagline}
            </p>
            <p className={`text-sm ${style.text} mt-2`}>
              새로운 사람들과의 특별한 만남
            </p>
          </div>

          {/* Legal links */}
          <div className="lg:col-span-3">
            <h4 className={`text-sm font-semibold ${style.brandText} mb-4 uppercase tracking-wider`}>
              법무 정보
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block group ${style.linkText} transition-colors`}
                >
                  <div className="text-sm font-medium group-hover:underline">
                    {link.label}
                  </div>
                  <div className={`text-xs ${style.text} mt-1`}>
                    {link.description}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Copyright */}
            <div className={`text-xs ${style.text}`}>
              © {currentYear} {brandMessages.appName}. All rights reserved.
            </div>

            {/* Legal compliance notice */}
            <div className={`text-xs ${style.text} text-center sm:text-right`}>
              <div>개인정보보호법 및 위치정보법 준수</div>
              <div className="mt-1">
                문의: 
                <a 
                  href="mailto:privacy@meetpin.com" 
                  className={`ml-1 ${style.linkText} hover:underline`}
                >
                  privacy@meetpin.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Legal disclaimer */}
        <div className={`mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>⚖️ 법률 검토 필요:</strong> 
                위 법무 문서들은 샘플 템플릿입니다. 실제 서비스 운영 전 반드시 전문 법무팀의 검토를 받아야 합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}