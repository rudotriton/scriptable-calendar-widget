import { Settings } from "./settings";
import setWidgetBackground from "./setWidgetBackground";
import buildCalendarView from "./buildCalendarView";
import buildEventsView from "./buildEventsView";
import getEvents from "./getEvents";

async function buildWidget(settings: Settings): Promise<ListWidget> {
  const widget = new ListWidget();
  widget.backgroundColor = new Color(settings.widgetBackgroundColor, 1);
  setWidgetBackground(widget, settings.backgroundImage);
  widget.setPadding(16, 16, 16, 16);

  const today = new Date();
  // layout horizontally
  const globalStack = widget.addStack();

  const events = await getEvents(today, settings);

  switch (settings.widgetType) {
    case "events":
      await buildEventsView(today, events, globalStack, settings);
      break;
    case "cal":
      await buildCalendarView(today, globalStack, settings);
      break;
    default:
      await buildEventsView(today, events, globalStack, settings);
      await buildCalendarView(today, globalStack, settings);
  }

  return widget;
}

export default buildWidget;
