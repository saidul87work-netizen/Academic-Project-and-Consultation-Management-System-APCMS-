export const mockAuth = (req, res, next) => {
  // Read headers for demo mode
  const userId = req.headers['x-user-id'] || 'demo-faculty-1';
  const userRole = req.headers['x-user-role'] || 'faculty';

  // Set req.user for demo purposes
  req.user = {
    id: userId,
    role: userRole
  };

  next();
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

