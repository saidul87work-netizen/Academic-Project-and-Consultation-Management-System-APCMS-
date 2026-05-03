import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Monitor, Users, Calendar, CalendarPlus, Download } from "lucide-react";
import type { Reservation } from "../App";
import { toast } from "sonner";
import { createGoogleCalendarEvent, downloadICSFile } from "../utils/googleCalendar";

interface LabAvailabilityProps {
  reservations: Reservation[];
  onReserve: (reservation: Omit<Reservation, "id">) => void;
}

const LABS = [
  { id: "lab1", name: "Computer Lab 1", capacity: 30, floor: "2nd Floor", computers: 30 },
  { id: "lab2", name: "Computer Lab 2", capacity: 25, floor: "2nd Floor", computers: 25 },
  { id: "lab3", name: "Computer Lab 3", capacity: 40, floor: "3rd Floor", computers: 40 },
  { id: "lab4", name: "Mac Lab", capacity: 20, floor: "3rd Floor", computers: 20 },
];

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

export function LabAvailability({ reservations, onReserve }: LabAvailabilityProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLab, setSelectedLab] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [userName, setUserName] = useState("");
  const [userType, setUserType] = useState<"faculty" | "student">("faculty");
  const [purpose, setPurpose] = useState("");
  const [lastReservation, setLastReservation] = useState<Reservation | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isLabAvailable = (labName: string, date: string, start: string, end: string) => {
    return !reservations.some(r => {
      if (r.resourceName !== labName || r.date !== date) return false;
      
      const rStart = parseInt(r.startTime.replace(":", ""));
      const rEnd = parseInt(r.endTime.replace(":", ""));
      const sStart = parseInt(start.replace(":", ""));
      const sEnd = parseInt(end.replace(":", ""));
      
      return (sStart < rEnd && sEnd > rStart);
    });
  };

  const getLabSchedule = (labName: string, date: string) => {
    return TIME_SLOTS.map(time => {
      const nextHour = String(parseInt(time.split(':')[0]) + 1).padStart(2, '0') + ':00';
      const isBooked = !isLabAvailable(labName, date, time, nextHour);
      const booking = reservations.find(r => 
        r.resourceName === labName && 
        r.date === date &&
        parseInt(r.startTime.replace(":", "")) <= parseInt(time.replace(":", "")) &&
        parseInt(r.endTime.replace(":", "")) > parseInt(time.replace(":", ""))
      );
      return { time, isBooked, booking };
    });
  };

  const handleReserve = () => {
    if (!selectedLab || !startTime || !endTime || !userName || !purpose) {
      toast.error("Please fill in all fields");
      return;
    }

    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }

    if (!isLabAvailable(selectedLab, selectedDate, startTime, endTime)) {
      toast.error("This lab is already booked for the selected time slot");
      return;
    }

    const newReservation = {
      type: "lab" as const,
      resourceName: selectedLab,
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
    setSelectedLab("");
    setStartTime("");
    setEndTime("");
    setPurpose("");
    toast.success("Lab reserved successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reserve a Computer Lab</CardTitle>
            <CardDescription>Book a lab for workshops, consultations, or project sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lab-user-name">Your Name</Label>
              <Input
                id="lab-user-name"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lab-user-type">User Type</Label>
              <Select value={userType} onValueChange={(v) => setUserType(v as "faculty" | "student")}>
                <SelectTrigger id="lab-user-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                placeholder="e.g., Programming workshop, Project session"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lab-date">Date</Label>
              <Input
                id="lab-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lab">Select Lab</Label>
              <Select value={selectedLab} onValueChange={setSelectedLab}>
                <SelectTrigger id="lab">
                  <SelectValue placeholder="Choose a lab" />
                </SelectTrigger>
                <SelectContent>
                  {LABS.map((lab) => (
                    <SelectItem key={lab.id} value={lab.name}>
                      {lab.name} - {lab.capacity} seats
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lab-start-time">Start Time</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger id="lab-start-time">
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
                <Label htmlFor="lab-end-time">End Time</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger id="lab-end-time">
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
              Reserve Lab
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Computer Labs</CardTitle>
            <CardDescription>Overview of available computer labs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {LABS.map((lab) => {
                const isAvailable = !selectedDate || !startTime || !endTime || 
                  isLabAvailable(lab.name, selectedDate, startTime, endTime);
                
                return (
                  <div key={lab.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-gray-900">{lab.name}</p>
                        <p className="text-gray-500">{lab.floor}</p>
                      </div>
                      <Badge variant={isAvailable ? "default" : "secondary"}>
                        {isAvailable ? "Available" : "Booked"}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Monitor className="size-4" />
                        <span>{lab.computers} computers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="size-4" />
                        <span>{lab.capacity} capacity</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Schedule - {selectedDate}</CardTitle>
          <CardDescription>View lab availability throughout the day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Time</th>
                  {LABS.map(lab => (
                    <th key={lab.id} className="p-2 text-left">{lab.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map(time => (
                  <tr key={time} className="border-b">
                    <td className="p-2">{time}</td>
                    {LABS.map(lab => {
                      const schedule = getLabSchedule(lab.name, selectedDate);
                      const slot = schedule.find(s => s.time === time);
                      return (
                        <td key={lab.id} className="p-2">
                          {slot?.isBooked ? (
                            <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-center">
                              <p>Booked</p>
                              {slot.booking && (
                                <p className="text-xs">{slot.booking.userName}</p>
                              )}
                            </div>
                          ) : (
                            <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-center">
                              Free
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
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
                  Your computer lab has been reserved successfully.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Lab:</strong> {lastReservation.resourceName}</p>
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
