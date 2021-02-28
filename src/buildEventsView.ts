import addWidgetTextLine from "./addWidgetTextLine";
import formatEvent from "./formatEvent";
import { Settings } from "./settings";

/**
 * Builds the events view
 *
 * @param  {WidgetStack} stack - onto which the events view is built
 */
async function buildEventsView(
  date: Date,
  stack: WidgetStack,
  settings: Settings
): Promise<void> {
  const leftStack = stack.addStack();
  // push event view to the left
  stack.addSpacer();

  leftStack.layoutVertically();
  // center the whole left part of the widget
  leftStack.addSpacer();

  let events: CalendarEvent[] = [];
  if (settings.showEventsOnlyForToday) {
    events = await CalendarEvent.today([]);
  } else {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() + settings.nextNumOfDays);
    events = await CalendarEvent.between(date, dateLimit);
  }

  const futureEvents: CalendarEvent[] = [];
  // if we show events for the whole week, then we need to filter allDay events
  // to not show past allDay events
  // if allDayEvent's start date is later than a day ago from now then show it
  // TODO clear up this logic
  for (const event of events) {
    if (
      (settings.showAllDayEvents &&
        event.isAllDay &&
        event.startDate.getTime() >
          new Date(new Date().setDate(new Date().getDate() - 1)).getTime()) ||
      (event.endDate.getTime() > date.getTime() &&
        !event.title.startsWith("Canceled:"))
    ) {
      futureEvents.push(event);
    }
  }

  // if we have events today; else if we don't
  if (futureEvents.length !== 0) {
    // show the next 3 events at most
    const numEvents = futureEvents.length > 3 ? 3 : futureEvents.length;
    for (let i = 0; i < numEvents; i += 1) {
      formatEvent(leftStack, futureEvents[i], settings);
      // don't add a spacer after the last event
      if (i < numEvents - 1) {
        leftStack.addSpacer(8);
      }
    }
  } else {
    addWidgetTextLine(`No more events.`, leftStack, {
      textColor: settings.textColor,
      opacity: settings.eventDateTimeOpacity,
      font: Font.regularSystemFont(15),
    });
  }
  // for centering
  leftStack.addSpacer();
}

export default buildEventsView;
