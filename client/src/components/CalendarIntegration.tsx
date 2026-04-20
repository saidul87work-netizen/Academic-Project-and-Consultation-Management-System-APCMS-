import { useState } from "react";
import {
  CalendarDays,
  RefreshCw,
  Link,
  Link2Off,
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: "reservation" | "evaluation" | "meeting" | "deadline";
  synced: boolean;
}

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Lab 301 Reservation",
    date: "2026-04-21",
    startTime: "09:00",
    endTime: "11:00",
    location: "Lab 301, Block C",
    type: "reservation",
    synced: true,
  },
  {
    id: "2",
    title: "Project Evaluation — ML Research",
    date: "2026-04-22",
    startTime: "14:00",
    endTime: "15:30",
    location: "Meeting Room B-05",
    type: "evaluation",
    synced: true,
  },
  {
    id: "3",
    title: "Supervisor Meeting",
    date: "2026-04-23",
    startTime: "10:00",
    endTime: "11:00",
    location: "Dr. Rahman's Office",
    type: "meeting",
    synced: false,
  },
  {
    id: "4",
    title: "Final Report Deadline",
    date: "2026-04-30",
    startTime: "23:59",
    endTime: "23:59",
    location: "Online Submission",
    type: "deadline",
    synced: false,
  },
  {
    id: "5",
    title: "Desk A-12 Booking",
    date: "2026-05-02",
    startTime: "13:00",
    endTime: "17:00",
    location: "Study Area, Block A",
    type: "reservation",
    synced: true,
  },
];

const EVENT_COLORS: Record<CalendarEvent["type"], string> = {
  reservation: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  evaluation: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  meeting: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  deadline: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

const EVENT_DOT: Record<CalendarEvent["type"], string> = {
  reservation: "bg-blue-500",
  evaluation: "bg-purple-500",
  meeting: "bg-green-500",
  deadline: "bg-red-500",
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarIntegration() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [events] = useState<CalendarEvent[]>(MOCK_EVENTS);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  const eventsForDate = (day: number) => {
    const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
    return events.filter((e) => e.date === dateStr);
  };

  const selectedEvents = selectedDate
    ? events.filter((e) => e.date === selectedDate)
    : events
        .filter((e) => e.date >= today.toISOString().slice(0, 10))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);

  const handleSync = async () => {
    setSyncing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSynced(true);
    setSyncing(false);
    toast.success("Calendar synced with Google Calendar!");
  };

  const handleDisconnect = () => {
    setSynced(false);
    toast.info("Disconnected from Google Calendar");
  };

  const handleExportICS = () => {
    const icsLines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//APCMS//EN",
      ...events.flatMap((e) => [
        "BEGIN:VEVENT",
        `SUMMARY:${e.title}`,
        `DTSTART:${e.date.replace(/-/g, "")}T${e.startTime.replace(":", "")}00`,
        `DTEND:${e.date.replace(/-/g, "")}T${e.endTime.replace(":", "")}00`,
        `LOCATION:${e.location}`,
        "END:VEVENT",
      ]),
      "END:VCALENDAR",
    ];
    const blob = new Blob([icsLines.join("\r\n")], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "apcms-calendar.ics";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Calendar exported as .ics file");
  };

  return (
    <div className="space-y-6">
      {/* Sync status banner */}
      <div
        className={`rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          synced
            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
            : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
        }`}
      >
        <div className="flex items-center gap-3">
          {synced ? (
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0" />
          ) : (
            <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
          )}
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {synced ? "Google Calendar Connected" : "Connect Google Calendar"}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              {synced
                ? "Your reservations and evaluations are synced. Last sync: just now."
                : "Sync your APCMS schedule with Google Calendar for reminders and cross-device access."}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {synced ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSync}
                disabled={syncing}
                className="text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${syncing ? "animate-spin" : ""}`} />
                Sync Now
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDisconnect}
                className="text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10 border-red-200 dark:border-red-800"
              >
                <Link2Off className="w-3.5 h-3.5 mr-1.5" />
                Disconnect
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={handleSync} disabled={syncing} className="text-xs">
              <Link className={`w-3.5 h-3.5 mr-1.5 ${syncing ? "animate-pulse" : ""}`} />
              {syncing ? "Connecting..." : "Connect Google Calendar"}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleExportICS} className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export .ics
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month grid calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                {MONTH_NAMES[viewMonth]} {viewYear}
              </CardTitle>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); }}
                  className="px-2.5 py-1 text-xs font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day labels */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_NAMES.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1.5">
                  {d}
                </div>
              ))}
            </div>
            {/* Date cells */}
            <div className="grid grid-cols-7 gap-px">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
                const dayEvents = eventsForDate(day);
                const isToday =
                  day === today.getDate() &&
                  viewMonth === today.getMonth() &&
                  viewYear === today.getFullYear();
                const isSelected = selectedDate === dateStr;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`relative flex flex-col items-center py-1.5 rounded-lg transition-colors min-h-[40px] ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : isToday
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    <span className="text-xs">{day}</span>
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayEvents.slice(0, 3).map((e) => (
                          <span
                            key={e.id}
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? "bg-white/80" : EVENT_DOT[e.type]
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
              {(Object.keys(EVENT_DOT) as CalendarEvent["type"][]).map((type) => (
                <div key={type} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${EVENT_DOT[type]}`} />
                  <span className="text-xs capitalize text-gray-600 dark:text-gray-400">{type}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming events panel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {selectedDate
                ? `Events on ${selectedDate}`
                : "Upcoming Events"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedEvents.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <CalendarDays className="mx-auto mb-2 w-8 h-8 opacity-40" />
                <p className="text-sm">No events {selectedDate ? "on this date" : "upcoming"}</p>
              </div>
            ) : (
              selectedEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge className={`text-[10px] px-1.5 py-0 h-4 ${EVENT_COLORS[event.type]}`}>
                        {event.type}
                      </Badge>
                      {event.synced && (
                        <span title="Synced to Google Calendar"><CheckCircle className="w-3 h-3 text-green-500 shrink-0" /></span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{event.date} · {event.startTime} – {event.endTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="w-full text-xs text-blue-600 dark:text-blue-400 hover:underline pt-1"
              >
                Show all upcoming events
              </button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sync stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: events.length, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Synced Events", value: events.filter(e => e.synced).length, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
          { label: "Reservations", value: events.filter(e => e.type === "reservation").length, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "Evaluations", value: events.filter(e => e.type === "evaluation").length, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg mb-2 ${stat.bg}`}>
                <CalendarDays className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
