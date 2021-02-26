import addWidgetTextLine from "./addWidgetTextLine";
import buildMonth from "./buildMonth";
import countEvents from "./countEvents";
import createDateImage from "./createDateImage";
import isWeekend from "./isWeekend";
import settings from "./settings";

/**
 * Builds the calendar view
 *
 * @param  {WidgetStack} stack - onto which the calendar is built
 */
async function buildCalendarView(date: Date, stack: WidgetStack) {
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

  const { month, daysFromPrevMonth, daysFromNextMonth } = buildMonth(
    date,
    settings
  );

  const { eventCounts, intensity } = await countEvents(
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

      // if the day is today, highlight it
      if (month[i][j] === date.getDate().toString()) {
        const highlightedDate = createDateImage(
          month[i][j],
          settings.todayColor,
          settings.todayTextColor,
          1
        );
        dayStack.addImage(highlightedDate);
      } else if (j > 0 && month[i][j] !== " ") {
        // every other date
        const dateImage = createDateImage(
          month[i][j],
          settings.eventCircleColor,
          isWeekend(i) ? settings.weekendDates : settings.dateTextColor,
          settings.showEventCircles
            ? // TODO position to index function here
              eventCounts[parseInt(month[i][j]) - 1] * intensity
            : 0
        );
        dayStack.addImage(dateImage);
      } else {
        // MTWTFSS line and empty dates from other months
        addWidgetTextLine(`${month[i][j]}`, dayStack, {
          textColor: isWeekend(i)
            ? settings.weekendLetters
            : settings.textColor,
          opacity: isWeekend(i) ? settings.weekendLetterOpacity : 1,
          font: Font.boldSystemFont(10),
          align: "center",
        });
      }
    }
  }
}

export default buildCalendarView;
