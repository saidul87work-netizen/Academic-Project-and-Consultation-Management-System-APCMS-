// useRoomAvailability.ts
// Polls room availability every POLL_INTERVAL ms and returns a map of
// roomId → { available: boolean, bookedBy?: string, until?: string }.
// Uses mock data — swap fetchAvailability() with a real API call when ready.

import { useState, useEffect, useCallback } from "react";

const POLL_INTERVAL = 30_000; // 30 seconds

export type RoomType = "desk" | "lab" | "meeting-room";

export interface RoomStatus {
  id: string;
  name: string;
  type: RoomType;
  available: boolean;
  bookedBy?: string;
  until?: string;     // e.g. "14:00"
  capacity?: number;
}

// Mock data generator — replace with real fetch
const MOCK_ROOMS: Omit<RoomStatus, "available" | "bookedBy" | "until">[] = [
  { id: "desk-a1", name: "Desk A-1", type: "desk" },
  { id: "desk-a2", name: "Desk A-2", type: "desk" },
  { id: "desk-b1", name: "Desk B-1", type: "desk" },
  { id: "lab-301", name: "Lab 301", type: "lab", capacity: 30 },
  { id: "lab-302", name: "Lab 302", type: "lab", capacity: 25 },
  { id: "mr-a",   name: "Meeting Room A", type: "meeting-room", capacity: 8 },
  { id: "mr-b",   name: "Meeting Room B", type: "meeting-room", capacity: 12 },
];

async function fetchAvailability(): Promise<RoomStatus[]> {
  // TODO: replace with real API call:
  //   const res = await axios.get("/api/rooms/availability");
  //   return res.data;

  // Randomly flip some rooms for demo purposes
  return MOCK_ROOMS.map((room) => {
    const available = Math.random() > 0.4;
    return {
      ...room,
      available,
      bookedBy: available ? undefined : "Demo User",
      until: available ? undefined : `${Math.floor(Math.random() * 4) + 12}:00`,
    };
  });
}

export function useRoomAvailability(type?: RoomType) {
  const [rooms, setRooms] = useState<RoomStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchAvailability();
      const filtered = type ? data.filter((r) => r.type === type) : data;
      setRooms(filtered);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError("Could not fetch room availability. Showing last known state.");
      console.error("useRoomAvailability error:", err);
    } finally {
      setLoading(false);
    }
  }, [type]);

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Poll on interval
  useEffect(() => {
    const id = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [refresh]);

  const availableCount = rooms.filter((r) => r.available).length;
  const totalCount = rooms.length;

  return {
    rooms,
    loading,
    error,
    lastUpdated,
    availableCount,
    totalCount,
    refresh,
  };
}
