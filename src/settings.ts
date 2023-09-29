import { autoTheme, lightTheme, darkTheme } from "themes";

let error: string = '';

// get widget params
let params: any = {};
try {
  params = JSON.parse(args.widgetParameter) || {};
} catch(err) {
  error = `Error loading parameter setting:\n ${err}\nPlease review and fix your settings`;
}

let importedSettings: any = {};
try {
  importedSettings = importModule('calendar-settings');
} catch(err) {
  error = `Error loading calendar-settings script:\n ${err}\nPlease review and fix your settings`;
}

const defaultSettings: Settings = {
  // set to true to initially give Scriptable calendar access
  // set to false to open Calendar when script is run - when tapping on the widget
  debug: false,
  // what app to open when the script is run in a widget,
  //   "calshow" is the ios calendar app
  //   "x-fantastical3" for fantastical
  calendarApp: "calshow",
  // what calendars to show, all if empty or something like: ["Work"]
  calFilter: [],
  markToday: true,
  // show a circle behind each date that has an event then
  showEventCircles: true,
  // circle background style or a dot below text style
  eventCircleStyle: 'circle',
  // if true, all-day events don't count towards eventCircle intensity value
  discountAllDayEvents: false,
  // show smaller text for prev or next month
  smallerPrevNextMonth: false,
  // changes some locale specific values, such as weekday letters
  locale: Device.locale(),
  // specify font size for calendar text
  fontSize: 'medium',
  // what the widget shows
  widgetType: "cal",
  themeName: 'auto',
  theme: autoTheme,
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
  calFilter: string[];
  markToday: boolean;
  showEventCircles: boolean;
  eventCircleStyle: 'circle' | 'dot';
  discountAllDayEvents: boolean;
  locale: string;
  fontSize: 'small' | 'medium' | 'large';
  smallerPrevNextMonth: boolean;
  widgetType: string;
  themeName: 'auto' | 'light' | 'dark' | 'custom';
  theme: ThemeSetting;
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

export interface ThemeSetting {
  backgroundImage: string;
  widgetBackgroundColor: string;
  textColor: string;
  todayTextColor: string;
  textColorPrevNextMonth: string;
  todayCircleColor: string;
  weekdayTextColor: string;
  eventCircleColor: string;
  weekendLetterColor: string;
  weekendLetterOpacity: number;
  weekendDateColor: string;
  eventDateTimeOpacity: number;
  eventBackgroundOpacity: number;
}

// Merge settings. Latest item takes priority
const settings: Settings = Object.assign(
  defaultSettings,
  importedSettings,
  params
);

if (params.bg) settings.theme.backgroundImage = params.bg;

let theme;
switch (settings.themeName) {
  case 'dark': theme = darkTheme; break;
  case 'light': theme = lightTheme; break;
  default: theme = autoTheme; break;
}
settings.theme = Object.assign(
  theme,
  importedSettings.theme,
  params.theme
);

export default settings;
export { error }