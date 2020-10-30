// use true to initially give Scriptable calendar access
// use false to open Calendar when script is run - when tapping on the widget
const debug = false;

// get widget params
const params = JSON.parse(args.widgetParameter) || { bg: "1121.jpg" };
// a separate image can be specified per widget in widget params:
// Long press on widget -> Edit Widget -> Parameter
// parameter config would look like this:
// { "bg": "2111.jpg", "view": "events" }
const imageName = params.bg;
const widgetBackgroundColor = "#000000";
// background color for today
const todayColor = "#ffffff";
// background for all other days, only applicable if showEventCircles is true
const eventCircleColor = "#000000";
const todayTextColor = "#000000";
const dateTextColor = "#ffffff";
// color for events
const textColor = "#ffffff";
// opacity value for weekends and event times
const opacity = 0.7;
// choose either a split view or show only one of them
const showEventsView = params.view ? params.view === "events" : true;
const showCalendarView = params.view ? params.view === "cal" : true;
// show or hide all day events
const showAllDayEvents = true;
// show calendar colored bullet for each event
const showCalendarBullet = true;
// week starts on a Sunday
const startWeekOnSunday = false;
// show events for the whole week or limit just to the day
const showEventsForWholeWeek = false;
// show full title or truncate to a single line
const showCompleteTitle = false;
// show a circle behind each date that has an event then
const showEventCircles = true;

if (config.runsInWidget) {
  let widget = await createWidget();
  Script.setWidget(widget);
  Script.complete();
} else if (debug) {
  Script.complete();
  let widget = await createWidget();
  await widget.presentMedium();
} else {
  const appleDate = new Date("2001/01/01");
  const timestamp = (new Date().getTime() - appleDate.getTime()) / 1000;
  const callback = new CallbackURL("calshow:" + timestamp);
  callback.open();
  Script.complete();
}

async function createWidget() {
  let widget = new ListWidget();
  widget.widgetBackgroundColor = new Color(widgetBackgroundColor);
  setWidgetBackground(widget, imageName);
  widget.setPadding(16, 16, 16, 16);

  // layout horizontally
  const globalStack = widget.addStack();

  if (showEventsView) {
    await buildEventsView(globalStack);
  }
  if (showCalendarView) {
    await buildCalendarView(globalStack);
  }

  return widget;
}

/**
 * Builds the events view
 *
 * @param  {WidgetStack} stack - onto which the events view is built
 */
async function buildEventsView(stack) {
  const leftStack = stack.addStack();
  // push event view to the left
  stack.addSpacer();

  leftStack.layoutVertically();
  // center the whole left part of the widget
  leftStack.addSpacer();

  const date = new Date();

  let events = [];
  if (showEventsForWholeWeek) {
    events = await CalendarEvent.thisWeek([]);
  } else {
    events = await CalendarEvent.today([]);
  }
  const futureEvents = [];
  // if we show events for the whole week, then we need to filter allDay events
  // to not show past allDay events
  // if allDayEvent's start date is later than a day ago from now then show it
  for (const event of events) {
    if (
      (showAllDayEvents &&
        event.isAllDay &&
        event.startDate.getTime() >
          new Date(new Date().setDate(new Date().getDate() - 1))) ||
      (event.endDate.getTime() > date.getTime() &&
        !event.title.startsWith("Canceled:"))
    ) {
      futureEvents.push(event);
    }
  }

  // if we have events today; else if we don't
  if (futureEvents.length !== 0) {
    // show the next 3 events at most
    const numEvents = futureEvents.length > 3 ? 3 : futureEvents.length;
    for (let i = 0; i < numEvents; i += 1) {
      formatEvent(leftStack, futureEvents[i], textColor, opacity);
      // don't add a spacer after the last event
      if (i < numEvents - 1) {
        leftStack.addSpacer(8);
      }
    }
  } else {
    addWidgetTextLine(leftStack, `No more events.`, {
      color: textColor,
      opacity,
      font: Font.regularSystemFont(15),
      align: "left",
    });
  }
  // for centering
  leftStack.addSpacer();
}

/**
 * Builds the calendar view
 *
 * @param  {WidgetStack} stack - onto which the calendar is built
 */
async function buildCalendarView(stack) {
  const rightStack = stack.addStack();
  rightStack.layoutVertically();

  const date = new Date();
  const dateFormatter = new DateFormatter();
  dateFormatter.dateFormat = "MMMM";

  // if calendar is on a small widget make it a bit smaller to fit
  const spacing = config.widgetFamily === "small" ? 18 : 20;

  // Current month line
  const monthLine = rightStack.addStack();
  // since dates are centered in their squares we need to add some space
  monthLine.addSpacer(4);
  addWidgetTextLine(monthLine, dateFormatter.string(date).toUpperCase(), {
    color: textColor,
    textSize: 14,
    font: Font.boldSystemFont(13),
  });

  // between the month name and the week calendar
  rightStack.addSpacer(5);

  const calendarStack = rightStack.addStack();
  calendarStack.spacing = 2;

  const month = buildMonthVertical();

  const { eventCounts, intensity } = await countEvents();

  for (let i = 0; i < month.length; i += 1) {
    let weekdayStack = calendarStack.addStack();
    weekdayStack.layoutVertically();

    for (let j = 0; j < month[i].length; j += 1) {
      let dayStack = weekdayStack.addStack();
      dayStack.size = new Size(spacing, spacing);
      dayStack.centerAlignContent();

      // if the day is today, highlight it
      if (month[i][j] === date.getDate().toString()) {
        const highlightedDate = getDateImage(
          month[i][j],
          todayColor,
          todayTextColor,
          showEventCircles
            ? eventCounts[parseInt(month[i][j]) - 1] * intensity
            : 1
        );
        dayStack.addImage(highlightedDate);
      } else if (j > 0 && month[i][j] !== " ") {
        const dateImage = getDateImage(
          month[i][j],
          eventCircleColor,
          dateTextColor,
          showEventCircles
            ? eventCounts[parseInt(month[i][j]) - 1] * intensity
            : 0
        );
        dayStack.addImage(dateImage);
      } else {
        addWidgetTextLine(dayStack, `${month[i][j]}`, {
          color: textColor,
          opacity: isWeekend(i) ? opacity : 1,
          font: Font.boldSystemFont(10),
          align: "center",
        });
      }
    }
  }
}

