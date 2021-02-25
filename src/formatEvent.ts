import addWidgetTextLine from "./addWidgetTextLine";
import formatTime from "./formatTime";
import getSuffix from "./getSuffix";
import { Settings } from "./settings";

/**
 * Adds a event name along with start and end times to widget stack
 *
 */
function formatEvent(
  stack: WidgetStack,
  event: CalendarEvent,
  color: string,
  opacity: number,
  { showCalendarBullet, showCompleteTitle }: Partial<Settings>
): void {
  const eventLine = stack.addStack();

  if (showCalendarBullet) {
    // show calendar bullet in front of event name
    addWidgetTextLine(eventLine, "● ", {
      color: event.calendar.color.hex,
      font: Font.mediumSystemFont(14),
      lineLimit: showCompleteTitle ? 0 : 1,
    });
  }

  // event title
  addWidgetTextLine(eventLine, event.title, {
    color,
    font: Font.mediumSystemFont(14),
    lineLimit: showCompleteTitle ? 0 : 1,
  });
  // event duration
  let time: string;
  if (event.isAllDay) {
    time = "All Day";
  } else {
    time = `${formatTime(event.startDate)} - ${formatTime(event.endDate)}`;
  }

  const today = new Date().getDate();
  const eventDate = event.startDate.getDate();
  // if a future event is not today, we want to show it's date
  if (eventDate !== today) {
    time = `${eventDate}${getSuffix(eventDate)} ${time}`;
  }

  // event time
  addWidgetTextLine(stack, time, {
    color,
    opacity,
    font: Font.regularSystemFont(14),
  });
}
export default formatEvent;
