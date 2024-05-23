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
  // eslint-disable-next-line no-control-regex
  return /^[\x00-\xFF]*$/.test(str);
};
