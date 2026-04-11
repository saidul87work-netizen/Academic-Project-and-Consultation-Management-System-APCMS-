import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Calendar, CalendarPlus, Download } from "lucide-react";
import type { Reservation } from "../App";
import { toast } from "sonner";
import { createGoogleCalendarEvent, downloadICSFile } from "../utils/googleCalendar";

interface DeskReservationProps {
  reservations: Reservation[];
  onReserve: (reservation: Omit<Reservation, "id">) => void;
}

const DESKS = [
  { id: "A-12", name: "Desk A-12", floor: "1st Floor", zone: "Quiet Zone" },
  { id: "A-13", name: "Desk A-13", floor: "1st Floor", zone: "Quiet Zone" },
  { id: "B-01", name: "Desk B-01", floor: "2nd Floor", zone: "Collaboration Zone" },
  { id: "B-02", name: "Desk B-02", floor: "2nd Floor", zone: "Collaboration Zone" },
  { id: "C-05", name: "Desk C-05", floor: "3rd Floor", zone: "Window Seats" },
  { id: "C-06", name: "Desk C-06", floor: "3rd Floor", zone: "Window Seats" },
];

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
];

export function DeskReservation({ reservations, onReserve }: DeskReservationProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDesk, setSelectedDesk] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [userName, setUserName] = useState("");
  const [userType, setUserType] = useState<"faculty" | "student">("student");
  const [lastReservation, setLastReservation] = useState<Reservation | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isTimeSlotAvailable = (deskId: string, date: string, start: string, end: string) => {
    return !reservations.some(r => {
      if (r.resourceName !== deskId || r.date !== date) return false;
      
      const rStart = parseInt(r.startTime.replace(":", ""));
      const rEnd = parseInt(r.endTime.replace(":", ""));
      const sStart = parseInt(start.replace(":", ""));
      const sEnd = parseInt(end.replace(":", ""));
      
      return (sStart < rEnd && sEnd > rStart);
    });
  };

  const handleReserve = () => {
    if (!selectedDesk || !startTime || !endTime || !userName) {
      alert("Please fill in all fields");
      return;
    }

    if (startTime >= endTime) {
      alert("End time must be after start time");
      return;
    }

    if (!isTimeSlotAvailable(selectedDesk, selectedDate, startTime, endTime)) {
      alert("This desk is already booked for the selected time slot");
      return;
    }

    const newReservation = {
      type: "desk" as const,
      resourceName: selectedDesk,
      date: selectedDate,
      startTime,
      endTime,
      userName,
      userType
    };

    onReserve(newReservation);

    // Create full reservation object for Google Calendar
    const fullReservation: Reservation = {
      ...newReservation,
      id: `temp-${Date.now()}`, // Temporary ID for Google Calendar
      purpose: "Desk reservation"
    };

    setLastReservation(fullReservation);
    setShowSuccessModal(true);

    // Reset form
    setSelectedDesk("");
    setStartTime("");
    setEndTime("");
    toast.success("Desk reserved successfully!");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Reserve a Desk</CardTitle>
          <CardDescription>Book a workspace for focused study or work</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">Your Name</Label>
            <Input
              id="user-name"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-type">User Type</Label>
            <Select value={userType} onValueChange={(v) => setUserType(v as "faculty" | "student")}>
              <SelectTrigger id="user-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desk">Select Desk</Label>
            <Select value={selectedDesk} onValueChange={setSelectedDesk}>
              <SelectTrigger id="desk">
                <SelectValue placeholder="Choose a desk" />
              </SelectTrigger>
              <SelectContent>
                {DESKS.map((desk) => (
                  <SelectItem key={desk.id} value={desk.name}>
                    {desk.name} - {desk.zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger id="start-time">
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
              <Label htmlFor="end-time">End Time</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger id="end-time">
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
            Reserve Desk
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Desks</CardTitle>
          <CardDescription>
            {selectedDate && startTime && endTime 
              ? `Available for ${selectedDate} from ${startTime} to ${endTime}`
              : "Select date and time to check availability"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {DESKS.map((desk) => {
              const isAvailable = !selectedDate || !startTime || !endTime || 
                isTimeSlotAvailable(desk.name, selectedDate, startTime, endTime);
              
              return (
                <div key={desk.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-gray-900">{desk.name}</p>
                    <p className="text-gray-500">{desk.floor} • {desk.zone}</p>
                  </div>
                  <Badge variant={isAvailable ? "default" : "secondary"}>
                    {isAvailable ? "Available" : "Booked"}
                  </Badge>
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
                  Your desk has been reserved successfully.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Desk:</strong> {lastReservation.resourceName}</p>
                    <p><strong>Date:</strong> {new Date(lastReservation.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {lastReservation.startTime} - {lastReservation.endTime}</p>
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
