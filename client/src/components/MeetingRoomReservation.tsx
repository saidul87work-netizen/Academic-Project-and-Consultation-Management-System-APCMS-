import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Calendar, Users, Projector, Wifi, CalendarPlus, Download } from "lucide-react";
import type { Reservation } from "../App";
import { toast } from "sonner";
import { createGoogleCalendarEvent, downloadICSFile } from "../utils/googleCalendar";

interface MeetingRoomReservationProps {
  reservations: Reservation[];
  onReserve: (reservation: Omit<Reservation, "id">) => void;
}

const MEETING_ROOMS = [
  { 
    id: "mr1", 
    name: "Meeting Room A", 
    capacity: 8, 
    floor: "1st Floor",
    amenities: ["Projector", "Whiteboard", "Video Conference"]
  },
  { 
    id: "mr2", 
    name: "Meeting Room B", 
    capacity: 12, 
    floor: "2nd Floor",
    amenities: ["Projector", "Smart TV", "Whiteboard"]
  },
  { 
    id: "mr3", 
    name: "Conference Room", 
    capacity: 20, 
    floor: "3rd Floor",
    amenities: ["Projector", "Video Conference", "Audio System", "Whiteboard"]
  },
  { 
    id: "mr4", 
    name: "Small Meeting Room", 
    capacity: 4, 
    floor: "1st Floor",
    amenities: ["Whiteboard", "TV"]
  },
];

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
];

export function MeetingRoomReservation({ reservations, onReserve }: MeetingRoomReservationProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [userName, setUserName] = useState("");
  const [userType, setUserType] = useState<"faculty" | "student">("faculty");
  const [purpose, setPurpose] = useState("");
  const [lastReservation, setLastReservation] = useState<Reservation | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isRoomAvailable = (roomName: string, date: string, start: string, end: string) => {
    return !reservations.some(r => {
      if (r.resourceName !== roomName || r.date !== date) return false;
      
      const rStart = parseInt(r.startTime.replace(":", ""));
      const rEnd = parseInt(r.endTime.replace(":", ""));
      const sStart = parseInt(start.replace(":", ""));
      const sEnd = parseInt(end.replace(":", ""));
      
      return (sStart < rEnd && sEnd > rStart);
    });
  };

  const handleReserve = () => {
    if (!selectedRoom || !startTime || !endTime || !userName || !purpose) {
      toast.error("Please fill in all fields");
      return;
    }

    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }

    if (!isRoomAvailable(selectedRoom, selectedDate, startTime, endTime)) {
      toast.error("This meeting room is already booked for the selected time slot");
      return;
    }

    const newReservation = {
      type: "meeting-room" as const,
      resourceName: selectedRoom,
      date: selectedDate,
      startTime,
      endTime,
      userName,
      userType,
      purpose
    };

    onReserve(newReservation);

    // Create full reservation object for Google Calendar
    const fullReservation: Reservation = {
      ...newReservation,
      id: `temp-${Date.now()}`, // Temporary ID for Google Calendar
    };

    setLastReservation(fullReservation);
    setShowSuccessModal(true);

    // Reset form
    setSelectedRoom("");
    setStartTime("");
    setEndTime("");
    setPurpose("");
    toast.success("Meeting room reserved successfully!");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Reserve a Meeting Room</CardTitle>
          <CardDescription>Book a room for meetings, consultations, or group sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-user-name">Your Name</Label>
            <Input
              id="room-user-name"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="room-user-type">User Type</Label>
            <Select value={userType} onValueChange={(v) => setUserType(v as "faculty" | "student")}>
              <SelectTrigger id="room-user-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room-purpose">Purpose</Label>
            <Input
              id="room-purpose"
              placeholder="e.g., Team meeting, Consultation"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="room-date">Date</Label>
            <Input
              id="room-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="room">Select Meeting Room</Label>
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger id="room">
                <SelectValue placeholder="Choose a room" />
              </SelectTrigger>
              <SelectContent>
                {MEETING_ROOMS.map((room) => (
                  <SelectItem key={room.id} value={room.name}>
                    {room.name} - {room.capacity} people
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room-start-time">Start Time</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger id="room-start-time">
                  <SelectValue placeholder="Start" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="room-end-time">End Time</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger id="room-end-time">
                  <SelectValue placeholder="End" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleReserve} className="w-full">
            <Calendar className="size-4 mr-2" />
            Reserve Room
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Meeting Rooms</CardTitle>
          <CardDescription>
            {selectedDate && startTime && endTime 
              ? `Available for ${selectedDate} from ${startTime} to ${endTime}`
              : "Select date and time to check availability"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MEETING_ROOMS.map((room) => {
              const isAvailable = !selectedDate || !startTime || !endTime || 
                isRoomAvailable(room.name, selectedDate, startTime, endTime);
              
              return (
                <div key={room.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-900">{room.name}</p>
                      <p className="text-gray-500">{room.floor}</p>
                    </div>
                    <Badge variant={isAvailable ? "default" : "secondary"}>
                      {isAvailable ? "Available" : "Booked"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="size-4" />
                    <span>Up to {room.capacity} people</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map(amenity => (
                      <Badge key={amenity} variant="outline">
                        {amenity === "Projector" && <Projector className="size-3 mr-1" />}
                        {amenity === "Video Conference" && <Wifi className="size-3 mr-1" />}
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Success Modal with Google Calendar Options */}
      {showSuccessModal && lastReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reservation Confirmed!</h3>
                <p className="text-gray-600 mb-4">
                  Your meeting room has been reserved successfully.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Room:</strong> {lastReservation.resourceName}</p>
                    <p><strong>Date:</strong> {new Date(lastReservation.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {lastReservation.startTime} - {lastReservation.endTime}</p>
                    {lastReservation.purpose && (
                      <p><strong>Purpose:</strong> {lastReservation.purpose}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Add this reservation to your calendar:</p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => window.open(createGoogleCalendarEvent(lastReservation), '_blank')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <CalendarPlus className="size-4 mr-2" />
                      Google Calendar
                    </Button>
                    <Button
                      onClick={() => downloadICSFile(lastReservation)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="size-4 mr-2" />
                      Download .ics
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full mt-4"
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
