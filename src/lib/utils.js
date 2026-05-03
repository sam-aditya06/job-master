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
  return str?.replace('psu', 'PSU')
    .split('-')
    .map(([first, ...rest]) => first.toUpperCase() + rest.join(''))
    .join(' ');
}

export function formatLocation(location, sector) {
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
