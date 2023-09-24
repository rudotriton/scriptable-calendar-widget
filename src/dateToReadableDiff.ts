import tr from "i18n";

/**
 * Compare a date with current date and convert to readable date difference
 * 
 * @param d1 Date to compare
 * @param [locale='en-GB'] 
 */
function dateToReadableDiff(d1: Date, locale: string = 'en-GB') {
  const now = new Date();
  now.setHours(0);
  now.setMinutes(0);
  now.setSeconds(0);
  now.setMilliseconds(0);
  const diff = d1.valueOf() - now.valueOf();
  const dateDiff = Math.floor(diff / (1000*60*60*24));
  if (dateDiff < 0) {
    return ''; // date passed
  } else if (dateDiff == 0) {
    return tr(locale, 'today');
  } else if (dateDiff == 1) {
    return tr(locale, 'tomorrow');
  } else if (dateDiff > 1 && dateDiff <= 3) {
    return tr(locale, 'daysAfter', dateDiff);
  } else {
    return d1.toLocaleDateString(locale, { month: 'long', day: 'numeric', weekday: 'short' });
  }
}

export default dateToReadableDiff;