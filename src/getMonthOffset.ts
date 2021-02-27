function getMonthOffset(date: Date, offset: number): Date {
  const newDate = new Date(date);
  let offsetMonth = date.getMonth() + offset;
  if (offsetMonth < 0) {
    offsetMonth += 12;
    newDate.setFullYear(date.getFullYear() - 1);
  } else if (offsetMonth > 11) {
    offsetMonth -= 12;
    newDate.setFullYear(date.getFullYear() + 1);
  }
  newDate.setMonth(offsetMonth);
  return newDate;
}
export default getMonthOffset;
