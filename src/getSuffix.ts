/**
 * get suffix for a given date
 *
 * @param {number} date
 *
 * @returns {string} suffix
 */
function getSuffix(date: number): string {
  if (date > 3 && date < 21) return "th";
  switch (date % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export default getSuffix;
