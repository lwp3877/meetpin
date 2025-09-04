// src/app/robots.txt/route.ts
export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /chat/
Disallow: /profile/edit
Disallow: /room/*/edit

# 주요 페이지
Allow: /
Allow: /auth/login
Allow: /auth/signup
Allow: /map
Allow: /legal/

# Sitemap
Sitemap: ${process.env.SITE_URL || 'https://meetpin-weld.vercel.app'}/sitemap.xml

# 크롤링 속도 제한
Crawl-delay: 1`

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}