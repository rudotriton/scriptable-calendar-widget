function getEventIcon(event: CalendarEvent): string {
  if (event.attendees === null) {
    return "● ";
  }
  const status = event.attendees.filter((attendee) => attendee.isCurrentUser)[0]
    .status;
  switch (status) {
    case "accepted":
      return "✓ ";
    case "tentative":
      return "~ ";
    case "declined":
      return "✘ ";
    default:
      return "● ";
  }
}

export default getEventIcon;
