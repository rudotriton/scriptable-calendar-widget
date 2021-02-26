// src/settings.ts
var params = JSON.parse(args.widgetParameter) || { bg: "transparent.jpg" };
var settings = {
  debug: true,
  imageName: params.bg,
  widgetBackgroundColor: "#000000",
  todayColor: "#F24747",
  eventCircleColor: "#304F9E",
  todayTextColor: "#000000",
  dateTextColor: "#ffffff",
  locale: "en-US",
  weekendLetters: "#ffffff",
  weekendLetterOpacity: 0.7,
  weekendDates: "#ffffff",
  textColor: "#ffffff",
  opacity: 0.7,
  showEventsView: params.view ? params.view === "events" : true,
  showCalendarView: params.view ? params.view === "cal" : true,
  showAllDayEvents: true,
  showCalendarBullet: true,
  startWeekOnSunday: true,
  showEventsOnlyForToday: false,
  nextNumOfDays: 7,
  showCompleteTitle: false,
  showEventCircles: true,
  showPrevMonth: true,
  showNextMonth: true,
};
var settings_default = settings;

// src/addWidgetTextLine.ts
function addWidgetTextLine(
  text,
  widget,
  {
    textColor = "#ffffff",
    textSize = 12,
    opacity = 1,
    align,
    font,
    lineLimit = 0,
  }
) {
  const textLine = widget.addText(text);
  textLine.textColor = new Color(textColor, 1);
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
var addWidgetTextLine_default = addWidgetTextLine;

// src/getImageUrl.ts
function getImageUrl(name) {
  let fm = FileManager.iCloud();
  let dir = fm.documentsDirectory();
  return fm.joinPath(dir, `${name}`);
}
var getImageUrl_default = getImageUrl;

// src/setWidgetBackground.ts
function setWidgetBackground(widget, imageName) {
  const imageUrl = getImageUrl_default(imageName);
  const image = Image.fromFile(imageUrl);
  widget.backgroundImage = image;
}
var setWidgetBackground_default = setWidgetBackground;

// src/formatTime.ts
function formatTime(date) {
  let dateFormatter = new DateFormatter();
  dateFormatter.useNoDateStyle();
  dateFormatter.useShortTimeStyle();
  return dateFormatter.string(date);
}
var formatTime_default = formatTime;

// src/getSuffix.ts
function getSuffix(date) {
  if (date > 3 && date < 21) return "th";
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
var getSuffix_default = getSuffix;

// src/formatEvent.ts
function formatEvent(
  stack,
  event,
  { opacity, textColor, showCalendarBullet, showCompleteTitle }
) {
  const eventLine = stack.addStack();
  if (showCalendarBullet) {
    addWidgetTextLine_default("\u25CF ", eventLine, {
      textColor: event.calendar.color.hex,
      font: Font.mediumSystemFont(14),
      lineLimit: showCompleteTitle ? 0 : 1,
    });
  }
  addWidgetTextLine_default(event.title, eventLine, {
    textColor,
    font: Font.mediumSystemFont(14),
    lineLimit: showCompleteTitle ? 0 : 1,
  });
  let time;
  if (event.isAllDay) {
    time = "All Day";
  } else {
    time = `${formatTime_default(event.startDate)} - ${formatTime_default(
      event.endDate
    )}`;
  }
  const today = new Date().getDate();
  const eventDate = event.startDate.getDate();
  if (eventDate !== today) {
    time = `${eventDate}${getSuffix_default(eventDate)} ${time}`;
  }
  addWidgetTextLine_default(time, stack, {
    textColor,
    opacity,
    font: Font.regularSystemFont(14),
  });
}
var formatEvent_default = formatEvent;

// src/getMonthBoundaries.ts
function getMonthBoundaries(date) {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { firstOfMonth, lastOfMonth };
}
var getMonthBoundaries_default = getMonthBoundaries;

// src/getPreviousMonth.ts
function getPreviousMonth(date) {
  const newDate = new Date(date);
  let prevMonth = date.getMonth() - 1;
  if (prevMonth < 0) {
    prevMonth += 12;
    newDate.setFullYear(date.getFullYear() - 1);
  }
  newDate.setMonth(prevMonth);
  return newDate;
}
var getPreviousMonth_default = getPreviousMonth;

// src/getWeekLetters.ts
function getWeekLetters(locale = "en-US", startWeekOnSunday = false) {
  let week = [];
  for (let i = 1; i <= 7; i += 1) {
    const day = new Date(`2021-02-0${i}`);
    week.push(day.toLocaleDateString(locale, { weekday: "long" }));
  }
  week = week.map((day) => [day.slice(0, 1).toUpperCase()]);
  if (startWeekOnSunday) {
    const sunday = week.pop();
    week.unshift(sunday);
  }
  return week;
}
var getWeekLetters_default = getWeekLetters;

// src/buildMonth.ts
function buildMonth(
  date = new Date(),
  {
    locale,
    showPrevMonth = true,
    showNextMonth = true,
    startWeekOnSunday = false,
  }
) {
  const currentMonth = getMonthBoundaries_default(date);
  const prevMonth = getMonthBoundaries_default(getPreviousMonth_default(date));
  const month = getWeekLetters_default(locale, startWeekOnSunday);
  let daysFromPrevMonth = 0;
  let daysFromNextMonth = 0;
  let index = 1;
  let offset = 1;
  let firstDay =
    currentMonth.firstOfMonth.getDay() !== 0
      ? currentMonth.firstOfMonth.getDay()
      : 7;
  if (startWeekOnSunday) {
    index = 0;
    offset = 0;
    firstDay = firstDay % 7;
  }
  let dayStackCounter = 0;
  for (; index < firstDay; index += 1) {
    if (showPrevMonth) {
      month[index - offset].push(
        `${prevMonth.lastOfMonth.getDate() - firstDay + 1 + index}`
      );
      daysFromPrevMonth += 1;
    } else {
      month[index - offset].push(" ");
    }
    dayStackCounter = (dayStackCounter + 1) % 7;
  }
  for (let date2 = 1; date2 <= currentMonth.lastOfMonth.getDate(); date2 += 1) {
    month[dayStackCounter].push(`${date2}`);
    dayStackCounter = (dayStackCounter + 1) % 7;
  }
  const length = month.reduce(
    (acc, dayStacks) => (dayStacks.length > acc ? dayStacks.length : acc),
    0
  );
  month.forEach((dayStacks, index2) => {
    while (dayStacks.length < length) {
      if (showNextMonth) {
        daysFromNextMonth += 1;
        month[index2].push(`${daysFromNextMonth}`);
      } else {
        month[index2].push(" ");
      }
    }
  });
  return { month, daysFromPrevMonth, daysFromNextMonth };
}
var buildMonth_default = buildMonth;

// src/countEvents.ts
async function countEvents(date, extendToPrev = 0, extendToNext = 0) {
  const { firstOfMonth } = getMonthBoundaries_default(date);
  const { startDate, endDate } = extendBoundaries(
    firstOfMonth,
    extendToPrev,
    extendToNext
  );
  const events = await CalendarEvent.between(startDate, endDate);
  const eventCounts = new Map();
  events
    .filter((event) => event.calendar.title === "Test")
    .forEach((event) => {
      if (event.isAllDay) {
        let date2 = event.startDate;
        do {
          updateEventCounts(date2, eventCounts);
          date2.setDate(date2.getDate() + 1);
        } while (date2 < event.endDate);
      } else {
        updateEventCounts(event.startDate, eventCounts);
      }
    });
  const intensity = calculateIntensity(eventCounts);
  eventCounts.forEach((value, key) => console.log(`${key}: ${value}`));
  console.log(intensity);
  return { eventCounts: new Map(), intensity };
}
function extendBoundaries(first, extendToPrev, extendToNext) {
  const startDate = new Date(
    first.getFullYear(),
    first.getMonth(),
    first.getDay() - extendToPrev
  );
  const endDate = new Date(
    first.getFullYear(),
    first.getMonth() + 1,
    first.getDay() + extendToNext
  );
  return { startDate, endDate };
}
function updateEventCounts(date, eventCounts) {
  if (eventCounts.has(`${date.getMonth()}/${date.getDate()}`)) {
    eventCounts.set(
      `${date.getMonth()}/${date.getDate()}`,
      eventCounts.get(`${date.getMonth()}/${date.getDate()}`) + 1
    );
  } else {
    eventCounts.set(`${date.getMonth()}/${date.getDate()}`, 1);
  }
}
function calculateIntensity(eventCounts) {
  const counter = eventCounts.values();
  const counts = [];
  for (let count of counter) {
    counts.push(count);
  }
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  let intensity = 1 / (max - min + 1);
  intensity = intensity > 0.2 ? 0.2 : intensity;
  return intensity;
}
var countEvents_default = countEvents;

// src/createDateImage.ts
function createDateImage(date, backgroundColor, textColor, intensity) {
  const drawing = new DrawContext();
  drawing.respectScreenScale = true;
  const size = 50;
  drawing.size = new Size(size, size);
  drawing.opaque = false;
  drawing.setFillColor(new Color(backgroundColor, intensity));
  drawing.fillEllipse(new Rect(1, 1, size - 2, size - 2));
  drawing.setFont(Font.boldSystemFont(25));
  drawing.setTextAlignedCenter();
  drawing.setTextColor(new Color(textColor, 1));
  drawing.drawTextInRect(date, new Rect(0, 10, size, size));
  return drawing.getImage();
}
var createDateImage_default = createDateImage;

// src/isWeekend.ts
function isWeekend(
  index,
  { startWeekOnSunday } = {
    startWeekOnSunday: false,
  }
) {
  if (startWeekOnSunday) {
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
var isWeekend_default = isWeekend;

// src/buildCalendarView.ts
async function buildCalendarView(date, stack) {
  const rightStack = stack.addStack();
  rightStack.layoutVertically();
  const dateFormatter = new DateFormatter();
  dateFormatter.dateFormat = "MMMM";
  const spacing = config.widgetFamily === "small" ? 18 : 19;
  const monthLine = rightStack.addStack();
  monthLine.addSpacer(4);
  addWidgetTextLine_default(
    dateFormatter.string(date).toUpperCase(),
    monthLine,
    {
      textColor: settings_default.textColor,
      textSize: 14,
      font: Font.boldSystemFont(13),
    }
  );
  const calendarStack = rightStack.addStack();
  calendarStack.spacing = 2;
  const { month, daysFromPrevMonth, daysFromNextMonth } = buildMonth_default(
    date,
    settings_default
  );
  const { eventCounts, intensity } = await countEvents_default(
    date,
    daysFromPrevMonth,
    daysFromNextMonth
  );
  for (let i = 0; i < month.length; i += 1) {
    let weekdayStack = calendarStack.addStack();
    weekdayStack.layoutVertically();
    for (let j = 0; j < month[i].length; j += 1) {
      let dayStack = weekdayStack.addStack();
      dayStack.size = new Size(spacing, spacing);
      dayStack.centerAlignContent();
      if (month[i][j] === date.getDate().toString()) {
        const highlightedDate = createDateImage_default(
          month[i][j],
          settings_default.todayColor,
          settings_default.todayTextColor,
          1
        );
        dayStack.addImage(highlightedDate);
      } else if (j > 0 && month[i][j] !== " ") {
        const dateImage = createDateImage_default(
          month[i][j],
          settings_default.eventCircleColor,
          isWeekend_default(i)
            ? settings_default.weekendDates
            : settings_default.dateTextColor,
          settings_default.showEventCircles
            ? eventCounts[parseInt(month[i][j]) - 1] * intensity
            : 0
        );
        dayStack.addImage(dateImage);
      } else {
        addWidgetTextLine_default(`${month[i][j]}`, dayStack, {
          textColor: isWeekend_default(i)
            ? settings_default.weekendLetters
            : settings_default.textColor,
          opacity: isWeekend_default(i)
            ? settings_default.weekendLetterOpacity
            : 1,
          font: Font.boldSystemFont(10),
          align: "center",
        });
      }
    }
  }
}
var buildCalendarView_default = buildCalendarView;

// src/index.ts
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
  widget.backgroundColor = new Color(settings_default.widgetBackgroundColor, 1);
  setWidgetBackground_default(widget, settings_default.imageName);
  widget.setPadding(16, 16, 16, 16);
  const today = new Date();
  const globalStack = widget.addStack();
  if (settings_default.showEventsView) {
    await buildEventsView(globalStack);
  }
  if (settings_default.showCalendarView) {
    await buildCalendarView_default(today, globalStack);
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
    if (
      (settings_default.showAllDayEvents &&
        event.isAllDay &&
        event.startDate.getTime() >
          new Date(new Date().setDate(new Date().getDate() - 1)).getTime()) ||
      (event.endDate.getTime() > date.getTime() &&
        !event.title.startsWith("Canceled:") &&
        event.calendar.title === "Test")
    ) {
      futureEvents.push(event);
    }
  }
  if (futureEvents.length !== 0) {
    const numEvents = futureEvents.length > 3 ? 3 : futureEvents.length;
    for (let i = 0; i < numEvents; i += 1) {
      formatEvent_default(leftStack, futureEvents[i], settings_default);
      if (i < numEvents - 1) {
        leftStack.addSpacer(8);
      }
    }
  } else {
    addWidgetTextLine_default(`No more events.`, leftStack, {
      textColor: settings_default.textColor,
      opacity: settings_default.opacity,
      font: Font.regularSystemFont(15),
      align: "left",
    });
  }
  leftStack.addSpacer();
}

await main();
