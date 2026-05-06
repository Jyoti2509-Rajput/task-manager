require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskforge';

async function seed() {
  await mongoose.connect(URI);
  console.log('Connected');
  await User.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});

  const admin = await User.create({ name: 'Admin User', email: 'admin@taskforge.com', password: 'Admin@12345', role: 'admin' });
  const demo = await User.create({ name: 'Demo User', email: 'demo@taskforge.com', password: 'Demo@12345', role: 'member' });

  const p1 = await Project.create({ name: 'TASKFORGE PLATFORM', description: 'Core product development', owner: admin._id, members: [admin._id, demo._id] });
  const p2 = await Project.create({ name: 'MARKETING SITE', description: 'Landing page redesign', owner: admin._id, members: [admin._id] });

  const tasks = [
    { title: 'Set up CI/CD pipeline', status: 'todo', priority: 'high', project: p1._id, createdBy: admin._id, assignedTo: demo._id, dueDate: new Date(Date.now() + 3*86400000) },
    { title: 'Design system tokens', status: 'todo', priority: 'medium', project: p1._id, createdBy: admin._id, assignedTo: admin._id, dueDate: new Date(Date.now() + 5*86400000) },
    { title: 'Auth module tests', status: 'inprogress', priority: 'high', project: p1._id, createdBy: admin._id, assignedTo: demo._id, dueDate: new Date(Date.now() + 1*86400000) },
    { title: 'Kanban drag & drop', status: 'inprogress', priority: 'high', project: p1._id, createdBy: admin._id, assignedTo: admin._id, dueDate: new Date(Date.now() + 2*86400000) },
    { title: 'Deploy to Railway', status: 'done', priority: 'medium', project: p1._id, createdBy: admin._id, assignedTo: admin._id },
    { title: 'Homepage hero section', status: 'todo', priority: 'high', project: p2._id, createdBy: admin._id, assignedTo: admin._id, dueDate: new Date(Date.now() - 1*86400000) },
    { title: 'SEO meta tags', status: 'inprogress', priority: 'low', project: p2._id, createdBy: admin._id, assignedTo: admin._id },
  ];
  await Task.insertMany(tasks);

  console.log('\n⚡ TASKFORGE SEEDED');
  console.log('admin@taskforge.com / Admin@12345');
  console.log('demo@taskforge.com  / Demo@12345');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
