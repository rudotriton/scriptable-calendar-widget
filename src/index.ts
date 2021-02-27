import settings from "./settings";
import setWidgetBackground from "./setWidgetBackground";
import buildCalendarView from "./buildCalendarView";
import buildEventsView from "./buildEventsView";

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
    const callback = new CallbackURL(`${settings.calendarApp}:` + timestamp);
    callback.open();
    Script.complete();
  }
}

async function createWidget() {
  let widget = new ListWidget();
  widget.backgroundColor = new Color(settings.widgetBackgroundColor, 1);
  setWidgetBackground(widget, settings.backgroundImage);
  widget.setPadding(16, 16, 16, 16);

  const today = new Date();
  // layout horizontally
  const globalStack = widget.addStack();

  if (settings.showEventsView) {
    await buildEventsView(today, globalStack, settings);
  }
  if (settings.showCalendarView) {
    await buildCalendarView(today, globalStack, settings);
  }

  return widget;
}

main();
