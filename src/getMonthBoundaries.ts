function getMonthBoundaries(date: Date): {
  firstOfMonth: Date;
  lastOfMonth: Date;
} {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { firstOfMonth, lastOfMonth };
}
export default getMonthBoundaries;
