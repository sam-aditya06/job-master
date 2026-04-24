import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatText(text) {
  return text
    .replace(/ \\n /g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<b class='dark:!text-white'>$1</b>");
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
  return str?.split('-')
    .map(([first, ...rest]) => first.toUpperCase() + rest.join(''))
    .join(' ');
}
