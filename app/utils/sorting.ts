export const objectByTimestampSorter =
  <T extends { [key in K]?: string | undefined }, K extends keyof T>(
    timestampProperty: K,
    ascending = true,
  ) =>
  (a: T, b: T): number => {
    const dateA = Date.parse(a[timestampProperty] ?? '') ?? 0;
    const dateB = Date.parse(b[timestampProperty] ?? '') ?? 0;
    if (ascending) {
      return dateA - dateB;
    } else {
      return dateB - dateA;
    }
  };
