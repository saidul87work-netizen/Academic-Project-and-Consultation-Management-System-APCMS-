import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { DeskReservation } from "./DeskReservation";
import { LabAvailability } from "./LabAvailability";
import { MeetingRoomReservation } from "./MeetingRoomReservation";
import type { Reservation } from "../App";

interface ReservationProps {
  reservations: Reservation[];
  onReserve: (reservation: Omit<Reservation, "id">) => void;
}

export function Reservation({ reservations, onReserve }: ReservationProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Workspace Reservation</h2>
        <p className="text-muted-foreground">Reserve desks, labs, and meeting rooms for your needs</p>
      </div>

      <Tabs defaultValue="desks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="desks">Desks</TabsTrigger>
          <TabsTrigger value="labs">Labs</TabsTrigger>
          <TabsTrigger value="meeting-rooms">Meeting Rooms</TabsTrigger>
        </TabsList>

        <TabsContent value="desks" className="space-y-6">
          <DeskReservation
            reservations={reservations.filter(r => r.type === "desk")}
            onReserve={onReserve}
          />
        </TabsContent>

        <TabsContent value="labs" className="space-y-6">
          <LabAvailability
            reservations={reservations.filter(r => r.type === "lab")}
            onReserve={onReserve}
          />
        </TabsContent>

        <TabsContent value="meeting-rooms" className="space-y-6">
          <MeetingRoomReservation
            reservations={reservations.filter(r => r.type === "meeting-room")}
            onReserve={onReserve}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
