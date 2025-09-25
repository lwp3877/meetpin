/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://meetpin.app',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/admin/*', '/api/*', '/chat/*', '/profile', '/requests'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/chat/', '/profile', '/requests'],
      },
    ],
  },
  transform: async (config, path) => {
    // 개인정보가 포함될 수 있는 페이지는 제외
    if (path.includes('/room/') || path.includes('/user/')) {
      return null
    }

    return {
      loc: path,
      changefreq: path === '/' ? 'daily' : 'weekly',
      priority: path === '/' ? 1.0 : 0.7,
      lastmod: new Date().toISOString(),
    }
  },
}
