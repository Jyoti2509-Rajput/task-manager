import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { fmtFull } from '../utils/helpers';
import toast from 'react-hot-toast';

function NewProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('NAME REQUIRED');
    setLoading(true);
    try {
      const r = await api.post('/projects', form);
      onCreated(r.data.project);
      toast.success('PROJECT CREATED');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'FAILED');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative forge-card w-full max-w-md z-10 overflow-hidden">
        <div className="h-0.5 bg-acid w-full" />
        <div className="p-8">
          <p className="slash-prefix font-mono text-xs text-forge-text tracking-widest mb-2">NEW PROJECT</p>
          <h3 className="font-display text-4xl tracking-wider mb-8">INITIALIZE.</h3>

          <form onSubmit={handle} className="space-y-5">
            <div>
              <label className="forge-label block mb-2">PROJECT NAME</label>
              <input required placeholder="e.g. PRODUCT LAUNCH" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="forge-input px-4 py-3" />
            </div>
            <div>
              <label className="forge-label block mb-2">DESCRIPTION</label>
              <textarea placeholder="What's this project about?" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3} className="forge-input px-4 py-3 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-ghost flex-1 py-3">CANCEL</button>
              <button type="submit" disabled={loading}
                className="btn-acid flex-1 py-3 flex items-center justify-center gap-2">
                {loading ? <><div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" /> CREATING...</> : '+ CREATE'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    api.get('/projects').then(r => { setProjects(r.data.projects); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="slash-prefix font-mono text-xs text-forge-text tracking-widest mb-2">WORKSPACE</p>
          <h1 className="font-display text-7xl tracking-wider mb-2">PROJECTS</h1>
          <p className="text-forge-text text-sm">All initiatives across your team.</p>
        </div>
        <button onClick={() => setModal(true)}
          className="btn-acid px-6 py-3.5 flex items-center gap-3 text-sm tracking-widest">
          + NEW PROJECT
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="forge-card h-48 skeleton" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-5xl text-forge-muted mb-3">NO PROJECTS</p>
          <p className="font-mono text-xs text-forge-text mb-6">Initialize your first project to begin operations.</p>
          <button onClick={() => setModal(true)} className="btn-acid px-6 py-3 text-sm tracking-widest">+ NEW PROJECT</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p, i) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Link to={`/projects/${p._id}`}
                className="forge-card p-6 block hover:border-acid/30 transition-all duration-150 group">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-10 h-10 flex items-center justify-center border border-forge-border group-hover:border-acid/40 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <rect x="2" y="5" width="14" height="10" rx="1" stroke="#444" strokeWidth="1.5"/>
                      <path d="M6 5V4a2 2 0 014 0v1" stroke="#444" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <span className="font-mono text-xs text-forge-text tracking-widest">
                    {new Date(p.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' }).toUpperCase()}
                  </span>
                </div>

                <h3 className="font-display text-2xl tracking-wider mb-2 group-hover:text-acid transition-colors">{p.name}</h3>
                {p.description && <p className="text-forge-text text-sm mb-6 line-clamp-2">{p.description}</p>}

                <div className="pt-4 border-t border-forge-border flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="4.5" r="2.5" stroke="#666" strokeWidth="1.2"/>
                    <path d="M2 12c0-2.761 2.239-4 5-4s5 1.239 5 4" stroke="#666" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  <span className="font-mono text-xs text-forge-text tracking-wider">
                    {p.members?.length || 1} {p.members?.length === 1 ? 'MEMBER' : 'MEMBERS'}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && <NewProjectModal onClose={() => setModal(false)} onCreated={p => setProjects(ps => [p, ...ps])} />}
      </AnimatePresence>
    </div>
  );
}
