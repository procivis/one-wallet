export function addElementIf<T>(condition: boolean, obj: T) {
  return condition ? Array(obj) : [];
}
