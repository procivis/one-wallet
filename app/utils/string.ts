export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const capitalize = (str: string): string =>
  str
    ?.split(' ')
    .filter((x) => x)
    .map((x) => x.charAt(0).toUpperCase() + x.substring(1).toLowerCase())
    .join(' ');
