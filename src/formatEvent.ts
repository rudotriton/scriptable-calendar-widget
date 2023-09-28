import addWidgetTextLine from "./addWidgetTextLine";
import formatTime from "./formatTime";
import getSuffix from "./getSuffix";
import getEventIcon from "getEventIcon";
import { Settings } from "./settings";
import iconFullDay from "iconAllDay";
import formatDuration from "formatDuration";

/**
 * Adds a event name along with start and end times to widget stack
 *
 */
function formatEvent(
  stack: WidgetStack,
  event: CalendarEvent,
  {
    theme,
    showCalendarBullet,
    showCompleteTitle,
    showEventLocation,
    showEventTime,
    showIconForAllDayEvents,
    clock24Hour,
    locale,
  }: Partial<Settings>
): number {
  const eventLine = stack.addStack();
  const backgroundColor = new Color(event.calendar.color.hex, 0.3);
  eventLine.backgroundColor = backgroundColor;
  eventLine.layoutVertically();
  eventLine.cornerRadius = 5;
  eventLine.setPadding(3, 3, 3, 3);
  eventLine.size = new Size(150, 0);

  let lineCount = 0;

  const titleStack = eventLine.addStack();

  if (showCalendarBullet) {
    // show calendar bullet in front of event name
    const icon = getEventIcon(event);
    addWidgetTextLine(icon, titleStack, {
      textColor: event.calendar.color.hex,
      font: Font.mediumSystemFont(13),
      lineLimit: showCompleteTitle ? 0 : 1,
    });
  }

  // event title
  addWidgetTextLine(event.title, titleStack, {
    textColor: theme.textColor,
    font: Font.mediumSystemFont(13),
    lineLimit: showCompleteTitle ? 0 : 1,
  });
  if (showIconForAllDayEvents && event.isAllDay) {
    titleStack.addSpacer();
    const icon = titleStack.addImage(iconFullDay());
    icon.imageSize = new Size(15, 15);
    icon.rightAlignImage();
    icon.tintColor = new Color(theme.textColor);
  }
    
  lineCount++;

  if (showEventLocation && event.location) {
    addWidgetTextLine(event.location, eventLine.addStack(), {
      textColor: theme.textColor,
      opacity: theme.eventDateTimeOpacity,
      font: Font.mediumSystemFont(12),
      lineLimit: showCompleteTitle ? 0 : 1,
    });
    lineCount++;
  }

  if (showEventTime) {
    // event duration
    let time: string = '';
    if (!event.isAllDay) {
      time = formatDuration(event.startDate, event.endDate, {clock24Hour, locale});
    }

    // event time
    if (time) {
      const timeStack = eventLine.addStack();
      addWidgetTextLine(time, timeStack, {
        textColor: theme.textColor,
        opacity: theme.eventDateTimeOpacity,
        font: Font.regularSystemFont(12),
      });
      lineCount++;
    }
  }
  return lineCount;
}
export default formatEvent;
