import getWeekLetters from "./getWeekLetters";
import { Settings } from "./settings";

interface MonthInfo {
  month: string[][]
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
  today: Date = new Date(),
  {
    locale,
    showPrevMonth = true,
    startWeekOnSunday = false,
  }: Partial<Settings>
): MonthInfo {
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  let month = getWeekLetters(locale);
  let index = 1;
  let offset = 1;

  // weekdays are 0 indexed starting with sunday
  let firstDay = firstOfMonth.getDay() !== 0 ? firstOfMonth.getDay() : 7;

  if (startWeekOnSunday) {
    index = 0;
    offset = 0;
    firstDay = firstDay % 7;
  }

  // increment from 0 to 6 until the month has been built
  let dayStackCounter = 0;

  // fill with empty slots
  for (; index < firstDay; index += 1) {
    if (showPrevMonth) {
    } else {
      month[index - offset].push(" ");
    }
    dayStackCounter = (dayStackCounter + 1) % 7;
  }

  for (let date = 1; date <= lastOfMonth.getDate(); date += 1) {
    month[dayStackCounter].push(`${date}`);
    dayStackCounter = (dayStackCounter + 1) % 7;
  }

  const length = month.reduce(
    (acc, dayStacks) => (dayStacks.length > acc ? dayStacks.length : acc),
    0
  );
  console.log(length);
  // fill the end of the month with empties
  month.forEach((dayStacks, index) => {
    while (dayStacks.length < length) {
      month[index].push(" ");
    }
  });

  return { month };
}

export default buildMonth;
