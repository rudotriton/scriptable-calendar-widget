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
  events: CalendarEvent[],
  stack: WidgetStack,
  settings: Settings
): Promise<void> {
  const leftStack = stack.addStack();
  // push event view to the left
  stack.addSpacer();

  leftStack.layoutVertically();
  // center the whole left part of the widget
  leftStack.addSpacer();

  // if we have events today; else if we don't
  if (events.length !== 0) {
    // show the next 3 events at most
    const numEvents = events.length > 3 ? 3 : events.length;
    for (let i = 0; i < numEvents; i += 1) {
      formatEvent(leftStack, events[i], settings);
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
