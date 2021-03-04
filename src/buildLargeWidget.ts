import buildCalendarView from "./buildCalendarView";
import buildEventsView from "./buildEventsView";
import { Settings } from "./settings";

async function buildLargeWidget(
  date: Date,
  events: CalendarEvent[],
  stack: WidgetStack,
  settings: Settings
): Promise<void> {
  const leftSide = stack.addStack();
  stack.addSpacer();
  const rightSide = stack.addStack();
  leftSide.layoutVertically();
  rightSide.layoutVertically();

  // add space to the top of the calendar
  rightSide.addSpacer();
  rightSide.centerAlignContent();

  const leftSideEvents = events.slice(0, 8);
  const rightSideEvents = events.slice(8, 12);

  await buildEventsView(leftSideEvents, leftSide, settings, {
    eventLimit: 8,
    eventSpacer: 6,
  });
  await buildCalendarView(date, rightSide, settings);
  // add space between the calendar and any events below it
  rightSide.addSpacer();
  await buildEventsView(rightSideEvents, rightSide, settings, {
    eventLimit: 4,
    eventSpacer: 6,
    verticalAlign: "top",
    showMsg: false,
  });
}

export default buildLargeWidget;
