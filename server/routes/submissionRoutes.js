import express from "express";
import {
  submitWork,
  getSubmissionsByStage,
  getSingleSubmission,
  requestResubmission,
  resubmitWork
} from "../controllers/submissionController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Submit work with file upload
router.post("/submit", upload.single("file"), submitWork);

// Get all submissions for a stage
router.get("/stage/:stageId", getSubmissionsByStage);

// Get single submission
router.get("/:submissionId", getSingleSubmission);

// Request resubmission (Supervisor)
router.patch("/:submissionId/request-resubmission", requestResubmission);

// Resubmit work (Student)
router.patch("/:submissionId/resubmit", upload.single("file"), resubmitWork);

export default router;