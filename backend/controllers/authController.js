const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'ALL FIELDS REQUIRED.' });
    if (password.length < 6) return res.status(400).json({ message: 'PASSWORD MIN 6 CHARS.' });
    if (await User.findOne({ email })) return res.status(400).json({ message: 'EMAIL ALREADY REGISTERED.' });
    const count = await User.countDocuments();
    const user = await User.create({ name, email, password, role: count === 0 ? 'admin' : 'member' });
    res.status(201).json({ token: sign(user._id), user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'EMAIL AND PASSWORD REQUIRED.' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'INVALID CREDENTIALS.' });
    if (!user.isActive) return res.status(401).json({ message: 'ACCOUNT DEACTIVATED.' });
    res.json({ token: sign(user._id), user: user.toJSON() });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMe = (req, res) => res.json({ user: req.user });
