import Stage from "../models/Stage.js";

// CREATE a new stage (Supervisor/Admin only)
export const createStage = async (req, res) => {
  try {
    const { name, weight, deadline, deliverables, order, project } = req.body;

    const stage = await Stage.create({
      name,
      weight,
      deadline,
      deliverables,
      order,
      project
    });

    res.status(201).json({
      success: true,
      message: "Stage created successfully",
      data: stage
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET all stages for a project
export const getStagesByProject = async (req, res) => {
  try {
    const stages = await Stage.find({ 
      project: req.params.projectId 
    }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: stages
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET single stage
export const getSingleStage = async (req, res) => {
  try {
    const stage = await Stage.findById(req.params.stageId);

    if (!stage) {
      return res.status(404).json({
        success: false,
        message: "Stage not found"
      });
    }

    res.status(200).json({
      success: true,
      data: stage
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE a stage
export const updateStage = async (req, res) => {
  try {
    const stage = await Stage.findByIdAndUpdate(
      req.params.stageId,
      req.body,
      { new: true }
    );

    if (!stage) {
      return res.status(404).json({
        success: false,
        message: "Stage not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Stage updated successfully",
      data: stage
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE a stage
export const deleteStage = async (req, res) => {
  try {
    const stage = await Stage.findByIdAndDelete(req.params.stageId);

    if (!stage) {
      return res.status(404).json({
        success: false,
        message: "Stage not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Stage deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};