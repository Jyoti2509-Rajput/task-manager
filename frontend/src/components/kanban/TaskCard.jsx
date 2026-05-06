import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { isOverdue, statusLabel, statusClass, priorityDot, fmt } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

export default function TaskCard({ task, onEdit, onDelete }) {
  const { user } = useAuth();
  const [menu, setMenu] = useState(false);
  const overdue = isOverdue(task);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 };

  const initials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div
      ref={setNodeRef} style={style}
      className={`forge-card p-4 task-card cursor-grab active:cursor-grabbing select-none
        ${overdue ? 'overdue-card' : ''}
        ${isDragging ? 'rotate-1 scale-105 border-acid/20' : ''}
      `}
      {...attributes} {...listeners}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDot[task.priority]}`} />
          <p className={`text-sm font-medium leading-snug truncate ${overdue ? 'text-red-400' : 'text-white'} ${task.status === 'done' ? 'line-through opacity-50' : ''}`}>
            {task.title}
          </p>
        </div>

        {/* Actions */}
        <div className="relative flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={() => setMenu(m => !m)}
            className="w-6 h-6 flex items-center justify-center text-forge-text hover:text-white transition-colors font-mono text-sm"
          >···</button>
          {menu && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-7 z-50 w-32 forge-card border-forge-border/80 shadow-2xl overflow-hidden"
              onMouseLeave={() => setMenu(false)}>
              <button onPointerDown={e => e.stopPropagation()} onClick={() => { onEdit(task); setMenu(false); }}
                className="w-full text-left px-3 py-2.5 font-mono text-xs text-forge-text hover:bg-forge-muted hover:text-white transition-colors tracking-wider">
                EDIT
              </button>
              <button onPointerDown={e => e.stopPropagation()} onClick={() => { onDelete(task._id); setMenu(false); }}
                className="w-full text-left px-3 py-2.5 font-mono text-xs text-red-500 hover:bg-red-950 transition-colors tracking-wider">
                DELETE
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-forge-text mb-3 line-clamp-2 leading-relaxed">{task.description}</p>
      )}

      {/* Tags */}
      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map(t => (
            <span key={t} className="font-mono text-xs text-forge-text border border-forge-border px-1.5 py-0.5">#{t}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-forge-border">
        <span className={`font-mono text-xs px-2 py-0.5 ${statusClass[task.status]}`}>{statusLabel[task.status]}</span>
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className={`font-mono text-xs ${overdue ? 'text-red-400' : 'text-forge-text'}`}>{fmt(task.dueDate)}</span>
          )}
          {task.assignedTo && (
            <div className="w-5 h-5 bg-acid flex items-center justify-center">
              <span className="font-mono text-xs font-bold text-black" style={{ fontSize: '9px' }}>
                {initials(task.assignedTo.name)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
