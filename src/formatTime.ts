/**
 * formats the event times into just hours
 *
 */
function formatTime(date: Date): string {
  let dateFormatter = new DateFormatter();
  dateFormatter.useNoDateStyle();
  dateFormatter.useShortTimeStyle();
  return dateFormatter.string(date);
}

export default formatTime;
