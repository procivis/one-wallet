export function addElementIf<T>(condition: boolean, obj: T): Array<T> {
  return condition ? Array(obj) : [];
}
