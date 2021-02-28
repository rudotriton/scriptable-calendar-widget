import getMonthBoundaries from "./getMonthBoundaries";
import getMonthOffset from "./getMonthOffset";
import getWeekLetters from "./getWeekLetters";
import { Settings } from "./settings";

export interface CalendarInfo {
  calendar: string[][];
  daysFromPrevMonth: number;
  daysFromNextMonth: number;
}

/**
 * Creates an array of arrays, where the inner arrays include the same weekdays
 * along with a weekday identifier in the 0th position
 * [
 *   [ 'M', ' ', '7', '14', '21', '28' ],
 *   [ 'T', '1', '8', '15', '22', '29' ],
 *   [ 'W', '2', '9', '16', '23', '30' ],
 *   ...
 * ]
 *
 */
function buildCalendar(
  date: Date = new Date(),
  {
    locale,
    showPrevMonth = true,
    showNextMonth = true,
    startWeekOnSunday = false,
  }: Partial<Settings>
): CalendarInfo {
  const currentMonth = getMonthBoundaries(date);

  const prevMonth = getMonthBoundaries(getMonthOffset(date, -1));
  const calendar = getWeekLetters(locale, startWeekOnSunday);
  let daysFromPrevMonth = 0;
  let daysFromNextMonth = 0;
  let index = 1;
  let offset = 1;

  // weekdays are 0 indexed starting with a Sunday
  let firstDay =
    currentMonth.firstOfMonth.getDay() !== 0
      ? currentMonth.firstOfMonth.getDay()
      : 7;

  if (startWeekOnSunday) {
    index = 0;
    offset = 0;
    firstDay = firstDay % 7;
  }

  // increment from 0 to 6 until the month has been built
  let dayStackCounter = 0;

  // fill with empty slots up to the firstDay
  for (; index < firstDay; index += 1) {
    if (showPrevMonth) {
      calendar[index - offset].push(
        `${prevMonth.lastOfMonth.getMonth()}/${
          prevMonth.lastOfMonth.getDate() - firstDay + 1 + index
          // e.g. prev has 31 days, ending on a Friday, firstDay is 6
          // we fill Mon - Fri (27-31): 31 - 6 + 1 + 1
          // if week starts on a Sunday (26-31): 31 - 6 + 1 + 0
        }`
      );
      daysFromPrevMonth += 1;
    } else {
      calendar[index - offset].push(" ");
    }
    dayStackCounter = (dayStackCounter + 1) % 7;
  }

  for (
    let indexDate = 1;
    indexDate <= currentMonth.lastOfMonth.getDate();
    indexDate += 1
  ) {
    calendar[dayStackCounter].push(`${date.getMonth()}/${indexDate}`);
    dayStackCounter = (dayStackCounter + 1) % 7;
  }

  // find the longest weekday array
  let longestColumn = calendar.reduce(
    (acc, dayStacks) => (dayStacks.length > acc ? dayStacks.length : acc),
    0
  );

  // about once in 9-10 years, february can fit into just 4 rows, so a column is
  // 5 tall with day indicators
  if (showNextMonth && longestColumn < 6) {
    longestColumn += 1;
  }
  // fill the end of the month with spacers, if the weekday array is shorter
  // than the longest
  const nextMonth = getMonthOffset(date, 1);
  calendar.forEach((dayStacks, index) => {
    while (dayStacks.length < longestColumn) {
      if (showNextMonth) {
        daysFromNextMonth += 1;
        calendar[index].push(`${nextMonth.getMonth()}/${daysFromNextMonth}`);
      } else {
        calendar[index].push(" ");
      }
    }
  });

  return { calendar, daysFromPrevMonth, daysFromNextMonth };
}

export default buildCalendar;
