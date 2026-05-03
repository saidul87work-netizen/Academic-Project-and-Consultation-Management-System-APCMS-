import PeerReview from "../models/PeerReview.js";
import Submission from "../models/Submission.js";

// SUBMIT peer review
export const submitPeerReview = async (req, res) => {
  try {
    const { comments, rating } = req.body;

    const peerReview = await PeerReview.create({
      submission: req.params.submissionId,
      reviewer: req.body.userId,
      comments,
      rating,
      status: "completed"
    });

    // Update submission status
    await Submission.findByIdAndUpdate(
      req.params.submissionId,
      { status: "pending_supervisor" }
    );

    res.status(201).json({
      success: true,
      message: "Peer review submitted! Work sent to supervisor.",
      data: peerReview
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET all peer reviews for a submission
export const getPeerReviews = async (req, res) => {
  try {
    const reviews = await PeerReview.find({
      submission: req.params.submissionId
    }).populate("reviewer", "name email");

    res.status(200).json({
      success: true,
      data: reviews
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};