import settings from "./settings";
import buildMonth from "./buildMonth";
import isWeekend from "./isWeekend";
import addWidgetTextLine from "./addWidgetTextLine";
import setWidgetBackground from "./setWidgetBackground";
import formatEvent from "./formatEvent";
import countEvents from "./countEvents";
import createDateImage from "./createDateImage";
import buildCalendarView from "./buildCalendarView";

async function main() {
  if (config.runsInWidget) {
    let widget = await createWidget();
    Script.setWidget(widget);
    Script.complete();
  } else if (settings.debug) {
    Script.complete();
    let widget = await createWidget();
    await widget.presentMedium();
  } else {
    const appleDate = new Date("2001/01/01");
    const timestamp = (new Date().getTime() - appleDate.getTime()) / 1000;
    const callback = new CallbackURL("calshow:" + timestamp);
    callback.open();
    Script.complete();
  }
}

async function createWidget() {
  let widget = new ListWidget();
  widget.backgroundColor = new Color(settings.widgetBackgroundColor, 1);
  setWidgetBackground(widget, settings.imageName);
  widget.setPadding(16, 16, 16, 16);

  const today = new Date();
  // layout horizontally
  const globalStack = widget.addStack();

  if (settings.showEventsView) {
    await buildEventsView(globalStack);
  }
  if (settings.showCalendarView) {
    await buildCalendarView(today, globalStack);
  }

  return widget;
}

/**
 * Builds the events view
 *
 * @param  {WidgetStack} stack - onto which the events view is built
 */
async function buildEventsView(stack: WidgetStack) {
  const leftStack = stack.addStack();
  // push event view to the left
  stack.addSpacer();

  leftStack.layoutVertically();
  // center the whole left part of the widget
  leftStack.addSpacer();

  const date = new Date();

  let events: CalendarEvent[] = [];
  if (settings.showEventsOnlyForToday) {
    events = await CalendarEvent.today([]);
  } else {
    let dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() + settings.nextNumOfDays);
    events = await CalendarEvent.between(date, dateLimit);
  }

  const futureEvents: CalendarEvent[] = [];
  // if we show events for the whole week, then we need to filter allDay events
  // to not show past allDay events
  // if allDayEvent's start date is later than a day ago from now then show it
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
      opacity: settings.opacity,
      font: Font.regularSystemFont(15),
      align: "left",
    });
  }
  // for centering
  leftStack.addSpacer();
}

main();
