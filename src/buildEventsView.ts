import createUrl from "createUrl";
import addWidgetTextLine from "./addWidgetTextLine";
import formatEvent from "./formatEvent";
import { Settings } from "./settings";
import dateToReadableDiff from "dateToReadableDiff";

/**
 * Builds the events view
 *
 * @param  {WidgetStack} stack - onto which the events view is built
 */
async function buildEventsView(
  events: CalendarEvent[],
  stack: WidgetStack,
  settings: Settings,
  {
    horizontalAlign = "left",
    verticalAlign = "center",
    eventSpacer = 4,
    lineSpaceLimit = 7,
    showMsg = true,
  }: {
    horizontalAlign?: string;
    verticalAlign?: string;
    eventSpacer?: number;
    lineSpaceLimit?: number;
    showMsg?: boolean;
  } = {}
): Promise<void> {
  const leftStack = stack.addStack();
  // add, spacer to the right side, this pushes event view to the left
  if (horizontalAlign === "left") {
    stack.addSpacer();
  }

  leftStack.layoutVertically();
  // center the whole left part of the widget
  if (verticalAlign === "bottom" || verticalAlign === "center") {
    leftStack.addSpacer();
  }

  // if we have events today; else if we don't
  if (events.length !== 0) {
    const groupStack: Map<string, WidgetStack> = new Map();
    // show the next 3 events at most
    const numEvents = events.length;// > eventLimit ? eventLimit : events.length;
    // don't show location if more than 2 events
    const showLocation = settings.showEventLocation;
    let spaceLeft = lineSpaceLimit;
    let i = 0;
    while (spaceLeft > 0 && i < numEvents) {
      let stack: WidgetStack;
      let eventDate = dateToReadableDiff(events[i].startDate, settings.locale);
      if (groupStack.has(eventDate)) {
        stack = groupStack.get(eventDate);
      } else {
        stack = leftStack.addStack();
        stack.layoutVertically();
        groupStack.set(eventDate, stack);
        addWidgetTextLine(eventDate, stack, {
          textColor: settings.textColorPrevNextMonth,
          font: Font.regularSystemFont(13),
        });
        stack.url = createUrl(
          events[i].startDate.getDate().toString(),
          events[i].startDate.getMonth().toString(),
          events[i].startDate, settings)
        spaceLeft--;
      }
      const showTime = settings.showEventTime;
      const spaceUsed = formatEvent(stack, events[i], {
        ...settings,
        showEventLocation: spaceLeft >= 3 ? showLocation : false,
        showEventTime: spaceLeft >= 2 ? showTime : false,
      });
      spaceLeft -= spaceUsed;
      // don't add a spacer after the last event
      if (spaceLeft > 0 && i < numEvents) {
        stack.addSpacer(eventSpacer);
      }
      i++;
    }
  } else if (showMsg) {
    addWidgetTextLine(`No more events.`, leftStack, {
      textColor: settings.textColor,
      opacity: settings.eventDateTimeOpacity,
      font: Font.regularSystemFont(15),
    });
  }
  // for centering, pushes up from the bottom
  if (verticalAlign === "top" || verticalAlign === "center") {
    leftStack.addSpacer();
  }
}

export default buildEventsView;
