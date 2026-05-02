// app/sitemap-index.xml/route.js

export async function GET() {
  const base = process.env.NEXT_PUBLIC_DOMAIN

  const ids = ["jobs", "orgs", "recruitments", "recruitment-bodies", "static"]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${ids.map(id => `<sitemap><loc>${base}/sitemap/${id}.xml</loc></sitemap>`).join('\n  ')}
</sitemapindex>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  })
}