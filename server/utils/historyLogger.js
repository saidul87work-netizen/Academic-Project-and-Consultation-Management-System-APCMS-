import ProjectHistory from '../models/ProjectHistory.js';

export const logProjectHistory = async ({ projectId, actorId, actorRole, action, details, metadata = {} }) => {
  try {
    const history = new ProjectHistory({
      projectId,
      actorId,
      actorRole,
      action,
      details,
      metadata,
      timestamp: new Date()
    });
    await history.save();
    return history;
  } catch (error) {
    console.error('Failed to log project history:', error);
  }
};
