import { Settings } from "settings";

/**
 * Create a callback url to open a calendar app on that day
 *
 * @name createUrl
 * @function
 * @param {string} day
 * @param {Date} date
 * @param {Settings} settings
 */
function createUrl(
  day: string,
  month: string,
  date: Date,
  settings: Settings
): string {
  let url: string;
  let year: number;

  const currentMonth = date.getMonth();
  if (currentMonth === 11 && Number(month) === 1) {
    year = date.getFullYear() + 1;
  } else if (currentMonth === 0 && Number(month) === 11) {
    year = date.getFullYear() - 1;
  } else {
    year = date.getFullYear();
  }

  if (settings.calendarApp === "calshow") {
    const appleDate = new Date("2001/01/01");
    const timestamp =
      (new Date(`${year}/${Number(month) + 1}/${day}`).getTime() -
        appleDate.getTime()) /
      1000;
    url = `calshow:${timestamp}`;
  } else if (settings.calendarApp === "x-fantastical3") {
    url = `${settings.calendarApp}://show/calendar/${year}-${
      Number(month) + 1
    }-${day}`;
  } else {
    url = "";
  }
  return url;
}

export default createUrl;
