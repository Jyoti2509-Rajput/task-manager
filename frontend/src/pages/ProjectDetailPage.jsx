import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { COLUMNS, isOverdue } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import KanbanColumn from '../components/kanban/KanbanColumn';
import TaskCard from '../components/kanban/TaskCard';
import TaskModal from '../components/kanban/TaskModal';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTask, setActiveTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('todo');
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showOverdue, setShowOverdue] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const fetchProject = useCallback(async () => {
    try {
      const r = await api.get(`/projects/${id}`);
      setProject(r.data.project);
      setTasks(r.data.tasks);
    } catch { toast.error('PROJECT NOT FOUND'); navigate('/projects'); }
    finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => {
    fetchProject();
    api.get('/users').then(r => setMembers(r.data.users));
  }, [fetchProject]);

  const colTasks = (status) => {
    let t = tasks.filter(t => t.status === status);
    if (search) t = t.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    if (filterPriority) t = t.filter(t => t.priority === filterPriority);
    if (showOverdue) t = t.filter(isOverdue);
    return t.sort((a, b) => a.order - b.order);
  };

  const overdueCount = tasks.filter(isOverdue).length;

  const handleDragStart = ({ active }) => setActiveTask(tasks.find(t => t._id === active.id) || null);

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;
    const src = tasks.find(t => t._id === active.id);
    if (!src) return;
    const overTask = tasks.find(t => t._id === over.id);
    const targetStatus = overTask ? overTask.status : over.id;
    if (!COLUMNS.find(c => c.id === targetStatus)) return;

    setTasks(prev => {
      const updated = prev.map(t => t._id === active.id ? { ...t, status: targetStatus } : t);
      const colT = updated.filter(t => t.status === targetStatus);
      const oi = colT.findIndex(t => t._id === active.id);
      const ni = overTask ? colT.findIndex(t => t._id === over.id) : colT.length - 1;
      const reordered = arrayMove(colT, oi, ni).map((t, i) => ({ ...t, order: i }));
      return [...updated.filter(t => t.status !== targetStatus), ...reordered];
    });

    try { await api.put(`/tasks/${active.id}`, { status: targetStatus }); }
    catch { toast.error('UPDATE FAILED'); fetchProject(); }
  };

  const handleCreate = async (data) => {
    try {
      const r = await api.post('/tasks', { ...data, projectId: id });
      setTasks(p => [r.data.task, ...p]);
      toast.success('TASK DEPLOYED');
    } catch (err) { toast.error(err.response?.data?.message || 'FAILED'); throw err; }
  };

  const handleUpdate = async (data) => {
    try {
      const r = await api.put(`/tasks/${editTask._id}`, data);
      setTasks(p => p.map(t => t._id === editTask._id ? r.data.task : t));
      toast.success('TASK UPDATED');
    } catch (err) { toast.error(err.response?.data?.message || 'FAILED'); throw err; }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(p => p.filter(t => t._id !== taskId));
      toast.success('TASK DELETED');
    } catch { toast.error('DELETE FAILED'); }
  };

  const handleDeleteProject = async () => {
    if (!confirm(`Delete project "${project?.name}"? This removes all tasks.`)) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('PROJECT TERMINATED');
      navigate('/projects');
    } catch { toast.error('DELETE FAILED'); }
  };

  const openNew = (status) => { setEditTask(null); setDefaultStatus(status); setModalOpen(true); };
  const openEdit = (task) => { setEditTask(task); setModalOpen(true); };

  if (loading) return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="h-8 w-48 skeleton mb-4" />
      <div className="h-16 w-80 skeleton mb-10" />
      <div className="flex gap-6">
        {[...Array(3)].map((_, i) => <div key={i} className="w-72 space-y-3"><div className="h-8 skeleton" />{[...Array(3)].map((_, j) => <div key={j} className="h-24 skeleton" />)}</div>)}
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col page-enter">
      {/* Project header */}
      <div className="px-8 py-6 border-b border-forge-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/projects" className="font-mono text-xs text-forge-text hover:text-acid transition-colors tracking-wider">PROJECTS</Link>
              <span className="font-mono text-xs text-forge-border">/</span>
              <span className="font-mono text-xs text-acid tracking-wider">{project?.name}</span>
            </div>
            <h1 className="font-display text-5xl tracking-wider">{project?.name}</h1>
            {project?.description && <p className="text-forge-text text-sm mt-1">{project.description}</p>}
          </div>

          <div className="flex items-center gap-3">
            {/* Stats pills */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="font-mono text-xs px-3 py-1.5 border border-forge-border text-forge-text">{tasks.length} TASKS</span>
              {overdueCount > 0 && (
                <button onClick={() => setShowOverdue(s => !s)}
                  className={`font-mono text-xs px-3 py-1.5 border transition-all ${showOverdue ? 'border-red-500/50 text-red-400 bg-red-950/30' : 'border-forge-border text-red-500 hover:border-red-800'}`}>
                  {overdueCount} OVERDUE
                </button>
              )}
            </div>

            {/* Search */}
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="SEARCH TASKS..."
              className="forge-input px-3 py-2 font-mono text-xs w-36 tracking-wider" />

            {/* Priority filter */}
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
              className="forge-input px-3 py-2 font-mono text-xs tracking-wider cursor-pointer w-32">
              <option value="">ALL PRIORITY</option>
              <option value="high">HIGH</option>
              <option value="medium">MEDIUM</option>
              <option value="low">LOW</option>
            </select>

            {/* New task */}
            <button onClick={() => openNew('todo')}
              className="btn-acid px-5 py-2.5 text-xs tracking-widest flex items-center gap-2">
              + NEW TASK
            </button>

            {/* Delete project (owner/admin) */}
            {(user?.role === 'admin' || project?.owner?._id === user?._id) && (
              <button onClick={handleDeleteProject}
                className="btn-ghost px-3 py-2.5 text-xs text-red-600 border-red-900/50 hover:border-red-700 hover:text-red-400">
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto px-8 py-6">
          <div className="flex gap-8 h-full min-w-max">
            {COLUMNS.map((col, i) => (
              <motion.div key={col.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <KanbanColumn col={col} tasks={colTasks(col.id)} onAdd={openNew} onEdit={openEdit} onDelete={handleDelete} />
              </motion.div>
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-2 opacity-80 scale-105 shadow-2xl">
              <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Task Modal */}
      <TaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTask(null); }}
        onSubmit={editTask ? handleUpdate : handleCreate}
        task={editTask}
        defaultStatus={defaultStatus}
        members={members}
      />
    </div>
  );
}
