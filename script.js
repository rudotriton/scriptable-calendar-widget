// src/settings.js
var params = JSON.parse(args.widgetParameter) || {bg: "transparent.jpg"};
var settings = {
  debug: false,
  imageName: params.bg,
  widgetBackgroundColor: "#000000",
  todayColor: "#F24747",
  eventCircleColor: "#304F9E",
  todayTextColor: "#000000",
  dateTextColor: "#ffffff",
  weekendLetters: "#ffffff",
  weekendLetterOpacity: 0.7,
  weekendDates: "#ffffff",
  textColor: "#ffffff",
  opacity: 0.7,
  showEventsView: params.view ? params.view === "events" : true,
  showCalendarView: params.view ? params.view === "cal" : true,
  showAllDayEvents: true,
  showCalendarBullet: true,
  startWeekOnSunday: false,
  showEventsOnlyForToday: false,
  nextNumOfDays: 7,
  showCompleteTitle: false,
  showEventCircles: true
};
var settings_default = settings;

// src/calendar.js
main();
async function main() {
  if (config.runsInWidget) {
    let widget = await createWidget();
    Script.setWidget(widget);
    Script.complete();
  } else if (settings_default.debug) {
    Script.complete();
    let widget = await createWidget();
    await widget.presentMedium();
  } else {
    const appleDate = new Date("2001/01/01");
    const timestamp = (new Date().getTime() - appleDate.getTime()) / 1e3;
    const callback = new CallbackURL("calshow:" + timestamp);
    callback.open();
    Script.complete();
  }
}
async function createWidget() {
  let widget = new ListWidget();
  widget.backgroundColor = new Color(settings_default.widgetBackgroundColor);
  setWidgetBackground(widget, settings_default.imageName);
  widget.setPadding(16, 16, 16, 16);
  const globalStack = widget.addStack();
  if (settings_default.showEventsView) {
    await buildEventsView(globalStack);
  }
  if (settings_default.showCalendarView) {
    await buildCalendarView(globalStack);
  }
  return widget;
}
async function buildEventsView(stack) {
  const leftStack = stack.addStack();
  stack.addSpacer();
  leftStack.layoutVertically();
  leftStack.addSpacer();
  const date = new Date();
  let events = [];
  if (settings_default.showEventsOnlyForToday) {
    events = await CalendarEvent.today([]);
  } else {
    let dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() + settings_default.nextNumOfDays);
    events = await CalendarEvent.between(date, dateLimit);
  }
  const futureEvents = [];
  for (const event of events) {
    if (settings_default.showAllDayEvents && event.isAllDay && event.startDate.getTime() > new Date(new Date().setDate(new Date().getDate() - 1)) || event.endDate.getTime() > date.getTime() && !event.title.startsWith("Canceled:")) {
      futureEvents.push(event);
    }
  }
  if (futureEvents.length !== 0) {
    const numEvents = futureEvents.length > 3 ? 3 : futureEvents.length;
    for (let i = 0; i < numEvents; i += 1) {
      formatEvent(leftStack, futureEvents[i], settings_default.textColor, settings_default.opacity);
      if (i < numEvents - 1) {
        leftStack.addSpacer(8);
      }
    }
  } else {
    addWidgetTextLine(leftStack, `No more events.`, {
      color: settings_default.textColor,
      opacity: settings_default.opacity,
      font: Font.regularSystemFont(15),
      align: "left"
    });
  }
  leftStack.addSpacer();
}
async function buildCalendarView(stack) {
  const rightStack = stack.addStack();
  rightStack.layoutVertically();
  const date = new Date();
  const dateFormatter = new DateFormatter();
  dateFormatter.dateFormat = "MMMM";
  const spacing = config.widgetFamily === "small" ? 18 : 19;
  const monthLine = rightStack.addStack();
  monthLine.addSpacer(4);
  addWidgetTextLine(monthLine, dateFormatter.string(date).toUpperCase(), {
    color: settings_default.textColor,
    textSize: 14,
    font: Font.boldSystemFont(13)
  });
  const calendarStack = rightStack.addStack();
  calendarStack.spacing = 2;
  const month = buildMonthVertical();
  const {eventCounts, intensity} = await countEvents();
  for (let i = 0; i < month.length; i += 1) {
    let weekdayStack = calendarStack.addStack();
    weekdayStack.layoutVertically();
    for (let j = 0; j < month[i].length; j += 1) {
      let dayStack = weekdayStack.addStack();
      dayStack.size = new Size(spacing, spacing);
      dayStack.centerAlignContent();
      if (month[i][j] === date.getDate().toString()) {
        const highlightedDate = getDateImage(month[i][j], settings_default.todayColor, settings_default.todayTextColor, 1);
        dayStack.addImage(highlightedDate);
      } else if (j > 0 && month[i][j] !== " ") {
        const dateImage = getDateImage(month[i][j], settings_default.eventCircleColor, isWeekend(i) ? settings_default.weekendDates : settings_default.dateTextColor, settings_default.showEventCircles ? eventCounts[parseInt(month[i][j]) - 1] * intensity : 0);
        dayStack.addImage(dateImage);
      } else {
        addWidgetTextLine(dayStack, `${month[i][j]}`, {
          color: isWeekend(i) ? settings_default.weekendLetters : settings_default.textColor,
          opacity: isWeekend(i) ? settings_default.weekendLetterOpacity : 1,
          font: Font.boldSystemFont(10),
          align: "center"
        });
      }
    }
  }
}
async function countEvents() {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstOfNextMonth = new Date(new Date(firstOfMonth).setMonth(firstOfMonth.getMonth() + 1));
  let events = await CalendarEvent.between(firstOfMonth, firstOfNextMonth);
  const eventCounts = events.map((event) => {
    if (event.isAllDay) {
      const firstDay = event.startDate.getDate();
      let lastDay = event.endDate.getDate();
      const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() + 1;
      lastDay = lastDay < firstDay ? lastOfMonth : lastDay;
      let days = [];
      for (let i = firstDay; i < lastDay; i += 1) {
        days.push(i);
      }
      return days;
    } else {
      return [event.startDate.getDate()];
    }
  }).reduce((acc, dates) => {
    dates.forEach((date) => {
      acc[date - 1] = acc[date - 1] + 1;
    });
    return acc;
  }, Array.from(Array(31), () => 0));
  const max = Math.max(...eventCounts);
  const min = Math.min(...eventCounts);
  let intensity = 1 / (max - min + 1);
  intensity = intensity > 0.2 ? 0.2 : intensity;
  return {eventCounts, intensity};
}
function isWeekend(index) {
  if (settings_default.startWeekOnSunday) {
    switch (index) {
      case 0:
      case 6:
        return true;
      default:
        return false;
    }
  }
  return index > 4;
}
function buildMonthVertical() {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  let month = [["M"], ["T"], ["W"], ["T"], ["F"], ["S"]];
  let index = 1;
  let offset = 1;
  let firstDay = firstOfMonth.getDay() !== 0 ? firstOfMonth.getDay() : 7;
  if (settings_default.startWeekOnSunday) {
    month.unshift(["S"]);
    index = 0;
    offset = 0;
    firstDay = firstDay % 7;
  } else {
    month.push(["S"]);
  }
  let dayStackCounter = 0;
  for (; index < firstDay; index += 1) {
    month[index - offset].push(" ");
    dayStackCounter = (dayStackCounter + 1) % 7;
  }
  for (let date = 1; date <= lastOfMonth.getDate(); date += 1) {
    month[dayStackCounter].push(`${date}`);
    dayStackCounter = (dayStackCounter + 1) % 7;
  }
  const length = month.reduce((acc, dayStacks) => dayStacks.length > acc ? dayStacks.length : acc, 0);
  month.forEach((dayStacks, index2) => {
    while (dayStacks.length < length) {
      month[index2].push(" ");
    }
  });
  return month;
}
function getDateImage(date, backgroundColor, textColor, intensity) {
  const drawing = new DrawContext();
  drawing.respectScreenScale = true;
  const size = 50;
  drawing.size = new Size(size, size);
  drawing.opaque = false;
  drawing.setFillColor(new Color(backgroundColor, intensity));
  drawing.fillEllipse(new Rect(1, 1, size - 2, size - 2));
  drawing.setFont(Font.boldSystemFont(25));
  drawing.setTextAlignedCenter();
  drawing.setTextColor(new Color(textColor));
  drawing.drawTextInRect(date, new Rect(0, 10, size, size));
  return drawing.getImage();
}
function formatTime(date) {
  let dateFormatter = new DateFormatter();
  dateFormatter.useNoDateStyle();
  dateFormatter.useShortTimeStyle();
  return dateFormatter.string(date);
}
function getSuffix(date) {
  if (date > 3 && date < 21)
    return "th";
  switch (date % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
function formatEvent(stack, event, color, opacity) {
  let eventLine = stack.addStack();
  if (settings_default.showCalendarBullet) {
    addWidgetTextLine(eventLine, "\u25CF ", {
      color: event.calendar.color.hex,
      font: Font.mediumSystemFont(14),
      lineLimit: settings_default.showCompleteTitle ? 0 : 1
    });
  }
  addWidgetTextLine(eventLine, event.title, {
    color,
    font: Font.mediumSystemFont(14),
    lineLimit: settings_default.showCompleteTitle ? 0 : 1
  });
  let time;
  if (event.isAllDay) {
    time = "All Day";
  } else {
    time = `${formatTime(event.startDate)} - ${formatTime(event.endDate)}`;
  }
  const today = new Date().getDate();
  const eventDate = event.startDate.getDate();
  if (eventDate !== today) {
    time = `${eventDate}${getSuffix(eventDate)} ${time}`;
  }
  addWidgetTextLine(stack, time, {
    color,
    opacity,
    font: Font.regularSystemFont(14)
  });
}
function addWidgetTextLine(widget, text, {
  color = "#ffffff",
  textSize = 12,
  opacity = 1,
  align,
  font = "",
  lineLimit = 0
}) {
  let textLine = widget.addText(text);
  textLine.textColor = new Color(color);
  textLine.lineLimit = lineLimit;
  if (typeof font === "string") {
    textLine.font = new Font(font, textSize);
  } else {
    textLine.font = font;
  }
  textLine.textOpacity = opacity;
  switch (align) {
    case "left":
      textLine.leftAlignText();
      break;
    case "center":
      textLine.centerAlignText();
      break;
    case "right":
      textLine.rightAlignText();
      break;
    default:
      textLine.leftAlignText();
      break;
  }
}
function getImageUrl(name) {
  let fm = FileManager.iCloud();
  let dir = fm.documentsDirectory();
  return fm.joinPath(dir, `${name}`);
}
function setWidgetBackground(widget, imageName) {
  const imageUrl = getImageUrl(imageName);
  widget.backgroundImage = Image.fromFile(imageUrl);
}
