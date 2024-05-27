export const objectToQueryParams = (obj: Record<string, any>): string => {
  const params = new URLSearchParams();

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value !== undefined) {
      if (Array.isArray(value)) {
        // If the value is an array, append each item separately
        value.forEach((item) => {
          if (item !== undefined) {
            params.append(key, item);
          }
        });
      } else {
        // If the value is not an array, append it directly
        params.append(key, value);
      }
    }
  });

  return params.toString();
};
