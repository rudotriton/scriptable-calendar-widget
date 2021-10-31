// src/settings.ts
var params = JSON.parse(args.widgetParameter) || {};
var settings = {
  debug: false,
  calendarApp: "calshow",
  backgroundImage: params.bg ? params.bg : "transparent.jpg",
  widgetBackgroundColor: "#000000",
  todayTextColor: "#000000",
  markToday: true,
  todayCircleColor: "#FFB800",
  showEventCircles: true,
  eventCircleColor: "#1E5C7B",
  weekdayTextColor: "#ffffff",
  weekendLetters: "#FFB800",
  weekendLetterOpacity: 1,
  weekendDates: "#FFB800",
  locale: "en-US",
  textColor: "#ffffff",
  eventDateTimeOpacity: 0.7,
  widgetType: params.view ? params.view : "cal",
  showAllDayEvents: true,
  showCalendarBullet: true,
  startWeekOnSunday: false,
  showEventsOnlyForToday: false,
  nextNumOfDays: 7,
  showCompleteTitle: false,
  showPrevMonth: true,
  showNextMonth: true,
  individualDateTargets: false,
};
var settings_default = settings;

// src/setWidgetBackground.ts
function setWidgetBackground(widget, imageName) {
  const imageUrl = getImageUrl(imageName);
  const image = Image.fromFile(imageUrl);
  widget.backgroundImage = image;
}
function getImageUrl(name) {
  const fm = FileManager.iCloud();
  const dir = fm.documentsDirectory();
  return fm.joinPath(dir, `${name}`);
}
var setWidgetBackground_default = setWidgetBackground;

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

// src/getMonthBoundaries.ts
function getMonthBoundaries(date) {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { firstOfMonth, lastOfMonth };
}
var getMonthBoundaries_default = getMonthBoundaries;

// src/getMonthOffset.ts
function getMonthOffset(date, offset) {
  const newDate = new Date(date);
  let offsetMonth = date.getMonth() + offset;
  if (offsetMonth < 0) {
    offsetMonth += 12;
    newDate.setFullYear(date.getFullYear() - 1);
  } else if (offsetMonth > 11) {
    offsetMonth -= 12;
    newDate.setFullYear(date.getFullYear() + 1);
  }
  newDate.setMonth(offsetMonth);
  return newDate;
}
var getMonthOffset_default = getMonthOffset;

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

