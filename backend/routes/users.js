const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();
router.use(protect);
router.get('/', async (req, res) => {
  const users = await User.find({ isActive: true }).select('name email role');
  res.json({ users });
});
module.exports = router;
