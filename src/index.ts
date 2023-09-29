import settings, { error } from "./settings";
import buildWidget from "./buildWidget";

async function main() {
  if (config.runsInWidget) {
    const widget = await buildWidget(settings);
    Script.setWidget(widget);
    Script.complete();
  } else if (config.runsInApp && error !== '') {
    const alert = new Alert();
    alert.message = error;
    await alert.presentAlert();
  } else if (settings.debug) {
    Script.complete();
    const widget = await buildWidget(settings);
    await widget.presentMedium();
  } else {
    const appleDate = new Date("2001/01/01");
    const timestamp = (new Date().getTime() - appleDate.getTime()) / 1000;
    const callback = new CallbackURL(`${settings.calendarApp}:` + timestamp);
    callback.open();
    Script.complete();
  }
}

main();
