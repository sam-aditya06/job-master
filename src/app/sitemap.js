// app/sitemap.js

import { getAllSlugs, getRecruiterFromId } from "@/lib/serverUtils"

const BASE_URL = process.env.NEXT_PUBLIC_DOMAIN

const sectors = [
  "central-govt",
  "state-govt",
  "psu",
  "banking",
  "defence",
  "railways",
  "judiciary",
  "police"
];

const staticPages = [
  { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.4 },
  { url: `${BASE_URL}/disclaimer`, changeFrequency: "monthly", priority: 0.3 },
  { url: `${BASE_URL}/feedback`, changeFrequency: "monthly", priority: 0.3 },
  { url: `${BASE_URL}/privacy-policy`, changeFrequency: "monthly", priority: 0.3 },
  { url: `${BASE_URL}/terms`, changeFrequency: "monthly", priority: 0.3 }
]

export async function generateSitemaps() {
  return [
    { id: "jobs" },
    { id: "orgs" },
    { id: "recruitments" },
    { id: "recruitment-bodies" },
    { id: "static" }
  ]
}

export default async function sitemap({ id }) {
  const idValue = await id;
  switch (idValue) {
    case "jobs": return await getJobsSitemap();
    case "orgs": return await getOrgsSitemap();
    case "recruitments": return await getRecruitmentsSitemap();
    case "recruitment-bodies": return await getRecruitmentBodiesSitemap();
    case "static": return staticPages;
    default: return []
  }
}

async function getJobsSitemap() {
  const jobSlugs = await getAllSlugs('jobs');
  const orgSlugs = await getAllSlugs('orgs');

  const jobsBase = {
    url: `${BASE_URL}/jobs`,
    changeFrequency: "daily",
    priority: 1.0
  }

  const sectorEntries = sectors.map(sector => ({
    url: `${BASE_URL}/jobs?sector=${sector}`,
    changeFrequency: "daily",
    priority: 0.9
  }));

  const orgFilterEntries = orgSlugs.map(slug => ({
    url: `${BASE_URL}/jobs?org=${slug}`,
    changeFrequency: "weekly",
    priority: 0.8
  }));

  const jobEntries = jobSlugs.flatMap(({ slug, updatedAt }) => [
    {
      url: `${BASE_URL}/jobs/${slug}`,
      lastModified: updatedAt,
      changeFrequency: "monthly",
      priority: 0.8
    },
    {
      url: `${BASE_URL}/jobs/${slug}/eligibility-criteria`,
      lastModified: updatedAt,
      changeFrequency: "monthly",
      priority: 0.6
    },
    {
      url: `${BASE_URL}/jobs/${slug}/responsibilities`,
      lastModified: updatedAt,
      changeFrequency: "monthly",
      priority: 0.6
    }
  ])

  return [jobsBase, ...sectorEntries, ...orgFilterEntries, ...jobEntries]
}

async function getOrgsSitemap() {
  const orgSlugs = await getAllSlugs('orgs');

  const orgsBase = {
    url: `${BASE_URL}/orgs`,
    changeFrequency: "weekly",
    priority: 1.0
  }

  const sectorEntries = sectors.map(sector => ({
    url: `${BASE_URL}/orgs?sector=${sector}`,
    changeFrequency: "weekly",
    priority: 0.9
  }))

  const orgEntries = orgSlugs.map(({ slug, updatedAt }) => ({
    url: `${BASE_URL}/orgs/${slug}`,
    lastModified: updatedAt,
    changeFrequency: "monthly",
    priority: 0.8
  }))

  return [orgsBase, ...sectorEntries, ...orgEntries];
}

async function getRecruitmentsSitemap() {
  const [recruitmentSlugs, archiveSlugs, orgSlugs] = await Promise.all([
    getAllSlugs('recruitments'),
    getAllSlugs('archives'),
    getAllSlugs('orgs')
  ]);

  const uniqueRecruiterIds = [...new Set(recruitmentSlugs.map(r => r.recruiterId.toString()))]
  const recruiters = await Promise.all(uniqueRecruiterIds.map(id => getRecruiterFromId(id)))
  const recruiterSlugs = recruiters
    .filter(Boolean)
    .map(r => r.slug)

  const recruitmentsBase = {
    url: `${BASE_URL}/recruitments`,
    changeFrequency: "hourly",
    priority: 1.0
  }

  const recruiterFilterEntries = recruiterSlugs.map(slug => ({
    url: `${BASE_URL}/recruitments?by=${slug}`,
    changeFrequency: "weekly",
    priority: 0.8
  }))

  const sectorEntries = sectors.map(sector => ({
    url: `${BASE_URL}/recruitments?sector=${sector}`,
    changeFrequency: "daily",
    priority: 0.9
  }))

  const orgFilterEntries = orgSlugs.map(({ slug }) => ({
    url: `${BASE_URL}/recruitments?for=${slug}`,
    changeFrequency: "weekly",
    priority: 0.8
  }))

  // /recruitments/[recruitment] — current cycle overview
  const recruitmentEntries = recruitmentSlugs.map(({ slug, updatedAt }) => ({
    url: `${BASE_URL}/recruitments/${slug}`,
    lastModified: updatedAt,
    changeFrequency: "daily",
    priority: 0.9
  }))

  // /recruitments/[recruitment]?stage=X — current cycle stages
  const stageEntries = recruitmentSlugs.flatMap(({ slug, updatedAt, stages }) =>
    stages.map(({ slug: stageSlug }) => ({
      url: `${BASE_URL}/recruitments/${slug}?stage=${stageSlug}`,
      lastModified: updatedAt,
      changeFrequency: "daily",
      priority: 0.8
    }))
  )

  // /recruitments/[recruitment]?year=X — past cycles
  const archiveEntries = archiveSlugs.map(({ recruitmentSlug, year, updatedAt }) => ({
    url: `${BASE_URL}/recruitments/${recruitmentSlug}?year=${year}`,
    lastModified: updatedAt,
    changeFrequency: "monthly",
    priority: 0.6
  }))

  return [
    recruitmentsBase,
    ...sectorEntries,
    ...orgFilterEntries,
    ...recruiterFilterEntries,
    ...recruitmentEntries,
    ...stageEntries,
    ...archiveEntries
  ]
}

async function getRecruitmentBodiesSitemap() {
  const rBodySlugs = await getAllSlugs('recruitment-bodies')

  const rBodiesBase = {
    url: `${BASE_URL}/recruitment-bodies`,
    changeFrequency: "weekly",
    priority: 1.0
  }

  const sectorEntries = sectors.map(sector => ({
    url: `${BASE_URL}/recruitment-bodies?sector=${sector}`,
    changeFrequency: "weekly",
    priority: 0.9
  }))

  const rBodyEntries = rBodySlugs.map(({ slug, updatedAt }) => ({
    url: `${BASE_URL}/recruitment-bodies/${slug}`,
    lastModified: updatedAt,
    changeFrequency: "monthly",
    priority: 0.8
  }))

  return [rBodiesBase, ...sectorEntries, ...rBodyEntries]
}