/**
 * If the week starts on a Sunday indeces 0 and 6 are for weekends
 * else indices 5 and 6
 *
 * @param {number} index
 * @param {{startWeekOnSunday: boolean}} settings
 */
function isWeekend(index: number, startWeekOnSunday = false): boolean {
  if (startWeekOnSunday) {
    switch (index) {
      case 0:
      case 6:
        return true;
      default:
        return false;
    }
  }
  return index > 4;
}

export default isWeekend;
