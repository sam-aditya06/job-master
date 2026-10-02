import { langs } from "@/lib/lang";
import { getDetailsForSitemap, getFiltersForSitemap } from "@/lib/serverUtils"
import { slugify } from "@/lib/utils";

const BASE_URL = process.env.NEXT_PUBLIC_DOMAIN;

const staticPages = langs.flatMap(lang => ([
  { url: `${BASE_URL}/${lang}/about`, changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE_URL}/${lang}/contact`, changeFrequency: "monthly", priority: 0.4 },
  { url: `${BASE_URL}/${lang}/disclaimer`, changeFrequency: "monthly", priority: 0.3 },
  { url: `${BASE_URL}/${lang}/feedback`, changeFrequency: "monthly", priority: 0.3 },
  { url: `${BASE_URL}/${lang}/privacy-policy`, changeFrequency: "monthly", priority: 0.3 },
  { url: `${BASE_URL}/${lang}/terms`, changeFrequency: "monthly", priority: 0.3 },
  { url: `${BASE_URL}/${lang}/quick-links`, changeFrequency: "weekly", priority: 0.7 }
]));

export async function generateSitemaps() {
  return [
    { id: "jobs" },
    { id: "recruitments" },
    { id: "static" }
  ]
}

export default async function sitemap({ id }) {
  const idValue = await id;
  switch (idValue) {
    case "jobs": return await getJobsSitemap();
    case "recruitments": return await getRecruitmentsSitemap();
    case "static": return staticPages;
    default: return []
  }
}

async function getJobsSitemap() {
  const [jobDetails, filters] = await Promise.all([
    getDetailsForSitemap('jobs'),
    getFiltersForSitemap('jobs')
  ]);

  if (!filters) return [];

  const { rStatuses } = filters;


  const jobsBase = langs.map(lang => ({
    url: `${BASE_URL}/${lang}/jobs`,
    changeFrequency: "daily",
    priority: 1.0
  }));

  const rStatusEntries = langs.flatMap(lang => rStatuses.map(rStatus => ({
    url: `${BASE_URL}/${lang}/jobs?rStatus=${slugify(rStatus)}`,
    changeFrequency: "daily",
    priority: 0.8
  })));

  const jobEntries = langs.flatMap(lang => jobDetails.flatMap(({ slug, updatedAt }) => [
    {
      url: `${BASE_URL}/${lang}/jobs/${slug}`,
      lastModified: updatedAt,
      changeFrequency: "monthly",
      priority: 0.8
    },
    {
      url: `${BASE_URL}/${lang}/jobs/${slug}/eligibility-criteria`,
      lastModified: updatedAt,
      changeFrequency: "monthly",
      priority: 0.6
    },
    {
      url: `${BASE_URL}/${lang}/jobs/${slug}/selection-process`,
      lastModified: updatedAt,
      changeFrequency: "monthly",
      priority: 0.6
    },
    {
      url: `${BASE_URL}/${lang}/jobs/${slug}/recruitments`,
      lastModified: updatedAt,
      changeFrequency: "daily",
      priority: 0.7
    }
  ]));

  return [
    ...jobsBase,
    ...rStatusEntries,
    ...jobEntries
  ]
}

async function getRecruitmentsSitemap() {
  const [recruitmentDetails, filters] = await Promise.all([
    getDetailsForSitemap('recruitments'),
    getFiltersForSitemap('recruitments')
  ]);

  if (!filters) return [];

  const { statuses } = filters

  const recruitmentsBase = langs.map(lang => ({
    url: `${BASE_URL}/${lang}/recruitments`,
    changeFrequency: "hourly",
    priority: 1.0
  }));

  const statusEntries = langs.flatMap(lang => statuses.map(status => ({
    url: `${BASE_URL}/${lang}/recruitments?status=${slugify(status)}`,
    changeFrequency: "daily",
    priority: 0.8
  })));

  // /recruitments/[recruitment] — current cycle overview
  const recruitmentEntries = langs.flatMap(lang => recruitmentDetails.flatMap(({ slug, stages, updatedAt }) => ([
    {
      url: `${BASE_URL}/${lang}/recruitments/${slug}`,
      lastModified: updatedAt,
      changeFrequency: "daily",
      priority: 0.9
    },
    ...stages.map(stage => ({
      url: `${BASE_URL}/${lang}/recruitments/${slug}/${stage.slug}`,
      lastModified: stage.updatedAt,
      changeFrequency: "daily",
      priority: 0.8
    }))
  ])));

  return [
    ...recruitmentsBase,
    ...statusEntries,
    ...recruitmentEntries
  ]
}