// src/buildCalendar.ts
function buildCalendar(
  date = new Date(),
  {
    locale,
    showPrevMonth = true,
    showNextMonth = true,
    startWeekOnSunday = false,
  }
) {
  const currentMonth = getMonthBoundaries_default(date);
  const prevMonth = getMonthBoundaries_default(
    getMonthOffset_default(date, -1)
  );
  const calendar = getWeekLetters_default(locale, startWeekOnSunday);
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
      calendar[index - offset].push(
        `${prevMonth.lastOfMonth.getMonth()}/${
          prevMonth.lastOfMonth.getDate() - firstDay + 1 + index
        }`
      );
      daysFromPrevMonth += 1;
    } else {
      calendar[index - offset].push(" ");
    }
    dayStackCounter = (dayStackCounter + 1) % 7;
  }
  for (
    let indexDate = 1;
    indexDate <= currentMonth.lastOfMonth.getDate();
    indexDate += 1
  ) {
    calendar[dayStackCounter].push(`${date.getMonth()}/${indexDate}`);
    dayStackCounter = (dayStackCounter + 1) % 7;
  }
  let longestColumn = calendar.reduce(
    (acc, dayStacks) => (dayStacks.length > acc ? dayStacks.length : acc),
    0
  );
  if (showNextMonth && longestColumn < 6) {
    longestColumn += 1;
  }
  const nextMonth = getMonthOffset_default(date, 1);
  calendar.forEach((dayStacks, index2) => {
    while (dayStacks.length < longestColumn) {
      if (showNextMonth) {
        daysFromNextMonth += 1;
        calendar[index2].push(`${nextMonth.getMonth()}/${daysFromNextMonth}`);
      } else {
        calendar[index2].push(" ");
      }
    }
  });
  return { calendar, daysFromPrevMonth, daysFromNextMonth };
}
var buildCalendar_default = buildCalendar;

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
  events.forEach((event) => {
    if (event.isAllDay) {
      const date2 = event.startDate;
      do {
        updateEventCounts(date2, eventCounts);
        date2.setDate(date2.getDate() + 1);
      } while (date2 < event.endDate);
    } else {
      updateEventCounts(event.startDate, eventCounts);
    }
  });
  const intensity = calculateIntensity(eventCounts);
  return { eventCounts, intensity };
}
function extendBoundaries(first, extendToPrev, extendToNext) {
  const startDate = new Date(
    first.getFullYear(),
    first.getMonth(),
    first.getDate() - extendToPrev
  );
  const endDate = new Date(
    first.getFullYear(),
    first.getMonth() + 1,
    first.getDate() + extendToNext
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
  for (const count of counter) {
    counts.push(count);
  }
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  let intensity = 1 / (max - min + 1);
  intensity = intensity < 0.3 ? 0.3 : intensity;
  return intensity;
}
var countEvents_default = countEvents;

// src/createDateImage.ts
function createDateImage(
  text,
  { backgroundColor, textColor, intensity, toFullSize }
) {
  const size = toFullSize ? 50 : 35;
  const drawing = new DrawContext();
  drawing.respectScreenScale = true;
  const contextSize = 50;
  drawing.size = new Size(contextSize, contextSize);
  drawing.opaque = false;
  drawing.setFillColor(new Color(backgroundColor, intensity));
  drawing.fillEllipse(
    new Rect(
      (contextSize - (size - 2)) / 2,
      (contextSize - (size - 2)) / 2,
      size - 2,
      size - 2
    )
  );
  drawing.setFont(Font.boldSystemFont(size * 0.5));
  drawing.setTextAlignedCenter();
  drawing.setTextColor(new Color(textColor, 1));
  const textBox = new Rect(
    (contextSize - size) / 2,
    (contextSize - size * 0.5) / 2 - 3,
    size,
    size * 0.5
  );
  drawing.drawTextInRect(text, textBox);
  return drawing.getImage();
}
var createDateImage_default = createDateImage;

// src/isDateFromBoundingMonth.ts
function isDateFromBoundingMonth(row, column, date, calendar) {
  const [month] = calendar[row][column].split("/");
  const currentMonth = date.getMonth().toString();
  return month === currentMonth;
}
var isDateFromBoundingMonth_default = isDateFromBoundingMonth;

// src/isWeekend.ts
function isWeekend(index, startWeekOnSunday = false) {
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

// src/createUrl.ts
function createUrl(day, month, date, settings2) {
  let url;
  let year;
  const currentMonth = date.getMonth();
  if (currentMonth === 11 && Number(month) === 1) {
    year = date.getFullYear() + 1;
  } else if (currentMonth === 0 && Number(month) === 11) {
    year = date.getFullYear() - 1;
  } else {
    year = date.getFullYear();
  }
  if (settings2.calendarApp === "calshow") {
    const appleDate = new Date("2001/01/01");
    const timestamp =
      (new Date(`${year}/${Number(month) + 1}/${day}`).getTime() -
        appleDate.getTime()) /
      1e3;
    url = `calshow:${timestamp}`;
  } else if (settings2.calendarApp === "x-fantastical3") {
    url = `${settings2.calendarApp}://show/calendar/${year}-${
      Number(month) + 1
    }-${day}`;
  } else {
    url = "";
  }
  return url;
}
var createUrl_default = createUrl;

// src/buildCalendarView.ts
async function buildCalendarView(date, stack, settings2) {
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
      textColor: settings2.textColor,
      textSize: 14,
      font: Font.boldSystemFont(13),
    }
  );
  const calendarStack = rightStack.addStack();
  calendarStack.spacing = 2;
  const { calendar, daysFromPrevMonth, daysFromNextMonth } =
    buildCalendar_default(date, settings2);
  const { eventCounts, intensity } = await countEvents_default(
    date,
    daysFromPrevMonth,
    daysFromNextMonth
  );
  for (let i = 0; i < calendar.length; i += 1) {
    const weekdayStack = calendarStack.addStack();
    weekdayStack.layoutVertically();
    for (let j = 0; j < calendar[i].length; j += 1) {
      const dayStack = weekdayStack.addStack();
      dayStack.size = new Size(spacing, spacing);
      dayStack.centerAlignContent();
      const [day, month] = calendar[i][j].split("/").reverse();
      if (settings2.individualDateTargets) {
        const callbackUrl = createUrl_default(day, month, date, settings2);
        if (j > 0) dayStack.url = callbackUrl;
      }
      if (calendar[i][j] === `${date.getMonth()}/${date.getDate()}`) {
        if (settings2.markToday) {
          const highlightedDate = createDateImage_default(day, {
            backgroundColor: settings2.todayCircleColor,
            textColor: settings2.todayTextColor,
            intensity: 1,
            toFullSize: true,
          });
          dayStack.addImage(highlightedDate);
        } else {
          addWidgetTextLine_default(day, dayStack, {
            textColor: settings2.todayTextColor,
            font: Font.boldSystemFont(10),
            align: "center",
          });
        }
      } else if (j > 0 && calendar[i][j] !== " ") {
        const toFullSize = isDateFromBoundingMonth_default(
          i,
          j,
          date,
          calendar
        );
        const dateImage = createDateImage_default(day, {
          backgroundColor: settings2.eventCircleColor,
          textColor: isWeekend_default(i, settings2.startWeekOnSunday)
            ? settings2.weekendDates
            : settings2.weekdayTextColor,
          intensity: settings2.showEventCircles
            ? eventCounts.get(calendar[i][j]) * intensity
            : 0,
          toFullSize,
        });
        dayStack.addImage(dateImage);
      } else {
        addWidgetTextLine_default(day, dayStack, {
          textColor: isWeekend_default(i, settings2.startWeekOnSunday)
            ? settings2.weekendLetters
            : settings2.textColor,
          opacity: isWeekend_default(i, settings2.startWeekOnSunday)
            ? settings2.weekendLetterOpacity
            : 1,
          font: Font.boldSystemFont(10),
          align: "center",
        });
      }
    }
  }
}
var buildCalendarView_default = buildCalendarView;

