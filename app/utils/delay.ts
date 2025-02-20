/**
 * A "modern" sleep statement.
 *
 * @param ms The number of milliseconds to wait.
 */
export const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
