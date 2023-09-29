import { ThemeSetting } from "settings";

const darkTheme: ThemeSetting = {
  backgroundImage: "transparent.jpg",
  widgetBackgroundColor: "#000000",
  // background color for today
  todayTextColor: "#000000",
  todayCircleColor: "#FFB800",
  // color of all the other dates
  weekdayTextColor: "#ffffff",
  eventCircleColor: "#1E5C7B",
  // weekend colors
  weekendLetterColor: "#FFB800",
  weekendLetterOpacity: 1,
  weekendDateColor: "#FFB800",
  // text color for prev or next month
  textColorPrevNextMonth: "#9e9e9e",
  // color for events
  textColor: "#ffffff",
  // opacity value for event times
  eventDateTimeOpacity: 0.7,
  // opacity value for event item background in event view
  eventBackgroundOpacity: 0.3,
}

const lightTheme: ThemeSetting = {
  backgroundImage: "transparent.jpg",
  widgetBackgroundColor: "#FFFFFF",
  // background color for today
  todayTextColor: "#000000",
  todayCircleColor: "#FFB800",
  // color of all the other dates
  weekdayTextColor: "#000000",
  eventCircleColor: "#a5beca",
  // weekend colors
  weekendLetterColor: "#ff6600",
  weekendLetterOpacity: 1,
  weekendDateColor: "#ff6600",
  // text color for prev or next month
  textColorPrevNextMonth: "#403e3e",
  // color for events
  textColor: "#000000",
  // opacity value for event times
  eventDateTimeOpacity: 0.7,
  // opacity value for event item background in event view
  eventBackgroundOpacity: 0.3,
}

const autoTheme = Device.isUsingDarkAppearance()
  ? darkTheme
  : lightTheme;

export { darkTheme, lightTheme, autoTheme }