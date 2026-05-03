import mongoose from 'mongoose';
import Reservation from '../models/Reservation.js';

const MONGODB_URI = 'mongodb://localhost:27017/campus-management';

const seedReservations = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const dummyReservations = [
      {
        userId: new mongoose.Types.ObjectId(),
        userName: "Rafsan Rahman",
        userEmail: "rafsan@example.com",
        type: "desk",
        resourceName: "Desk A-12",
        date: new Date(),
        startTime: "09:00",
        endTime: "11:00",
        purpose: "Study session",
        status: "Confirmed"
      },
      {
        userId: new mongoose.Types.ObjectId(),
        userName: "Rafsan Rahman",
        userEmail: "rafsan@example.com",
        type: "lab",
        resourceName: "Lab 301 - PC 5",
        date: new Date(),
        startTime: "14:00",
        endTime: "16:00",
        purpose: "Project work",
        status: "Confirmed"
      },
      {
        userId: new mongoose.Types.ObjectId(),
        userName: "Dr. Smith",
        userEmail: "smith@example.com",
        type: "meeting-room",
        resourceName: "Meeting Room B-05",
        date: new Date(),
        startTime: "10:00",
        endTime: "12:00",
        purpose: "Thesis defense prep",
        status: "Confirmed"
      }
    ];

    await Reservation.insertMany(dummyReservations);
    console.log('Successfully seeded dummy reservations!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding reservations:', error);
    process.exit(1);
  }
};

seedReservations();
