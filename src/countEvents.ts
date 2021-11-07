import { Settings } from "settings";
import getMonthBoundaries from "./getMonthBoundaries";

/**
 * Counts the number of events for each day in the visible calendar view, which
 * may include days from the previous month and from the next month
 *
 */
async function countEvents(
  date: Date,
  extendToPrev = 0,
  extendToNext = 0,
  settings: Settings
): Promise<EventCountInfo> {
  const { firstOfMonth } = getMonthBoundaries(date);
  const { startDate, endDate } = extendBoundaries(
    firstOfMonth,
    extendToPrev,
    extendToNext
  );
  let events = await CalendarEvent.between(startDate, endDate);

  events = trimEvents(events, settings);

  const eventCounts: EventCounts = new Map();

  events.forEach((event) => {
    if (event.isAllDay) {
      const date = event.startDate;
      do {
        updateEventCounts(date, eventCounts);
        date.setDate(date.getDate() + 1);
      } while (date < event.endDate);
    } else {
      updateEventCounts(event.startDate, eventCounts);
    }
  });

  const intensity = calculateIntensity(eventCounts);

  return { eventCounts, intensity };
}

/**
 * Remove events that we don't care about from the array, so that they won't
 * affect the intensity of the eventCircles
 */
function trimEvents(events: CalendarEvent[], settings: Settings) {
  let trimmedEvents = events;

  if (settings.calFilter.length) {
    trimmedEvents = events.filter((event) =>
      settings.calFilter.includes(event.calendar.title)
    );
  }

  if (settings.discountAllDayEvents || !settings.showAllDayEvents) {
    trimmedEvents = trimmedEvents.filter((event) => !event.isAllDay);
  }

  return trimmedEvents;
}

/**
 * Find the boundaries between which the events are counted, when showing the
 * previous and/or the next month then the boundaries are wider than just the
 * first of the month to the last of the month.
 */
function extendBoundaries(
  first: Date,
  extendToPrev: number,
  extendToNext: number
): { startDate: Date; endDate: Date } {
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

/**
 * set or update a "month/date" type of key in the map
 */
function updateEventCounts(date: Date, eventCounts: EventCounts) {
  if (eventCounts.has(`${date.getMonth()}/${date.getDate()}`)) {
    eventCounts.set(
      `${date.getMonth()}/${date.getDate()}`,
      eventCounts.get(`${date.getMonth()}/${date.getDate()}`) + 1
    );
  } else {
    eventCounts.set(`${date.getMonth()}/${date.getDate()}`, 1);
  }
}

function calculateIntensity(eventCounts: EventCounts): number {
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

type EventCounts = Map<string, number>;

interface EventCountInfo {
  // eventCounts: number[];
  eventCounts: EventCounts;
  intensity: number;
}

export default countEvents;
