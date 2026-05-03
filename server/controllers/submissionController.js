import Submission from "../models/Submission.js";
import Stage from "../models/Stage.js";

// SUBMIT work (Student)
export const submitWork = async (req, res) => {
  try {
    const { stageId, projectId } = req.body;

    // Find the stage to check deadline
    const stage = await Stage.findById(stageId);
    if (!stage) {
      return res.status(404).json({
        success: false,
        message: "Stage not found"
      });
    }

    // Check if submission is late
    const isLate = new Date() > new Date(stage.deadline);

    const submission = await Submission.create({
      stage: stageId,
      project: projectId,
      submittedBy: req.body.userId,
      fileUrl: req.file ? req.file.path : "",
      fileName: req.file ? req.file.originalname : "",
      isLate: isLate,
      status: "submitted"
    });

    res.status(201).json({
      success: true,
      message: isLate
        ? "⚠️ Submitted but LATE! Supervisor has been notified."
        : "✅ Submitted successfully!",
      isLate: isLate,
      data: submission
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET all submissions for a stage
export const getSubmissionsByStage = async (req, res) => {
  try {
    const submissions = await Submission.find({
      stage: req.params.stageId
    }).populate("submittedBy", "name email");

    res.status(200).json({
      success: true,
      data: submissions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET single submission
export const getSingleSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
      .populate("submittedBy", "name email")
      .populate("stage");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    res.status(200).json({
      success: true,
      data: submission
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// REQUEST resubmission (Supervisor)
export const requestResubmission = async (req, res) => {
  try {
    const { resubmissionNote } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      req.params.submissionId,
      {
        status: "resubmission_requested",
        resubmissionNote: resubmissionNote
      },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Resubmission requested successfully",
      data: submission
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// RESUBMIT work (Student)
export const resubmitWork = async (req, res) => {
  try {
    const stage = await Submission.findById(req.params.submissionId)
      .populate("stage");

    const isLate = new Date() > new Date(stage.stage.deadline);

    const submission = await Submission.findByIdAndUpdate(
      req.params.submissionId,
      {
        fileUrl: req.file ? req.file.path : "",
        fileName: req.file ? req.file.originalname : "",
        status: "submitted",
        isLate: isLate,
        resubmissionNote: ""
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Resubmitted successfully!",
      data: submission
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};