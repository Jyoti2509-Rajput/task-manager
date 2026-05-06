const Task = require('../models/Task');
const Project = require('../models/Project');

const checkProjectAccess = async (projectId, userId, role) => {
  const project = await Project.findById(projectId);
  if (!project) return null;
  const isMember = project.members.some(m => m.toString() === userId.toString());
  if (!isMember && role !== 'admin') return null;
  return project;
};

exports.getTasks = async (req, res) => {
  try {
    const { projectId, status, priority, search } = req.query;
    const query = {};
    if (projectId) {
      const project = await checkProjectAccess(projectId, req.user._id, req.user.role);
      if (!project) return res.status(403).json({ message: 'ACCESS DENIED.' });
      query.project = projectId;
    }
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name color')
      .sort({ order: 1, createdAt: -1 });
    res.json({ tasks });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate, tags, projectId } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: 'TITLE REQUIRED.' });
    const project = await checkProjectAccess(projectId, req.user._id, req.user.role);
    if (!project) return res.status(403).json({ message: 'ACCESS DENIED.' });
    const task = await Task.create({
      title, description, status, priority, assignedTo: assignedTo || undefined,
      dueDate: dueDate || undefined, tags: tags || [], project: projectId,
      createdBy: req.user._id
    });
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    await task.populate('project', 'name color');
    res.status(201).json({ task });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'TASK NOT FOUND.' });
    const allowed = ['title', 'description', 'status', 'priority', 'assignedTo', 'dueDate', 'tags', 'order'];
    allowed.forEach(f => { if (req.body[f] !== undefined) task[f] = req.body[f]; });
    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    await task.populate('project', 'name color');
    res.json({ task });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'TASK NOT FOUND.' });
    await task.deleteOne();
    res.json({ message: 'TASK DELETED.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
