import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function capitalize(str) {
  return str
    .split(' ')
    .map(([first, ...rest]) => first.toUpperCase() + rest.join(''))
    .join(' ');
}

export function slugify(str) {
  return str?.split(' ')
    .map(word => word.toLowerCase())
    .join('-');
}

export function deslugify(str) {
  if (str === 'psu' || str === 'it')
    return str.toUpperCase();

  if(str === 'all-india')
    return 'All India';

  return str?.split('-')
    .map(([first, ...rest]) => first.toUpperCase() + rest.join(''))
    .join(' ');
}

export function formatLocation(location) {
  const { scope, states, uts, districts, municipalities, panchayats } = location;
  let formattedLocation = '';
  if (scope === 'all-india')
    formattedLocation = 'All India'
  else if(scope === 'state')
    formattedLocation = `${states[0]}${states.length > 1 ? ` +${states.length - 1}` : ''}`;
  else if(scope === 'ut')
    formattedLocation = `${uts[0]}${uts.length > 1 ? ` +${uts.length - 1}` : ''}`;
  else if(scope === 'district')
    formattedLocation = `${districts[0]}${districts.length > 1 ? ` +${districts.length - 1}` : ''}`;
  else if(scope === 'municipality')
    formattedLocation = `${municipalities[0]}${municipalities.length > 1 ? ` +${municipalities.length - 1}` : ''}`;
  else if(scope === 'panchayat')
    formattedLocation = `${panchayats[0]}${panchayats.length > 1 ? ` +${panchayats.length - 1}` : ''}`;
  return formattedLocation;
}

export function formatAmount(amount) {
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `${parseFloat(lakhs.toFixed(1))}L`;
  }

  if (amount >= 1000) {
    const thousands = amount / 1000;
    return `${parseFloat(thousands.toFixed(1))}K`;
  }

  return `${amount}`;
}

export function formatLocationJsonLd(location) {
  if (location.scope === 'all-india') return { "@type": "Country", "name": "India" }
  if (location.state) return { "@type": "AdministrativeArea", "name": capitalize(location.state) }
  return null
}

export function validateFY(fy) {
  // Match format YYYY-YY
  const match = fy.match(/^(\d{4})-(\d{2})$/);

  if (!match) return false;

  const startYear = Number(match[1]);
  const endYearShort = Number(match[2]);

  if (startYear < (new Date().getFullYear() - 5))
    return false;

  // Expected end year should be last 2 digits of startYear + 1
  const expectedEnd = (startYear + 1) % 100;

  return endYearShort === expectedEnd;
}

export async function getMessages(lang) {
  return (await import(`@/lib/messages/${lang}.json`)).default;
}

export function buildJobPosting(lang, job, base, year) {
  const { name, description, orgName, vacancies, jobType } = job;
  const employmentTypeMap = {
    "permanent": "FULL_TIME",
    "contractual": "CONTRACTOR",
    "deputation": "TEMPORARY",
    "apprenticeship": "PART_TIME",
    "internship": "INTERN"
  }
  const filledDescription = description[lang]
    .replace(/\(\(year\)\)/g, year)
    .replace(/\(\(vacancies\)\)/g, vacancies);
  return {
    ...base,
    "title": name,
    "description": filledDescription,
    "hiringOrganization": { "@type": "Organization", "name": orgName },
    ...(vacancies > 0 && { "totalJobOpenings": vacancies }),
    "employmentType": employmentTypeMap[jobType]
  };
}
