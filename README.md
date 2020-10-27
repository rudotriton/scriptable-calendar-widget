# Scriptable Calendar Widget

<p align="center" >
    <img width="500" alt="scriptable calendar" src ="https://user-images.githubusercontent.com/14181026/94677573-ccd33880-0325-11eb-97d9-6ecae520023c.jpg">
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

- the beginning of the script shows the hex colors for various parts which can be modified to your liking:
  - background color
  - current day color
  - text color
- To get an image that can then be used to have a "transparent" widget background use [this](https://gist.github.com/mzeryck/3a97ccd1e059b3afa3c6666d27a496c9#gistcomment-3468585) script and save it to the _Scriptable_ folder on iCloud. Then set either the widget parameter (long press on the widget -> edit widget -> parameter) to `{ "bg": "my-image.jpg"}` where `my-image` is the name of your transparent backgorund **OR** change the line which has `{ bg: "1121.jpg" }` to include your image name.
- `showAllDayEvents` - would either show or hide all day events.
- `showCalendarBullet` - would show a `●` in front of the event name which matches the calendar color from which the event originates.
- `startWeekOnSunday` - would start the week either on a Sunday or a Monday.
- `showEventsForWholeWeek` - would either show all future events for today or for the whole week.
- `showCompleteTitle` - would truncate long event titles so that they can fit onto a single line to fit more events into the view.

## Small widgets

<p align="center" >
    <img width="350" alt="scriptable calendar" src ="https://user-images.githubusercontent.com/14181026/95193609-bcff9c80-07dc-11eb-8583-6c2bf8cd66c4.jpg">
</p>

The script also supports small widgets or a medium widget with just one part. In this case the the widget parameter (long press on the widget -> edit widget -> parameter) should be set to something like:

- `{ "bg": "top-left.jpg", "view": "events" }`
- `{ "bg": "top-right.jpg", "view": "cal" }`

Where `"events"` specifies the events view and `"cal"` the calendar view. (Setting the background is optional).