// get widget params
const params = JSON.parse(args.widgetParameter) || { bg: "transparent.jpg" };

const settings: Settings = {
  // set to true to initially give Scriptable calendar access
  // set to false to open Calendar when script is run - when tapping on the widget
  debug: true,
  // calshow is the ios calendar app
  calendarApp: "calshow",
  // a separate image can be specified per widget in widget params:
  // Long press on widget -> Edit Widget -> Parameter
  // parameter config would look like this:
  // { "bg": "2111.jpg", "view": "events" }
  imageName: params.bg,
  widgetBackgroundColor: "#000000",
  // background color for today
  todayColor: "#F24747",
  // background for all other days, only applicable if showEventCircles is true
  eventCircleColor: "#304F9E",
  todayTextColor: "#000000",
  dateTextColor: "#ffffff",

  // changes some locale specific values, such as weekday letters
  locale: "en-US",

  // weekend colors
  weekendLetters: "#ffffff",
  weekendLetterOpacity: 0.7,
  weekendDates: "#ffffff",

  // color for events
  textColor: "#ffffff",
  // opacity value for weekends and event times
  opacity: 0.7,
  // choose either a split view or show only one of them
  showEventsView: params.view ? params.view === "events" : true,
  showCalendarView: params.view ? params.view === "cal" : true,
  // show or hide all day events
  showAllDayEvents: true,
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
  // show a circle behind each date that has an event then
  showEventCircles: true,
  // shows the last days of the previous month if they fit
  showPrevMonth: true,
  // shows the last days of the previous month if they fit
  showNextMonth: true,
};

export interface Settings {
  debug: boolean;
  calendarApp: string;
  imageName: string;
  widgetBackgroundColor: string;
  todayColor: string;
  eventCircleColor: string;
  todayTextColor: string;
  dateTextColor: string;
  locale: string;
  weekendLetters: string;
  weekendLetterOpacity: number;
  weekendDates: string;
  textColor: string;
  opacity: number;
  showEventsView: boolean;
  showCalendarView: boolean;
  showAllDayEvents: boolean;
  showCalendarBullet: boolean;
  startWeekOnSunday: boolean;
  showEventsOnlyForToday: boolean;
  nextNumOfDays: number;
  showCompleteTitle: boolean;
  showEventCircles: boolean;
  showPrevMonth: boolean;
  showNextMonth: boolean;
}

export default settings;
