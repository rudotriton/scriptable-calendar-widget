// get widget params
const params = JSON.parse(args.widgetParameter) || {};

let importedSettings: any = {};
try {
  importedSettings = importModule('calendar-settings');
} catch {}

const defaultSettings: Settings = {
  // set to true to initially give Scriptable calendar access
  // set to false to open Calendar when script is run - when tapping on the widget
  debug: false,
  // what app to open when the script is run in a widget,
  //   "calshow" is the ios calendar app
  //   "x-fantastical3" for fantastical
  calendarApp: "calshow",
  // a separate image can be specified per widget in widget params:
  // Long press on widget -> Edit Widget -> Parameter
  // parameter config would look like this:
  // { "bg": "2111.jpg", "view": "events" }
  backgroundImage: "transparent.jpg",
  // what calendars to show, all if empty or something like: ["Work"]
  calFilter: [],
  widgetBackgroundColor: "#000000",
  todayTextColor: "#000000",
  markToday: true,
  // background color for today
  todayCircleColor: "#FFB800",
  // background for all other days, only applicable if showEventCircles is true
  // show a circle behind each date that has an event then
  showEventCircles: true,
  // if true, all-day events don't count towards eventCircle intensity value
  discountAllDayEvents: false,
  eventCircleColor: "#1E5C7B",
  // color of all the other dates
  weekdayTextColor: "#ffffff",

  // weekend colors
  weekendLetters: "#FFB800",
  weekendLetterOpacity: 1,
  weekendDates: "#FFB800",

  // show smaller text for prev or next month
  smallerPrevNextMonth: false,
  // text color for prev or next month
  textColorPrevNextMonth: "#9e9e9e",

  // changes some locale specific values, such as weekday letters
  locale: "en-US",

  // color for events
  textColor: "#ffffff",
  // opacity value for event times
  eventDateTimeOpacity: 0.7,
  // what the widget shows
  widgetType: "cal",
  // show or hide all day events
  showAllDayEvents: true,
  // show an icon if the event is all day
  showIconForAllDayEvents: true,
  // show calendar colored bullet for each event
  showCalendarBullet: true,
  // week starts on a Sunday
  startWeekOnSunday: false,
  // show events for the whole week or limit just to the day
  showEventsOnlyForToday: false,
  // shows events for that many days if showEventsOnlyForToday is false
  nextNumOfDays: 7,
  // show full title or truncate to a single line
  showCompleteTitle: false,
  // show event location if available
  showEventLocation: true,
  // show event duration
  showEventTime: true,
  // Use 24 hour clock
  clock24Hour: false,
  // shows the last days of the previous month if they fit
  showPrevMonth: true,
  // shows the last days of the previous month if they fit
  showNextMonth: true,
  // tapping on a date opens that specific one
  individualDateTargets: false,
  // events-calendar OR a flipped calendar-events type of view for medium widget
  flipped: false,
};

export interface Settings {
  debug: boolean;
  calendarApp: string;
  backgroundImage: string;
  calFilter: string[];
  widgetBackgroundColor: string;
  todayTextColor: string;
  markToday: boolean;
  todayCircleColor: string;
  weekdayTextColor: string;
  showEventCircles: boolean;
  discountAllDayEvents: boolean;
  eventCircleColor: string;
  locale: string;
  weekendLetters: string;
  weekendLetterOpacity: number;
  weekendDates: string;
  smallerPrevNextMonth: boolean;
  textColorPrevNextMonth: string;
  textColor: string;
  eventDateTimeOpacity: number;
  widgetType: string;
  showAllDayEvents: boolean;
  showIconForAllDayEvents: boolean;
  showCalendarBullet: boolean;
  startWeekOnSunday: boolean;
  showEventsOnlyForToday: boolean;
  nextNumOfDays: number;
  showCompleteTitle: boolean;
  showEventLocation: boolean;
  showEventTime: boolean;
  clock24Hour: boolean;
  showPrevMonth: boolean;
  showNextMonth: boolean;
  individualDateTargets: boolean;
  flipped: boolean;
}

// Merge settings. Latest item takes priority
const settings = {
  ...defaultSettings,
  ...importedSettings,
  ...params
}

export default settings;
