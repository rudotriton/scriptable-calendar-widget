import { CalendarInfo } from "./buildCalendar";

/**
 * Given row, column, currentDate, and a calendar, returns true if the indexed
 * value is from the current month
 *
 */
function isDateFromBoundingMonth(
  row: number,
  column: number,
  date: Date,
  calendar: CalendarInfo["calendar"]
): boolean {
  const [month] = calendar[row][column].split("/");
  const currentMonth = date.getMonth().toString();
  return month === currentMonth;
}

export default isDateFromBoundingMonth;
