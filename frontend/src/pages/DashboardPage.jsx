import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { fmt, statusLabel, statusClass, isOverdue } from '../utils/helpers';

function StatCard({ label, value, icon, highlight, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className={`forge-card p-6 ${highlight ? 'border-acid/40 bg-acid/5' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <p className="forge-label">{label}</p>
        <span className="text-forge-text text-xl opacity-50">{icon}</span>
      </div>
      <div className={`stat-number ${highlight ? 'text-acid' : 'text-white'}`}>{value}</div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects/stats').then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const total = stats?.totalTasks || 0;
  const breakdown = { todo: 0, inprogress: 0, done: 0 };
  stats?.statusBreakdown?.forEach(s => { breakdown[s._id] = s.count; });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'GOOD MORNING' : hour < 18 ? 'GOOD AFTERNOON' : 'GOOD EVENING';

  return (
    <div className="p-8 max-w-6xl mx-auto page-enter">
      {/* Header */}
      <div className="mb-10">
        <p className="slash-prefix font-mono text-xs text-forge-text tracking-widest mb-2">COMMAND CENTER</p>
        <h1 className="font-display text-7xl tracking-wider mb-2">DASHBOARD</h1>
        <p className="text-forge-text text-sm">A snapshot of everything that matters right now.</p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[...Array(4)].map((_, i) => <div key={i} className="forge-card h-28 skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="PROJECTS" value={stats?.projectCount ?? 0} icon="⊡" delay={0} />
          <StatCard label="TOTAL TASKS" value={stats?.totalTasks ?? 0} icon="≡" delay={0.05} />
          <StatCard label="MY TASKS" value={stats?.myTasks ?? 0} icon="∿" highlight delay={0.1} />
          <StatCard label="OVERDUE" value={stats?.overdueCount ?? 0} icon="⚠" delay={0.15} />
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* My Active Tasks */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-3 forge-card p-6">
          <p className="slash-prefix font-mono text-xs text-forge-text tracking-widest mb-2">ASSIGNED</p>
          <h2 className="font-display text-3xl tracking-wider mb-6">MY ACTIVE TASKS</h2>

          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 skeleton" />)}</div>
          ) : stats?.myActiveTasks?.length > 0 ? (
            <div className="space-y-px">
              {stats.myActiveTasks.map((task, i) => {
                const overdue = isOverdue(task);
                return (
                  <motion.div key={task._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.05 }}
                    className={`flex items-center justify-between p-4 border-b border-forge-border last:border-0 hover:bg-forge-card/50 transition-colors ${overdue ? 'border-l-2 border-l-red-500' : ''}`}>
                    <div>
                      <p className={`text-sm font-medium mb-0.5 ${overdue ? 'text-red-400' : 'text-white'}`}>{task.title}</p>
                      <p className="font-mono text-xs text-forge-text">
                        {task.project?.name} {task.dueDate && `· Due ${fmt(task.dueDate)}`}
                        {overdue && ' · OVERDUE'}
                      </p>
                    </div>
                    <span className={`font-mono text-xs px-3 py-1 ${statusClass[task.status]}`}>
                      {statusLabel[task.status]}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="font-display text-4xl text-forge-muted mb-2">ALL CLEAR</p>
              <p className="font-mono text-xs text-forge-text">No active tasks assigned to you.</p>
            </div>
          )}
        </motion.div>

        {/* Status Mix */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="lg:col-span-2 forge-card p-6">
          <p className="slash-prefix font-mono text-xs text-forge-text tracking-widest mb-2">DISTRIBUTION</p>
          <h2 className="font-display text-3xl tracking-wider mb-6">STATUS MIX</h2>

          {loading ? (
            <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-10 skeleton" />)}</div>
          ) : (
            <div className="space-y-4">
              {[
                { id: 'todo', label: 'TO DO', color: '#444' },
                { id: 'inprogress', label: 'IN PROGRESS', color: '#CCFF00' },
                { id: 'done', label: 'DONE', color: '#00ff80' }
              ].map(({ id, label, color }) => {
                const count = breakdown[id] || 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-mono text-xs tracking-widest" style={{ color: id === 'todo' ? '#888' : color }}>{label}</span>
                      <span className="font-mono text-xs text-forge-text">{count} · {pct}%</span>
                    </div>
                    <div className="h-1.5 bg-forge-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                        className="h-full"
                        style={{ background: id === 'todo' ? '#444' : color }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="pt-4 border-t border-forge-border mt-4">
                <Link to="/projects" className="font-mono text-xs text-acid tracking-widest hover:underline flex items-center gap-2">
                  ALL PROJECTS →
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
