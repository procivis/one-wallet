export const compareStrings = <
  P extends PropertyKey,
  T extends { [Prop in P]: string },
>(
  a: T,
  b: T,
  property: P,
) => {
  const nameA = a[property].toLowerCase();
  const nameB = b[property].toLowerCase();
  return nameA.localeCompare(nameB);
};
