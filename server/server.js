import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import consultationRoutes from "./routes/consultationRoutes.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json());

// Main routes for isolated Consultation module
app.use('/api/auth', authRoutes);
app.use('/api/consultations', consultationRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Consultation module backend running' }));

const startServer = async () => {
  try {
    const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/consultation_management";
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
