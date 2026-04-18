// SupervisorAvailability.tsx
// Faculty/Supervisor view. Lets them add and remove weekly availability
// time slots so students know when to book consultations.

import { useState } from "react";
import { Plus, Trash2, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  location: string;
}

// Mock initial slots — replace with API fetch when backend is ready
const INITIAL_SLOTS: TimeSlot[] = [
  { id: "s1", day: "Monday", startTime: "10:00", endTime: "12:00", location: "Room 401" },
  { id: "s2", day: "Wednesday", startTime: "14:00", endTime: "16:00", location: "Online (Zoom)" },
  { id: "s3", day: "Thursday", startTime: "09:00", endTime: "10:30", location: "Faculty Lounge" },
];

export function SupervisorAvailability() {
  const [slots, setSlots] = useState<TimeSlot[]>(INITIAL_SLOTS);
  const [saving, setSaving] = useState(false);

  // Form state for adding a new slot
  const [form, setForm] = useState({
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
    location: "",
  });
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (!form.location.trim()) {
      toast.error("Please enter a location.");
      return;
    }
    if (form.startTime >= form.endTime) {
      toast.error("End time must be after start time.");
      return;
    }
    const newSlot: TimeSlot = {
      id: `s-${Date.now()}`,
      day: form.day,
      startTime: form.startTime,
      endTime: form.endTime,
      location: form.location.trim(),
    };
    setSlots((prev) => [...prev, newSlot]);
    setForm({ day: "Monday", startTime: "09:00", endTime: "10:00", location: "" });
    setShowForm(false);
    toast.success("Slot added. Remember to save changes.");
  };

  const handleDelete = (id: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== id));
    toast.info("Slot removed.");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: replace with real API call e.g. supervisorApi.updateAvailability(slots)
      await new Promise((r) => setTimeout(r, 800));
      toast.success("Availability saved successfully!");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Group slots by day for display
  const slotsByDay = DAYS.reduce<Record<string, TimeSlot[]>>((acc, day) => {
    acc[day] = slots.filter((s) => s.day === day);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold">My Availability</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Set the time slots when students can book consultations with you.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowForm(!showForm)}>
            <Plus className="size-4 mr-1" />
            Add Slot
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <CheckCircle className="size-4 mr-1" />
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Add Slot Form */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="text-sm">New Availability Slot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Day */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Day</label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  value={form.day}
                  onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Start Time */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Start Time</label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                />
              </div>

              {/* End Time */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">End Time</label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                />
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Location</label>
                <Input
                  placeholder="e.g. Room 401, Zoom"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={handleAdd}>Add</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Schedule */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DAYS.map((day) => {
          const daySlots = slotsByDay[day];
          return (
            <Card key={day}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  {day}
                  {daySlots.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {daySlots.length} slot{daySlots.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {daySlots.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">No slots set</p>
                ) : (
                  daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between rounded-md bg-muted px-3 py-2 group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Clock className="size-3 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium">
                            {slot.startTime} – {slot.endTime}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{slot.location}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(slot.id)}
                        title="Remove slot"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info note */}
      <p className="text-xs text-muted-foreground">
        * Students will see these slots when requesting consultations. Click "Save Changes" to publish updates.
      </p>
    </div>
  );
}