// src/formatTime.ts
function formatTime(date) {
  const dateFormatter = new DateFormatter();
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

// src/getEventIcon.ts
function getEventIcon(event) {
  if (event.attendees === null) {
    return "\u25CF ";
  }
  const status = event.attendees.filter((attendee) => attendee.isCurrentUser)[0]
    .status;
  switch (status) {
    case "accepted":
      return "\u2713 ";
    case "tentative":
      return "~ ";
    case "declined":
      return "\u2718 ";
    default:
      return "\u25CF ";
  }
}
var getEventIcon_default = getEventIcon;

// src/formatEvent.ts
function formatEvent(
  stack,
  event,
  { eventDateTimeOpacity, textColor, showCalendarBullet, showCompleteTitle }
) {
  const eventLine = stack.addStack();
  if (showCalendarBullet) {
    const icon = getEventIcon_default(event);
    addWidgetTextLine_default(icon, eventLine, {
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
    opacity: eventDateTimeOpacity,
    font: Font.regularSystemFont(14),
  });
}
var formatEvent_default = formatEvent;

// src/buildEventsView.ts
async function buildEventsView(
  events,
  stack,
  settings2,
  {
    horizontalAlign = "left",
    verticalAlign = "center",
    eventLimit = 3,
    eventSpacer = 8,
    showMsg = true,
  } = {}
) {
  const leftStack = stack.addStack();
  if (horizontalAlign === "left") {
    stack.addSpacer();
  }
  leftStack.layoutVertically();
  if (verticalAlign === "bottom" || verticalAlign === "center") {
    leftStack.addSpacer();
  }
  if (events.length !== 0) {
    const numEvents = events.length > eventLimit ? eventLimit : events.length;
    for (let i = 0; i < numEvents; i += 1) {
      formatEvent_default(leftStack, events[i], settings2);
      if (i < numEvents - 1) {
        leftStack.addSpacer(eventSpacer);
      }
    }
  } else if (showMsg) {
    addWidgetTextLine_default(`No more events.`, leftStack, {
      textColor: settings2.textColor,
      opacity: settings2.eventDateTimeOpacity,
      font: Font.regularSystemFont(15),
    });
  }
  if (verticalAlign === "top" || verticalAlign === "center") {
    leftStack.addSpacer();
  }
}
var buildEventsView_default = buildEventsView;

// src/getEvents.ts
async function getEvents(date, settings2) {
  let events = [];
  if (settings2.showEventsOnlyForToday) {
    events = await CalendarEvent.today([]);
  } else {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() + settings2.nextNumOfDays);
    events = await CalendarEvent.between(date, dateLimit);
  }
  const futureEvents = [];
  for (const event of events) {
    if (
      event.isAllDay &&
      settings2.showAllDayEvents &&
      event.startDate.getTime() >
        new Date(new Date().setDate(new Date().getDate() - 1)).getTime()
    ) {
      futureEvents.push(event);
    } else if (
      !event.isAllDay &&
      event.endDate.getTime() > date.getTime() &&
      !event.title.startsWith("Canceled:")
    ) {
      futureEvents.push(event);
    }
  }
  return futureEvents;
}
var getEvents_default = getEvents;

// src/buildLargeWidget.ts
async function buildLargeWidget(date, events, stack, settings2) {
  const leftSide = stack.addStack();
  stack.addSpacer();
  const rightSide = stack.addStack();
  leftSide.layoutVertically();
  rightSide.layoutVertically();
  rightSide.addSpacer();
  rightSide.centerAlignContent();
  const leftSideEvents = events.slice(0, 8);
  const rightSideEvents = events.slice(8, 12);
  await buildEventsView_default(leftSideEvents, leftSide, settings2, {
    eventLimit: 8,
    eventSpacer: 6,
  });
  await buildCalendarView_default(date, rightSide, settings2);
  rightSide.addSpacer();
  await buildEventsView_default(rightSideEvents, rightSide, settings2, {
    eventLimit: 4,
    eventSpacer: 6,
    verticalAlign: "top",
    showMsg: false,
  });
}
var buildLargeWidget_default = buildLargeWidget;

// src/buildWidget.ts
async function buildWidget(settings2) {
  const widget = new ListWidget();
  widget.backgroundColor = new Color(settings2.widgetBackgroundColor, 1);
  setWidgetBackground_default(widget, settings2.backgroundImage);
  widget.setPadding(16, 16, 16, 16);
  const today = new Date();
  const globalStack = widget.addStack();
  const events = await getEvents_default(today, settings2);
  switch (config.widgetFamily) {
    case "small":
      if (settings2.widgetType === "events") {
        await buildEventsView_default(events, globalStack, settings2);
      } else {
        await buildCalendarView_default(today, globalStack, settings2);
      }
      break;
    case "large":
      await buildLargeWidget_default(today, events, globalStack, settings2);
      break;
    default:
      await buildEventsView_default(events, globalStack, settings2);
      await buildCalendarView_default(today, globalStack, settings2);
      break;
  }
  return widget;
}
var buildWidget_default = buildWidget;

// src/index.ts
async function main() {
  if (config.runsInWidget) {
    const widget = await buildWidget_default(settings_default);
    Script.setWidget(widget);
    Script.complete();
  } else if (settings_default.debug) {
    Script.complete();
    const widget = await buildWidget_default(settings_default);
    await widget.presentMedium();
  } else {
    const appleDate = new Date("2001/01/01");
    const timestamp = (new Date().getTime() - appleDate.getTime()) / 1e3;
    const callback = new CallbackURL(
      `${settings_default.calendarApp}:` + timestamp
    );
    callback.open();
    Script.complete();
  }
}

await main();
