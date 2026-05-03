import type { Reservation } from "../App";

export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDateTime: string;
  endDateTime: string;
}

export function createGoogleCalendarEvent(reservation: Reservation): string {
  const { resourceName, date, startTime, endTime, userName, userType, purpose, type } = reservation;

  // Create date-time strings in RFC3339 format for Google Calendar
  const startDateTime = new Date(`${date}T${startTime}:00`).toISOString();
  const endDateTime = new Date(`${date}T${endTime}:00`).toISOString();

  // Format for Google Calendar (YYYYMMDDTHHMMSSZ format)
  const startFormatted = startDateTime.replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endFormatted = endDateTime.replace(/[-:]/g, '').split('.')[0] + 'Z';

  // Create event title based on type
  let title = '';
  if (type === 'desk') {
    title = `Desk Reservation - ${resourceName}`;
  } else if (type === 'lab') {
    title = `Lab Booking - ${resourceName}`;
  } else if (type === 'meeting-room') {
    title = `Meeting Room - ${resourceName}`;
  }

  // Create description
  let description = `Reserved by: ${userName} (${userType})`;
  if (purpose) {
    description += `\nPurpose: ${purpose}`;
  }
  description += `\nBooking Type: ${type}`;

  // Create location
  const location = resourceName;

  // Generate Google Calendar URL
  const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
  const params = [
    `text=${encodeURIComponent(title)}`,
    `dates=${startFormatted}/${endFormatted}`,
    `details=${encodeURIComponent(description)}`,
    `location=${encodeURIComponent(location)}`
  ];

  return `${baseUrl}&${params.join('&')}`;
}

export function downloadICSFile(reservation: Reservation): void {
  const { resourceName, date, startTime, endTime, userName, userType, purpose, type } = reservation;

  // Create date-time strings in ICS format (YYYYMMDDTHHMMSSZ)
  const startDateTime = new Date(`${date}T${startTime}:00`).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endDateTime = new Date(`${date}T${endTime}:00`).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  // Create event title based on type
  let title = '';
  if (type === 'desk') {
    title = `Desk Reservation - ${resourceName}`;
  } else if (type === 'lab') {
    title = `Lab Booking - ${resourceName}`;
  } else if (type === 'meeting-room') {
    title = `Meeting Room - ${resourceName}`;
  }

  // Create description with proper ICS line folding
  let description = `Reserved by: ${userName} (${userType})`;
  if (purpose) {
    description += `\\nPurpose: ${purpose}`;
  }
  description += `\\nBooking Type: ${type}`;

  // Create ICS file content with proper formatting
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Campus Reservation System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${startDateTime}`,
    `DTEND:${endDateTime}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${resourceName}`,
    `UID:${reservation.id}@campus-reservation.com`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Your reservation starts in 15 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  // Create and download the file
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `reservation-${reservation.id}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
