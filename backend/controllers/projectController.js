const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

exports.getProjects = async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? { isArchived: false }
      : { members: req.user._id, isArchived: false };
    const projects = await Project.find(query)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });
    res.json({ projects });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');
    if (!project) return res.status(404).json({ message: 'PROJECT NOT FOUND.' });
    const isMember = project.members.some(m => m._id.toString() === req.user._id.toString());
    if (!isMember && req.user.role !== 'admin') return res.status(403).json({ message: 'ACCESS DENIED.' });
    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: -1 });
    res.json({ project, tasks });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createProject = async (req, res) => {
  try {
    const { name, description, color, memberEmails } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'PROJECT NAME REQUIRED.' });
    let memberIds = [];
    if (memberEmails?.length) {
      const users = await User.find({ email: { $in: memberEmails } });
      memberIds = users.map(u => u._id);
    }
    const project = await Project.create({
      name: name.toUpperCase(),
      description, color: color || '#CCFF00',
      owner: req.user._id,
      members: [...new Set([...memberIds.map(String), req.user._id.toString()])]
    });
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');
    res.status(201).json({ project });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'PROJECT NOT FOUND.' });
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'ONLY OWNER CAN EDIT.' });
    const { name, description, color } = req.body;
    if (name) project.name = name.toUpperCase();
    if (description !== undefined) project.description = description;
    if (color) project.color = color;
    await project.save();
    res.json({ project });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'PROJECT NOT FOUND.' });
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'ONLY OWNER CAN DELETE.' });
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ message: 'PROJECT DELETED.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'PROJECT NOT FOUND.' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'USER NOT FOUND.' });
    if (!project.members.includes(user._id)) project.members.push(user._id);
    await project.save();
    await project.populate('members', 'name email');
    res.json({ project });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const projectQuery = req.user.role === 'admin' ? {} : { members: userId };
    const projects = await Project.find({ ...projectQuery, isArchived: false });
    const projectIds = projects.map(p => p._id);

    const [totalTasks, myTasks, overdueCount, statusBreakdown] = await Promise.all([
      Task.countDocuments({ project: { $in: projectIds } }),
      Task.countDocuments({ project: { $in: projectIds }, assignedTo: userId }),
      Task.countDocuments({ project: { $in: projectIds }, dueDate: { $lt: new Date() }, status: { $ne: 'done' } }),
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    const myActiveTasks = await Task.find({
      project: { $in: projectIds }, assignedTo: userId, status: { $ne: 'done' }
    }).populate('project', 'name').sort({ dueDate: 1 }).limit(5);

    res.json({
      projectCount: projects.length,
      totalTasks, myTasks, overdueCount,
      statusBreakdown,
      myActiveTasks
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
