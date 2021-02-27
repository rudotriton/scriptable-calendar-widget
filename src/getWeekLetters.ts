/**
 * Creates an array of arrays of weekday letters e.g.
 *
 * [[ 'M' ], [ 'T' ], [ 'W' ], [ 'T' ], [ 'F' ], [ 'S' ], [ 'S' ]]
 *
 */
function getWeekLetters(
  locale = "en-US",
  startWeekOnSunday = false
): string[][] {
  let week = [];
  for (let i = 1; i <= 7; i += 1) {
    // create days from Monday to Sunday
    const day = new Date(`2021-02-0${i}`);
    week.push(day.toLocaleDateString(locale, { weekday: "long" }));
  }
  // get the first letter and capitalize it as some locales have them lowercase
  week = week.map((day) => [day.slice(0, 1).toUpperCase()]);
  if (startWeekOnSunday) {
    const sunday = week.pop();
    week.unshift(sunday);
  }
  return week;
}

export default getWeekLetters;
