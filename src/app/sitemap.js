// app/sitemap.js

import { getDetailsForSitemap, getJobsFilters } from "@/lib/serverUtils"
import { slugify } from "@/lib/utils";

const BASE_URL = process.env.NEXT_PUBLIC_DOMAIN;

const staticPages = [
  { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.4 },
  { url: `${BASE_URL}/disclaimer`, changeFrequency: "monthly", priority: 0.3 },
  { url: `${BASE_URL}/feedback`, changeFrequency: "monthly", priority: 0.3 },
  { url: `${BASE_URL}/privacy-policy`, changeFrequency: "monthly", priority: 0.3 },
  { url: `${BASE_URL}/terms`, changeFrequency: "monthly", priority: 0.3 },
  { url: `${BASE_URL}/quick-links`, changeFrequency: "weekly", priority: 0.7 }
]

export async function generateSitemaps() {
  return [
    { id: "jobs" },
    { id: "orgs" },
    { id: "recruitments" },
    { id: "static" }
  ]
}

export default async function sitemap({ id }) {
  const idValue = await id;
  switch (idValue) {
    case "jobs": return await getJobsSitemap();
    case "orgs": return await getOrgsSitemap();
    case "recruitments": return await getRecruitmentsSitemap();
    case "static": return staticPages;
    default: return []
  }
}

async function getJobsSitemap() {
  const [jobDetails, filters] = await Promise.all([
    getDetailsForSitemap('jobs'),
    getJobsFilters()
  ]);

  if (!filters) return [];

  const { orgs, sectors, categories, qualifications, expLvls, states, rStatuses } = filters;

  const jobsBase = {
    url: `${BASE_URL}/jobs`,
    changeFrequency: "daily",
    priority: 1.0
  }

  const sectorEntries = sectors.map(sector => ({
    url: `${BASE_URL}/jobs?sector=${slugify(sector)}`,
    changeFrequency: "daily",
    priority: 0.9
  }))

  const catEntries = categories.map(category => ({
    url: `${BASE_URL}/jobs?cat=${slugify(category)}`,
    changeFrequency: "weekly",
    priority: 0.9
  }));

  const orgFilterEntries = orgs.map(({ slug }) => ({
    url: `${BASE_URL}/jobs?org=${slug}`,
    changeFrequency: "weekly",
    priority: 0.8
  }))

  const qualificationEntries = qualifications.map(q => ({
    url: `${BASE_URL}/jobs?qualification=${slugify(q)}`,
    changeFrequency: "weekly",
    priority: 0.8
  }))

  const expLvlEntries = expLvls.map(expLvl => ({
    url: `${BASE_URL}/jobs?expLvl=${slugify(expLvl)}`,
    changeFrequency: "weekly",
    priority: 0.8
  }))

  const stateEntries = states.map(state => ({
    url: `${BASE_URL}/jobs?location=${slugify(state)}`,
    changeFrequency: "weekly",
    priority: 0.8
  }))

  const rStatusEntries = rStatuses.map(rStatus => ({
    url: `${BASE_URL}/jobs?rStatus=${slugify(rStatus)}`,
    changeFrequency: "daily",
    priority: 0.8
  }))

  const jobEntries = jobDetails.flatMap(({ slug, updatedAt }) => [
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
    },
    {
      url: `${BASE_URL}/jobs/${slug}/recruitment-details`,
      lastModified: updatedAt,
      changeFrequency: "daily",
      priority: 0.7
    }
  ])

  return [
    jobsBase,
    ...sectorEntries,
    ...catEntries,
    ...orgFilterEntries,
    ...qualificationEntries,
    ...expLvlEntries,
    ...stateEntries,
    ...rStatusEntries,
    ...jobEntries
  ]
}

