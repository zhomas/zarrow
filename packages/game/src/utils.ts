export const getWrappedIndex = (a: number, n: number) => {
  return ((a % n) + n) % n
}
