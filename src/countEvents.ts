/**
 *
 */
async function countEvents(): Promise<EventCountInfo> {
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
          acc[date - 1] = acc[date - 1] + 1;
        });
        return acc;
      },
      Array.from(Array(31), () => 0)
    );
  const max = Math.max(...eventCounts);
  const min = Math.min(...eventCounts);
  let intensity = 1 / (max - min + 1);
  intensity = intensity > 0.2 ? 0.2 : intensity;
  return { eventCounts, intensity };
}

interface EventCountInfo {
  eventCounts: Array<number>;
  intensity: number;
}

export default countEvents;