async function getOrgsSitemap() {
  const [orgDetails, filters] = await Promise.all([
    getDetailsForSitemap('orgs'),
    getJobsFilters()
  ])

  if (!filters) return [];

  const { sectors } = filters;

  const orgsBase = {
    url: `${BASE_URL}/orgs`,
    changeFrequency: "weekly",
    priority: 1.0
  }

  const sectorEntries = sectors.map(sector => ({
    url: `${BASE_URL}/orgs?sector=${slugify(sector)}`,
    changeFrequency: "weekly",
    priority: 0.9
  }))

  const orgEntries = orgDetails.map(({ slug, updatedAt }) => ({
    url: `${BASE_URL}/orgs/${slug}`,
    lastModified: updatedAt,
    changeFrequency: "monthly",
    priority: 0.8
  }))

  return [orgsBase, ...sectorEntries, ...orgEntries];
}

async function getRecruitmentsSitemap() {
  const [recruitmentDetails, archiveDetails, filters] = await Promise.all([
    getDetailsForSitemap('recruitments'),
    getDetailsForSitemap('archives'),
    getJobsFilters()
  ]);

  if (!filters) return [];

  const { orgs, sectors, categories, qualifications, expLvls, states, rStatuses: statuses } = filters

  const recruitmentsBase = {
    url: `${BASE_URL}/recruitments`,
    changeFrequency: "hourly",
    priority: 1.0
  }

  const sectorEntries = sectors.map(sector => ({
    url: `${BASE_URL}/recruitments?sector=${slugify(sector)}`,
    changeFrequency: "daily",
    priority: 0.9
  }))

  const catEntries = categories.map(cat => ({
    url: `${BASE_URL}/recruitments?cat=${slugify(cat)}`,
    changeFrequency: "daily",
    priority: 0.9
  }))

  const orgFilterEntries = orgs.map(({ slug }) => ({
    url: `${BASE_URL}/recruitments?org=${slug}`,
    changeFrequency: "weekly",
    priority: 0.8
  }))

  const recruiterFilterEntries = orgs.map(({ slug }) => ({
    url: `${BASE_URL}/recruitments?recruiter=${slug}`,
    changeFrequency: "weekly",
    priority: 0.8
  }))

  const qualificationEntries = qualifications.map(q => ({
    url: `${BASE_URL}/recruitments?qualification=${slugify(q)}`,
    changeFrequency: "weekly",
    priority: 0.8
  }))

  const expLvlEntries = expLvls.map(expLvl => ({
    url: `${BASE_URL}/recruitments?expLvl=${slugify(expLvl)}`,
    changeFrequency: "weekly",
    priority: 0.8
  }))

  const stateEntries = states.map(state => ({
    url: `${BASE_URL}/recruitments?location=${slugify(state)}`,
    changeFrequency: "weekly",
    priority: 0.8
  }))

  const statusEntries = statuses.map(status => ({
    url: `${BASE_URL}/recruitments?status=${slugify(status)}`,
    changeFrequency: "daily",
    priority: 0.8
  }))

  // /recruitments/[recruitment] — current cycle overview
  const recruitmentEntries = recruitmentDetails.map(({ slug, updatedAt }) => ({
    url: `${BASE_URL}/recruitments/${slug}`,
    lastModified: updatedAt,
    changeFrequency: "daily",
    priority: 0.9
  }))

  // /recruitments/[recruitment]?stage=X — current cycle stages
  const stageEntries = recruitmentDetails.flatMap(({ slug, updatedAt, stages }) =>
    stages
      .filter(stage => stage.status !== "not-reached")
      .map(({ slug: stageSlug }) => ({
        url: `${BASE_URL}/recruitments/${slug}?stage=${stageSlug}`,
        lastModified: updatedAt,
        changeFrequency: "daily",
        priority: 0.8
      }))
  )

  // /recruitments/[recruitment]?year=X — past cycles
  const archiveEntries = archiveDetails.map(({ recruitmentSlug, year, updatedAt }) => ({
    url: `${BASE_URL}/recruitments/${recruitmentSlug}?fy=${year}-${(year + 1).toString().slice(-2)}`,
    lastModified: updatedAt,
    changeFrequency: "monthly",
    priority: 0.6
  }))

  return [
    recruitmentsBase,
    ...sectorEntries,
    ...catEntries,
    ...orgFilterEntries,
    ...recruiterFilterEntries,
    ...qualificationEntries,
    ...expLvlEntries,
    ...stateEntries,
    ...statusEntries,
    ...recruitmentEntries,
    ...stageEntries,
    ...archiveEntries
  ]
}