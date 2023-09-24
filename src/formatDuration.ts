import { Settings } from "settings";

/**
 * formats the event start date and end date to duration
 *
 */
function formatDuration(startDate: Date, endDate: Date, {
  clock24Hour,
  locale
}: Partial<Settings>): string {
  if (clock24Hour) {
    const formatter = Intl.DateTimeFormat(locale, {hour: 'numeric', minute: 'numeric'});
    return `${formatter.format(startDate)}-${formatter.format(endDate)}`;
  } else {
    const formatter = Intl.DateTimeFormat(locale, {hour: 'numeric', minute: 'numeric', hour12: true});
    const startDayParts = formatter.formatToParts(startDate);
    const endDayParts = formatter.formatToParts(endDate);
    const startPeriod = startDayParts.find(p => p.type === "dayPeriod").value;
    const endPeriod = endDayParts.find(p => p.type === "dayPeriod").value;
    if (startPeriod === endPeriod) {
      if (isPeriodFirst(startDayParts)) {
        // Don't show same period if it come first for that locale
        // e.g. 下午1:00-下午2:00 -> 下午1:00-2:00
        log(`${joinDateParts(startDayParts)}-${joinDateParts(endDayParts.filter(p => p.type !== "dayPeriod"))}`);
        return `${joinDateParts(startDayParts)}-${joinDateParts(endDayParts.filter(p => p.type !== "dayPeriod"))}`;
      }
    }
    return `${joinDateParts(startDayParts)}-${joinDateParts(endDayParts)}`;
  } 
}

function joinDateParts(parts: Intl.DateTimeFormatPart[]) {
  return parts.map((p) => p.value).join('')
}

function isPeriodFirst(parts: Intl.DateTimeFormatPart[]) {
  for (let part of parts) {
    if (part.type === "dayPeriod") return true;
    if (part.type === "hour" || part.type === "minute") return false;
  }
}

export default formatDuration;
  