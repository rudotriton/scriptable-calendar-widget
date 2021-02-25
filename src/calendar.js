import settings from "./settings";
import buildMonth from "./buildMonth";

main();

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
    const callback = new CallbackURL("calshow:" + timestamp);
    callback.open();
    Script.complete();
  }
}

async function createWidget() {
  let widget = new ListWidget();
  widget.backgroundColor = new Color(settings.widgetBackgroundColor);
  setWidgetBackground(widget, settings.imageName);
  widget.setPadding(16, 16, 16, 16);

  // layout horizontally
  const globalStack = widget.addStack();

  if (settings.showEventsView) {
    await buildEventsView(globalStack);
  }
  if (settings.showCalendarView) {
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
  if (settings.showEventsOnlyForToday) {
    events = await CalendarEvent.today([]);
  } else {
    let dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() + settings.nextNumOfDays);
    events = await CalendarEvent.between(date, dateLimit);
  }

  const futureEvents = [];
  // if we show events for the whole week, then we need to filter allDay events
  // to not show past allDay events
  // if allDayEvent's start date is later than a day ago from now then show it
  for (const event of events) {
    if (
      (settings.showAllDayEvents &&
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
      formatEvent(
        leftStack,
        futureEvents[i],
        settings.textColor,
        settings.opacity
      );
      // don't add a spacer after the last event
      if (i < numEvents - 1) {
        leftStack.addSpacer(8);
      }
    }
  } else {
    addWidgetTextLine(leftStack, `No more events.`, {
      color: settings.textColor,
      opacity: settings.opacity,
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
  const spacing = config.widgetFamily === "small" ? 18 : 19;

  // Current month line
  const monthLine = rightStack.addStack();
  // since dates are centered in their squares we need to add some space
  monthLine.addSpacer(4);
  addWidgetTextLine(monthLine, dateFormatter.string(date).toUpperCase(), {
    color: settings.textColor,
    textSize: 14,
    font: Font.boldSystemFont(13),
  });

  const calendarStack = rightStack.addStack();
  calendarStack.spacing = 2;

  const { month } = buildMonth(new Date(), settings);

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
          settings.todayColor,
          settings.todayTextColor,
          1
        );
        dayStack.addImage(highlightedDate);
      } else if (j > 0 && month[i][j] !== " ") {
        // every other date
        const dateImage = getDateImage(
          month[i][j],
          settings.eventCircleColor,
          isWeekend(i) ? settings.weekendDates : settings.dateTextColor,
          settings.showEventCircles
            ? eventCounts[parseInt(month[i][j]) - 1] * intensity
            : 0
        );
        dayStack.addImage(dateImage);
      } else {
        // MTWTFSS line and empty dates from other months
        addWidgetTextLine(dayStack, `${month[i][j]}`, {
          color: isWeekend(i) ? settings.weekendLetters : settings.textColor,
          opacity: isWeekend(i) ? settings.weekendLetterOpacity : 1,
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
  const firstOfNextMonth = new Date(
    new Date(firstOfMonth).setMonth(firstOfMonth.getMonth() + 1)
  );

  let events = await CalendarEvent.between(firstOfMonth, firstOfNextMonth);

  const eventCounts = events
    .map((event) => {
      if (event.isAllDay) {
        const firstDay = event.startDate.getDate();
        let lastDay = event.endDate.getDate();
        const lastOfMonth =
          new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() + 1;
        // if the last day goes into the next month, it can be less than first
        // in this case we count to the end of the month
        lastDay = lastDay < firstDay ? lastOfMonth : lastDay;
        let days = [];
        for (let i = firstDay; i < lastDay; i += 1) {
          days.push(i);
        }
        return days;
      } else {
        return [event.startDate.getDate()];
      }
    })
    .reduce(
      (acc, dates) => {
        dates.forEach((date) => {
          // 0 indexed, so date in array is at post date-1
          acc[date - 1] = acc[date - 1] + 1;
        });
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
  if (settings.startWeekOnSunday) {
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

  // weekdays are 0 indexed starting with sunday
  let firstDay = firstOfMonth.getDay() !== 0 ? firstOfMonth.getDay() : 7;

  if (settings.startWeekOnSunday) {
    month.unshift(["S"]);
    index = 0;
    offset = 0;
    firstDay = firstDay % 7;
  } else {
    month.push(["S"]);
  }

  let dayStackCounter = 0;

  // fill with empty slots
  for (; index < firstDay; index += 1) {
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

  if (settings.showCalendarBullet) {
    // show calendar bullet in front of event name
    addWidgetTextLine(eventLine, "● ", {
      color: event.calendar.color.hex,
      font: Font.mediumSystemFont(14),
      lineLimit: settings.showCompleteTitle ? 0 : 1,
    });
  }

  // event title
  addWidgetTextLine(eventLine, event.title, {
    color,
    font: Font.mediumSystemFont(14),
    lineLimit: settings.showCompleteTitle ? 0 : 1,
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
