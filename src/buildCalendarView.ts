import addWidgetTextLine from "./addWidgetTextLine";
import buildCalendar from "./buildCalendar";
import countEvents from "./countEvents";
import createDateImage from "./createDateImage";
import isDateFromBoundingMonth from "./isDateFromBoundingMonth";
import isWeekend from "./isWeekend";
import createUrl from "./createUrl";
import { Settings } from "./settings";

/**
 * Builds the calendar view
 *
 * @param  {WidgetStack} stack - onto which the calendar is built
 */
async function buildCalendarView(
  date: Date,
  stack: WidgetStack,
  settings: Settings
): Promise<void> {
  const rightStack = stack.addStack();
  rightStack.layoutVertically();

  const dateFormatter = new DateFormatter();
  dateFormatter.dateFormat = "MMMM";

  // if calendar is on a small widget make it a bit smaller to fit
  const spacing = config.widgetFamily === "small" ? 18 : 19;

  // Current month line
  const monthLine = rightStack.addStack();
  // since dates are centered in their squares we need to add some space
  monthLine.addSpacer(4);
  addWidgetTextLine(dateFormatter.string(date).toUpperCase(), monthLine, {
    textColor: settings.textColor,
    textSize: 14,
    font: Font.boldSystemFont(13),
  });

  const calendarStack = rightStack.addStack();
  calendarStack.spacing = 2;

  const { calendar, daysFromPrevMonth, daysFromNextMonth } = buildCalendar(
    date,
    settings
  );

  const { eventCounts, intensity } = await countEvents(
    date,
    daysFromPrevMonth,
    daysFromNextMonth,
    settings
  );

  for (let i = 0; i < calendar.length; i += 1) {
    const weekdayStack = calendarStack.addStack();
    weekdayStack.layoutVertically();

    for (let j = 0; j < calendar[i].length; j += 1) {
      const dayStack = weekdayStack.addStack();
      dayStack.size = new Size(spacing, spacing);
      dayStack.centerAlignContent();

      // splitting "month/day" or "D"
      // a day marker won't split so if we reverse and take first we get correct
      const [day, month] = calendar[i][j].split("/").reverse();
      // add callbacks to each date
      if (settings.individualDateTargets) {
        const callbackUrl = createUrl(day, month, date, settings);
        if (j > 0) dayStack.url = callbackUrl;
      }
      // if the day is today, highlight it
      if (calendar[i][j] === `${date.getMonth()}/${date.getDate()}`) {
        if (settings.markToday) {
          const highlightedDate = createDateImage(day, {
            backgroundColor: settings.todayCircleColor,
            textColor: settings.todayTextColor,
            intensity: 1,
            toFullSize: true,
          });
          dayStack.addImage(highlightedDate);
        } else {
          addWidgetTextLine(day, dayStack, {
            textColor: settings.todayTextColor,
            font: Font.boldSystemFont(10),
            align: "center",
          });
        }
        // j == 0, contains the letters, so this creates all the other dates
      } else if (j > 0 && calendar[i][j] !== " ") {
        const toFullSize = isDateFromBoundingMonth(i, j, date, calendar);

        const dateImage = createDateImage(day, {
          backgroundColor: settings.eventCircleColor,
          textColor: isWeekend(i, settings.startWeekOnSunday)
            ? settings.weekendDates
            : settings.weekdayTextColor,
          intensity: settings.showEventCircles
            ? eventCounts.get(calendar[i][j]) * intensity
            : 0,
          toFullSize,
        });
        dayStack.addImage(dateImage);
      } else {
        // first line and empty dates from other months
        addWidgetTextLine(day, dayStack, {
          textColor: isWeekend(i, settings.startWeekOnSunday)
            ? settings.weekendLetters
            : settings.textColor,
          opacity: isWeekend(i, settings.startWeekOnSunday)
            ? settings.weekendLetterOpacity
            : 1,
          font: Font.boldSystemFont(10),
          align: "center",
        });
      }
    }
  }
}

export default buildCalendarView;
