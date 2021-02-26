function getPreviousMonth(date: Date): Date {
  const newDate = new Date(date);
  let prevMonth = date.getMonth() - 1;
  if (prevMonth < 0) {
    prevMonth += 12;
    newDate.setFullYear(date.getFullYear() - 1);
  }
  newDate.setMonth(prevMonth);
  return newDate;
}
export default getPreviousMonth;
