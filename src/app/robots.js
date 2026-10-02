export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        // jobs
        "/jobs?search=",

        // recruitments
        "/recruitments?search="
      ]
    },
    sitemap: `${process.env.NEXT_PUBLIC_DOMAIN}/sitemap-index.xml`
  }
}