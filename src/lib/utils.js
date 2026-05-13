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

  return str?.split('-')
    .map(([first, ...rest]) => first.toUpperCase() + rest.join(''))
    .join(' ');
}

export function formatLocation(location) {
  const { scope, state, distribution } = location;
  const distLabel = {
    none: '',
    state_wise: ' (State-wise)',
    circle_wise: ' (Circle-wise)',
    zone_wise: ' (Zone-wise)',
    rrb_wise: ' (RRB-wise)',
  }[distribution];
  let formattedLocation = '';
  if (scope === 'state')
    formattedLocation = capitalize(state);
  else if (scope === 'international')
    formattedLocation = 'Worldwide';
  else
    formattedLocation = distribution === 'none' ? `All India` : `All India${distLabel}`;
  return formattedLocation;
}

export function formatLocationJsonLd(location) {
  if (location.scope === 'all_india') return { "@type": "Country", "name": "India" }
  if (location.state) return { "@type": "AdministrativeArea", "name": capitalize(location.state) }
  if (location.scope === 'international') return { "@type": "AdministrativeArea", "name": "Worldwide" }
  return null
}

export function getLogoStyles(name, forCard) {
  let styles = {};

  switch (name) {
    case "Jammu and Kashmir Services Selection Board":
      styles.containerStyles = { padding: forCard ? "6px" : "8px" };
      styles.imgStyles = {};
      break;
    case "Punjab Subordinate Services Selection Board":
    case "Haryana Staff Selection Commission":
      styles.containerStyles = { padding: forCard ? "8px" : "10px" };
      styles.imgStyles = {};
      break;
    case "Delhi Subordinate Services Selection Board":
      styles.containerStyles = { padding: forCard ? "6px" : "10px" };
      styles.imgStyles = { marginBottom: "8px" }
      break;
    default:
      styles.containerStyles = {};
      styles.imgStyles = {};
  }

  return styles;
}
