import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import enUS from 'date-fns/locale/en-US';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const FacultySchedule = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/consultations/schedule');
      const formattedEvents = data.map((ses: any) => ({
        id: ses._id,
        title: `Consultation w/ ${ses.requester?.name || 'Unknown'} - ${ses.reason}`,
        start: new Date(ses.confirmedStart),
        end: new Date(ses.preferredEnd || new Date(ses.confirmedStart).getTime() + 60*60*1000), // Default 1 hour if end missing
        student: ses.requester?.name,
        sts: ses.assignedSTs?.map((st:any)=>st.name).join(', '),
      }));
      setEvents(formattedEvents);
    } catch {
      alert('Error fetching schedule');
    }
  };

  return (
    <div className="bg-white p-6 shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Interactive Schedule</h2>
      <div style={{ height: '70vh' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="week"
          onSelectEvent={(event) => alert(event.title + (event.sts ? ` (Assisted by: ${event.sts})` : ''))}
          style={{ height: '100%', width: '100%' }}
        />
      </div>
    </div>
  );
};
export default FacultySchedule;
