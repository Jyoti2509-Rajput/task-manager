const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'ACCESS DENIED. NO TOKEN.' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) return res.status(401).json({ message: 'USER NOT FOUND.' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'TOKEN INVALID OR EXPIRED.' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'ADMIN ACCESS REQUIRED.' });
  next();
};
