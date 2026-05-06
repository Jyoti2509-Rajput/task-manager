import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function TaskModal({ open, onClose, onSubmit, task, defaultStatus, members }) {
  const [form, setForm] = useState({ title: '', description: '', status: 'todo', priority: 'medium', assignedTo: '', dueDate: '', tags: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(task ? {
        title: task.title || '', description: task.description || '',
        status: task.status || 'todo', priority: task.priority || 'medium',
        assignedTo: task.assignedTo?._id || '', dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        tags: task.tags?.join(', ') || ''
      } : { title: '', description: '', status: defaultStatus || 'todo', priority: 'medium', assignedTo: '', dueDate: '', tags: '' });
    }
  }, [open, task, defaultStatus]);

  const handle = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        assignedTo: form.assignedTo || undefined,
        dueDate: form.dueDate || undefined
      });
      onClose();
    } finally { setLoading(false); }
  };

  const sel = `forge-input px-3 py-2.5 cursor-pointer`;
  const lbl = `forge-label block mb-1.5`;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative forge-card w-full max-w-lg z-10 overflow-hidden">
            <div className="h-0.5 bg-acid" />
            <div className="p-8">
              <p className="slash-prefix font-mono text-xs text-forge-text tracking-widest mb-2">{task ? 'MODIFY' : 'NEW TASK'}</p>
              <h3 className="font-display text-4xl tracking-wider mb-8">{task ? 'EDIT TASK.' : 'DEPLOY TASK.'}</h3>

              <form onSubmit={handle} className="space-y-4">
                <div>
                  <label className={lbl}>TASK TITLE *</label>
                  <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="What needs to ship?" className="forge-input px-4 py-3" />
                </div>
                <div>
                  <label className={lbl}>DESCRIPTION</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Details..." rows={2} className="forge-input px-4 py-3 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>STATUS</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={sel}>
                      <option value="todo">TO DO</option>
                      <option value="inprogress">IN PROGRESS</option>
                      <option value="done">DONE</option>
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>PRIORITY</label>
                    <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className={sel}>
                      <option value="high">HIGH</option>
                      <option value="medium">MEDIUM</option>
                      <option value="low">LOW</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>ASSIGN TO</label>
                    <select value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} className={sel}>
                      <option value="">— UNASSIGNED</option>
                      {members?.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>DUE DATE</label>
                    <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className={`${sel} forge-input`} />
                  </div>
                </div>
                <div>
                  <label className={lbl}>TAGS (comma-separated)</label>
                  <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                    placeholder="frontend, bug, urgent" className="forge-input px-4 py-3" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className="btn-ghost flex-1 py-3">CANCEL</button>
                  <button type="submit" disabled={loading}
                    className="btn-acid flex-1 py-3 flex items-center justify-center gap-2 tracking-wider text-sm">
                    {loading ? <><div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" /> SAVING...</> : task ? 'UPDATE →' : 'DEPLOY →'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
