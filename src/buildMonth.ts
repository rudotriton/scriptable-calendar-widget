import getMonthBoundaries from "./getMonthBoundaries";
import getPreviousMonth from "./getPreviousMonth";
import getWeekLetters from "./getWeekLetters";
import { Settings } from "./settings";

interface MonthInfo {
  month: string[][];
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
function buildMonth(
  date: Date = new Date(),
  {
    locale,
    showPrevMonth = true,
    showNextMonth = true,
    startWeekOnSunday = false,
  }: Partial<Settings>
): MonthInfo {
  const currentMonth = getMonthBoundaries(date);

  const prevMonth = getMonthBoundaries(getPreviousMonth(date));
  // this will be built up
  const month = getWeekLetters(locale, startWeekOnSunday);
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
      month[index - offset].push(
        // e.g. prev has 31 days, ending on a Friday, firstDay is 6
        // we fill Mon - Fri (27-31): 31 - 6 + 1 + 1
        // if week starts on a Sunday (26-31): 31 - 6 + 1 + 0
        `${prevMonth.lastOfMonth.getDate() - firstDay + 1 + index}`
      );
      daysFromPrevMonth += 1;
    } else {
      month[index - offset].push(" ");
    }
    dayStackCounter = (dayStackCounter + 1) % 7;
  }

  for (let date = 1; date <= currentMonth.lastOfMonth.getDate(); date += 1) {
    month[dayStackCounter].push(`${date}`);
    dayStackCounter = (dayStackCounter + 1) % 7;
  }

  const length = month.reduce(
    (acc, dayStacks) => (dayStacks.length > acc ? dayStacks.length : acc),
    0
  );
  // fill the end of the month with spacers
  month.forEach((dayStacks, index) => {
    while (dayStacks.length < length) {
      if (showNextMonth) {
        daysFromNextMonth += 1;
        month[index].push(`${daysFromNextMonth}`);
      } else {
        month[index].push(" ");
      }
    }
  });

  return { month, daysFromPrevMonth, daysFromNextMonth };
}

export default buildMonth;
