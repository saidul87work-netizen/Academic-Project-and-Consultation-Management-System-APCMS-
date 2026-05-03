import express from "express";
import {
  submitPeerReview,
  getPeerReviews
} from "../controllers/peerReviewController.js";

const router = express.Router();

// Submit peer review
router.post("/:submissionId/review", submitPeerReview);

// Get all peer reviews for a submission
router.get("/:submissionId", getPeerReviews);

export default router;