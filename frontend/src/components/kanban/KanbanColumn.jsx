import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';

const COL_STYLE = {
  todo: { dot: '#444', accent: '#444' },
  inprogress: { dot: '#CCFF00', accent: '#CCFF00' },
  done: { dot: '#00ff80', accent: '#00ff80' }
};

export default function KanbanColumn({ col, tasks, onAdd, onEdit, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  const style = COL_STYLE[col.id];

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-forge-border">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full" style={{ background: style.dot, boxShadow: col.id !== 'todo' ? `0 0 8px ${style.dot}` : 'none' }} />
          <span className="font-mono text-xs tracking-widest" style={{ color: col.id === 'todo' ? '#666' : style.dot }}>{col.label}</span>
          <span className="font-mono text-xs px-2 py-0.5 border border-forge-border text-forge-text">{tasks.length}</span>
        </div>
        <button onClick={() => onAdd(col.id)}
          className="font-mono text-xs text-forge-text hover:text-acid transition-colors tracking-wider">
          + ADD
        </button>
      </div>

      {/* Drop area */}
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2.5 min-h-64 p-2 -mx-2 rounded transition-all duration-150 ${isOver ? 'drop-active border border-dashed border-acid/30' : ''}`}
      >
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {tasks.map(t => (
              <TaskCard key={t._id} task={t} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </AnimatePresence>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 border border-dashed border-forge-border/30">
            <span className="font-mono text-xs text-forge-border tracking-wider">EMPTY</span>
          </div>
        )}
      </div>
    </div>
  );
}
