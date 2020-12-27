# Scriptable Calendar Widget

<p align="center" >
    <img width="500" alt="scriptable calendar" src ="./assets/widget.png">
</p>

- [Scriptable Calendar Widget](#scriptable-calendar-widget)
  - [Instructions](#instructions)
  - [Small widgets](#small-widgets)

## Instructions

- Copy the script in `calendar.js` to a new script in Scriptable app.
- Run the script first which should prompt Scriptable to ask for calendar access.
  - if it didn't and you haven't given Scriptable calendar access before, try changing the `debug` variable to `true` and trying again.
  - to have the widget open the iOS calendar app, switch `debug` back to `false` afterwards.
- Add a medium sized Scriptable widget to your homescreen.
- Long press the widget and choose "Edit Widget".
- Set the `Script` to be the script you just created and `When Interacting` to `Run Script` which will then launch Calendar app when you tap on the widget.
- Return to your home screen which should now hopefully show the Scriptable calendar widget.

---

- Tapping on the widget launches a calendar app (as long as `const debug = false`), by default it launches the iOS Calendar app, however it can be changed to anything as long as the app supports callback URLs.
  - `const callback = new CallbackURL("calshow:" + timestamp);` - opens iOS Calendar. Changing the `calshow` to something else would open other apps. E.g. for Google Calendar it is `googlecalendar`, for Fantastical it is `x-fantastical3`.
- The beginning of the script shows the hex colors for various parts which can be modified to your liking:
  - widget's background color
  - current day's background and foreground color
  - background and foreground colors for other days
  - foregruond colors for weekends
  - text color
- To get an image that can then be used to have a "transparent" widget background use [this](https://gist.github.com/mzeryck/3a97ccd1e059b3afa3c6666d27a496c9#gistcomment-3468585) script and save it to the _Scriptable_ folder on iCloud. Then set either the widget parameter (long press on the widget -> edit widget -> parameter) to `{ "bg": "my-image.jpg"}` where `my-image` is the name of your transparent backgorund **OR** change the line which has `{ bg: "1121.jpg" }` to include your image name.
- `showAllDayEvents` - would either show or hide all day events.
- `showCalendarBullet` - would show a `●` in front of the event name which matches the calendar color from which the event originates.
- `startWeekOnSunday` - would start the week either on a Sunday or a Monday.
- `showEventsOnlyForToday` - would either limit the events to today or a specified number of future days with `nextNumOfDays`
- `nextNumOfDays` - this allows specifying how far into the future to look for events. There is probably a limit by iOS on how far into the future it can look.
- `showCompleteTitle` - would truncate long event titles so that they can fit onto a single line to fit more events into the view.
- `showEventCircles` - adds colored background for all days that have an event. The color intensity is based on how many events are that day.

## Small widgets

<p align="center" >
    <img width="350" alt="scriptable calendar" src ="./assets/small-widgets.png">
</p>

The script also supports small widgets or a medium widget with just one part. In this case the the widget parameter (long press on the widget -> edit widget -> parameter) should be set to something like:

- `{ "bg": "top-left.jpg", "view": "events" }`
- `{ "bg": "top-right.jpg", "view": "cal" }`

Where `"events"` specifies the events view and `"cal"` the calendar view. (Setting the background is optional).
