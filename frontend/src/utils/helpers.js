import { format, isPast, parseISO } from 'date-fns';

export const fmt = (d) => {
  if (!d) return null;
  try { return format(typeof d === 'string' ? parseISO(d) : d, 'MMM dd'); }
  catch { return null; }
};

export const fmtFull = (d) => {
  if (!d) return '—';
  try { return format(typeof d === 'string' ? parseISO(d) : d, 'MMM dd, yyyy'); }
  catch { return '—'; }
};

export const isOverdue = (task) => {
  if (!task.dueDate || task.status === 'done') return false;
  return isPast(new Date(task.dueDate));
};

export const initials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export const statusLabel = { todo: 'TO DO', inprogress: 'IN PROGRESS', done: 'DONE' };
export const statusClass = { todo: 'pill-todo', inprogress: 'pill-inprogress', done: 'pill-done' };

export const priorityDot = { high: 'dot-high', medium: 'dot-medium', low: 'dot-low' };

export const COLUMNS = [
  { id: 'todo', label: 'TO DO' },
  { id: 'inprogress', label: 'IN PROGRESS' },
  { id: 'done', label: 'DONE' }
];
