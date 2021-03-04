import { Settings } from "./settings";

async function getEvents(
  date: Date,
  settings: Settings
): Promise<CalendarEvent[]> {
  let events: CalendarEvent[] = [];
  if (settings.showEventsOnlyForToday) {
    events = await CalendarEvent.today([]);
  } else {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() + settings.nextNumOfDays);
    events = await CalendarEvent.between(date, dateLimit);
  }

  const futureEvents: CalendarEvent[] = [];
  // if we show events for the whole week, then we need to filter allDay events
  // to not show past allDay events
  // if allDayEvent's start date is later than a day ago from now then show it
  // TODO clear up this logic
  for (const event of events) {
    if (
      (settings.showAllDayEvents &&
        event.isAllDay &&
        event.startDate.getTime() >
          new Date(new Date().setDate(new Date().getDate() - 1)).getTime()) ||
      (event.endDate.getTime() > date.getTime() &&
        !event.title.startsWith("Canceled:"))
    ) {
      futureEvents.push(event);
    }
  }
  return futureEvents;
}

export default getEvents;
