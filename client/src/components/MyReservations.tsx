import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar, Clock, MapPin, Trash2, CalendarPlus, Download } from "lucide-react";
import type { Reservation } from "../App";
import { createGoogleCalendarEvent, downloadICSFile } from "../utils/googleCalendar";

interface MyReservationsProps {
  reservations: Reservation[];
  onCancel: (id: string) => void;
}

export function MyReservations({ reservations, onCancel }: MyReservationsProps) {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "desk": return "Desk";
      case "lab": return "Computer Lab";
      case "meeting-room": return "Meeting Room";
      default: return type;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "desk": return "default";
      case "lab": return "secondary";
      case "meeting-room": return "outline";
      default: return "default";
    }
  };

  const sortedReservations = [...reservations].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  const upcomingReservations = sortedReservations.filter(r => {
    const reservationDate = new Date(r.date + 'T' + r.endTime);
    return reservationDate >= new Date();
  });

  const pastReservations = sortedReservations.filter(r => {
    const reservationDate = new Date(r.date + 'T' + r.endTime);
    return reservationDate < new Date();
  });

  const handleCancel = (id: string, resourceName: string) => {
    if (confirm(`Are you sure you want to cancel the reservation for ${resourceName}?`)) {
      onCancel(id);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Reservations</CardTitle>
          <CardDescription>Your active and upcoming bookings</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingReservations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming reservations</p>
          ) : (
            <div className="space-y-3">
              {upcomingReservations.map((reservation) => (
                <div key={reservation.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-gray-900">{reservation.resourceName}</p>
                        <Badge variant={getTypeBadgeVariant(reservation.type)}>
                          {getTypeLabel(reservation.type)}
                        </Badge>
                      </div>
                      <p className="text-gray-600">{reservation.userName} • {reservation.userType}</p>
                      {reservation.purpose && (
                        <p className="text-gray-500">{reservation.purpose}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(reservation.id, reservation.resourceName)}
                    >
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      <span>{new Date(reservation.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="size-4" />
                      <span>{reservation.startTime} - {reservation.endTime}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(createGoogleCalendarEvent(reservation), '_blank')}
                    >
                      <CalendarPlus className="size-4 mr-2" />
                      Add to Google Calendar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadICSFile(reservation)}
                    >
                      <Download className="size-4 mr-2" />
                      Download .ics
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {pastReservations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Reservations</CardTitle>
            <CardDescription>Your reservation history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastReservations.map((reservation) => (
                <div key={reservation.id} className="p-4 border rounded-lg space-y-3 opacity-60">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900">{reservation.resourceName}</p>
                      <Badge variant={getTypeBadgeVariant(reservation.type)}>
                        {getTypeLabel(reservation.type)}
                      </Badge>
                    </div>
                    <p className="text-gray-600">{reservation.userName} • {reservation.userType}</p>
                    {reservation.purpose && (
                      <p className="text-gray-500">{reservation.purpose}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      <span>{new Date(reservation.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="size-4" />
                      <span>{reservation.startTime} - {reservation.endTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
