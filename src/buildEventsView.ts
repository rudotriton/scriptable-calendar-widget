import addWidgetTextLine from "./addWidgetTextLine";
import formatEvent from "./formatEvent";
import { Settings } from "./settings";

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
    eventLimit = 3,
    eventSpacer = 8,
    showMsg = true,
  }: {
    horizontalAlign?: string;
    verticalAlign?: string;
    eventLimit?: number;
    eventSpacer?: number;
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
    // show the next 3 events at most
    const numEvents = events.length > eventLimit ? eventLimit : events.length;
    for (let i = 0; i < numEvents; i += 1) {
      formatEvent(leftStack, events[i], settings);
      // don't add a spacer after the last event
      if (i < numEvents - 1) {
        leftStack.addSpacer(eventSpacer);
      }
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
