export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        // jobs
        "/jobs?search=",
        "/jobs?rStatus=",
        "/jobs?expLvl=",
        "/jobs?location=",
        "/jobs?qualification=",

        // recruitments
        "/recruitments?search=",
        "/recruitments?status=",
        "/recruitments?expLvl=",
        "/recruitments?location=",
        "/recruitments?qualification=",

        // orgs
        "/orgs?search=",

        // recruitment-bodies
        "/recruitment-bodies?search=",
      ]
    },
    sitemap: `${process.env.NEXT_PUBLIC_DOMAIN}/sitemap.xml`
  }
}