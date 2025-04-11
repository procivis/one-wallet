export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const capitalize = (str: string): string =>
  str
    ?.split(' ')
    .filter((x) => x)
    .map((x) => x.charAt(0).toUpperCase() + x.substring(1).toLowerCase())
    .join(' ');

export const replaceBreakingHyphens = (str: string): string =>
  str.replace(/-/g, '\u2011');

export const isASCII = (str: string) => {
  return /^[\x20-\xFF]*$/.test(str);
};

export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return Math.abs(hash);
}
