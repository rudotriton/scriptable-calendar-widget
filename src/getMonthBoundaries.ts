function getMonthBoundaries(date: Date): { first: Date; last: Date } {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { first, last };
}
export default getMonthBoundaries;
