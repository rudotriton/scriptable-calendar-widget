import { Settings } from "./settings";
import setWidgetBackground from "./setWidgetBackground";
import buildCalendarView from "./buildCalendarView";
import buildEventsView from "./buildEventsView";
import getEvents from "./getEvents";
import buildLargeWidget from "./buildLargeWidget";

async function buildWidget(settings: Settings): Promise<ListWidget> {
  const widget = new ListWidget();
  widget.backgroundColor = new Color(settings.widgetBackgroundColor, 1);
  setWidgetBackground(widget, settings.backgroundImage);
  widget.setPadding(16, 16, 16, 16);

  const today = new Date();
  // layout horizontally
  const globalStack = widget.addStack();

  const events = await getEvents(today, settings);

  switch (config.widgetFamily) {
    case "small":
      if (settings.widgetType === "events") {
        await buildEventsView(events, globalStack, settings);
      } else {
        await buildCalendarView(today, globalStack, settings);
      }
      break;
    case "large":
      await buildLargeWidget(today, events, globalStack, settings);
      break;
    default:
      await buildEventsView(events, globalStack, settings);
      await buildCalendarView(today, globalStack, settings);
      break;
  }

  return widget;
}

export default buildWidget;
