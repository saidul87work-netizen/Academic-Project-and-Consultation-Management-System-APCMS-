import { google } from 'googleapis';

const calendar = google.calendar('v3');

const auth = process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY
  ? new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/calendar'],
    })
  : null;

export const syncToGoogleCalendar = async (booking) => {
  try {
    const event = {
      summary: `${booking.type} Reservation`,
      start: { dateTime: booking.startTime.toISOString() },
      end: { dateTime: booking.endTime.toISOString() },
    };

    const response = await calendar.events.insert({
      auth,
      calendarId: 'primary', // or your calendar ID
      resource: event,
    });

    return response.data.id;
  } catch (error) {
    console.error('Google Calendar sync failed:', error);
    throw error;
  }
};
