import express from "express";
import {
  createStage,
  getStagesByProject,
  getSingleStage,
  updateStage,
  deleteStage
} from "../controllers/stageController.js";

const router = express.Router();

// Create a stage
router.post("/", createStage);

// Get all stages for a project
router.get("/project/:projectId", getStagesByProject);

// Get single stage
router.get("/:stageId", getSingleStage);

// Update a stage
router.put("/:stageId", updateStage);

// Delete a stage
router.delete("/:stageId", deleteStage);

export default router;