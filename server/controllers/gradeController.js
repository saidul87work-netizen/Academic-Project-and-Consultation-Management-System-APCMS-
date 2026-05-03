import Grade from "../models/Grade.js";
import Submission from "../models/Submission.js";
import Stage from "../models/Stage.js";

// GRADE a submission (Supervisor)
export const gradeSubmission = async (req, res) => {
  try {
    const { score, stars, feedback } = req.body;

    // Get submission and its stage for weight
    const submission = await Submission.findById(req.params.submissionId)
      .populate("stage");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    // Calculate weighted score automatically
    const weightedScore = (score * submission.stage.weight) / 100;

    const grade = await Grade.create({
      submission: submission._id,
      gradedBy: req.body.userId,
      score,
      stars,
      feedback,
      weightedScore
    });

    // Update submission status to graded
    await Submission.findByIdAndUpdate(
      req.params.submissionId,
      { status: "graded" }
    );

    res.status(201).json({
      success: true,
      message: "Graded successfully!",
      data: grade,
      weightedScore: weightedScore
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET grade for a submission
export const getGradeBySubmission = async (req, res) => {
  try {
    const grade = await Grade.findOne({
      submission: req.params.submissionId
    }).populate("gradedBy", "name email");

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: "Grade not found"
      });
    }

    res.status(200).json({
      success: true,
      data: grade
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET all grades for a project (calculate total weighted score)
export const getProjectGrades = async (req, res) => {
  try {
    const grades = await Grade.find()
      .populate({
        path: "submission",
        match: { project: req.params.projectId },
        populate: { path: "stage" }
      });

    // Filter out null submissions
    const validGrades = grades.filter(g => g.submission);

    // Calculate total weighted score
    const totalWeightedScore = validGrades.reduce((sum, grade) => {
      return sum + (grade.weightedScore || 0);
    }, 0);

    res.status(200).json({
      success: true,
      data: validGrades,
      totalWeightedScore: totalWeightedScore.toFixed(2)
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};