async function countEvents() {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastOfMonth = new Date(
    new Date(firstOfMonth).setMonth(firstOfMonth.getMonth() + 1)
  );

  let events = await CalendarEvent.between(firstOfMonth, lastOfMonth);

  const eventCounts = events
    .map((event) => event.startDate.getDate())
    .reduce(
      (acc, date) => {
        // 0 indexed, so date in array is at post date-1
        acc[date - 1] = acc[date - 1] + 1;
        return acc;
      },
      Array.from(Array(31), () => 0)
    );

  const max = Math.max(...eventCounts);
  const min = Math.min(...eventCounts);

  // calculate an intensity coefficient based on the events' range for the
  // current month. If the range is from 1 to 6, the coefficient is 0.17, the
  // event background's alpha value will be 0.17 * numEvents that day
  let intensity = 1 / (max - min + 1);
  // for a low range the intensity would be closer to 1, so we limit the
  // intensity at most to 0.2
  intensity = intensity > 0.2 ? 0.2 : intensity;

  return { eventCounts, intensity };
}

/**
 * If the week starts on a Sunday indeces 0 and 6 are for weekends
 * else indices 5 and 6
 *
 * @param  {number} index
 */
function isWeekend(index) {
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

/**
 * Creates an array of arrays, where the inner arrays include the same weekdays
 * along with a weekday identifier in the 0th position
 * [
 *   [ 'M', ' ', '7', '14', '21', '28' ],
 *   [ 'T', '1', '8', '15', '22', '29' ],
 *   [ 'W', '2', '9', '16', '23', '30' ],
 *   ...
 * ]
 *
 * @returns {Array<Array<string>>}
 */
function buildMonthVertical() {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  let month = [["M"], ["T"], ["W"], ["T"], ["F"], ["S"]];
  let index = 1;
  let offset = 1;

  if (startWeekOnSunday) {
    month.unshift(["S"]);
    index = 0;
    offset = 0;
  } else {
    month.push(["S"]);
  }

  let dayStackCounter = 0;

  // fill with empty slots
  for (; index < firstOfMonth.getDay(); index += 1) {
    month[index - offset].push(" ");
    dayStackCounter = (dayStackCounter + 1) % 7;
  }

  for (let date = 1; date <= lastOfMonth.getDate(); date += 1) {
    month[dayStackCounter].push(`${date}`);
    dayStackCounter = (dayStackCounter + 1) % 7;
  }

  const length = month.reduce(
    (acc, dayStacks) => (dayStacks.length > acc ? dayStacks.length : acc),
    0
  );
  month.forEach((dayStacks, index) => {
    while (dayStacks.length < length) {
      month[index].push(" ");
    }
  });

  return month;
}

/**
 * Creates images for dates, depending on the number of events that day
 *
 * @param  {string} date - to draw into the circle
 * @param  {string} color - of the background
 * @param  {number} intensity - a calculated coefficient for alpha value
 * @param  {boolean} isToday - is it today's date, for highlighting
 *
 * @returns {Image} a circle with the date
 */
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

/**
 * formats the event times into just hours
 *
 * @param  {Date} date
 *
 * @returns {string} time
 */
function formatTime(date) {
  let dateFormatter = new DateFormatter();
  dateFormatter.useNoDateStyle();
  dateFormatter.useShortTimeStyle();
  return dateFormatter.string(date);
}

/**
 * get suffix for a given date
 *
 * @param {number} date
 *
 * @returns {string} suffix
 */
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

/**
 * Adds a event name along with start and end times to widget stack
 *
 * @param  {WidgetStack} stack - onto which the event is added
 * @param  {CalendarEvent} event - an event to add on the stack
 * @param  {number} opacity - text opacity
 */
function formatEvent(stack, event, color, opacity) {
  let eventLine = stack.addStack();

  if (showCalendarBullet) {
    // show calendar bullet in front of event name
    addWidgetTextLine(eventLine, "● ", {
      color: event.calendar.color.hex,
      font: Font.mediumSystemFont(14),
      lineLimit: 1,
    });
  }

  // event title
  addWidgetTextLine(eventLine, event.title, {
    color,
    font: Font.mediumSystemFont(14),
    lineLimit: showCompleteTitle ? 0 : 1,
  });
  // event duration
  let time;
  if (event.isAllDay) {
    time = "All Day";
  } else {
    time = `${formatTime(event.startDate)} - ${formatTime(event.endDate)}`;
  }

  const today = new Date().getDate();
  const eventDate = event.startDate.getDate();
  // if a future event is not today, we want to show it's date
  if (eventDate !== today) {
    time = `${eventDate}${getSuffix(eventDate)} ${time}`;
  }

  // event time
  addWidgetTextLine(stack, time, {
    color,
    opacity,
    font: Font.regularSystemFont(14),
  });
}

function addWidgetTextLine(
  widget,
  text,
  {
    color = "#ffffff",
    textSize = 12,
    opacity = 1,
    align,
    font = "",
    lineLimit = 0,
  }
) {
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
