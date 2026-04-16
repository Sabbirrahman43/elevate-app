import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { format, addDays, subDays } from 'date-fns';
import { Check, Plus, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const TaskBoard: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask, aiSettings, userProfile } = useAppContext();
  const [date, setDate] = useState(new Date());
  const [newTask, setNewTask] = useState('');
  const [popup, setPopup] = useState<{ msg: string; quote: string } | null>(null);
  const prevProgress = useRef(0);

  const ds = format(date, 'yyyy-MM-dd');
  const isToday = ds === format(new Date(), 'yyyy-MM-dd');
  const dayTasks = tasks.filter(t => t.date === ds);
  const done = dayTasks.filter(t => t.completed).length;
  const total = dayTasks.length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  useEffect(() => {
    const prev = prevProgress.current;
    prevProgress.current = progress;
    if (total === 0) return;
    const n = userProfile?.name || 'you';
    const p = (aiSettings?.persona || 'coach').toLowerCase();
    const g = p.includes('wife') ? 'My love,' : p.includes('girlfriend') ? 'Babe,' : p.includes('coach') ? 'Lets go,' : ('Hey ' + n + ',');
    const milestones: Record<number, { msg: string; quote: string }> = {
      1: { msg: g + ' you just completed your first task! That is how it starts.', quote: 'A journey begins with a single step.' },
      70: { msg: g + ' 70% done! You are in the zone. Most people quit here -- not you.', quote: 'Do not watch the clock. Keep going.' },
      80: { msg: g + ' 80%! This is where legends are made.', quote: 'It always seems impossible until it is done.' },
      90: { msg: g + ' 90%! One final push. You came too far to stop.', quote: 'The last 10% is what defines you.' },
      100: { msg: g + ' 100%! Every single task -- DONE. Remember this feeling.', quote: 'Success is small efforts repeated day in and day out.' },
    };
    if (done === 1 && prev === 0) { setPopup(milestones[1]); setTimeout(() => setPopup(null), 4000); return; }
    for (const m of [70, 80, 90, 100]) {
      if (progress >= m && prev < m) { setPopup(milestones[m]); setTimeout(() => setPopup(null), 4500); break; }
    }
  }, [progress, done, total]);

  const handleAdd = () => {
    if (!newTask.trim()) return;
    addTask(newTask.trim(), ds);
    setNewTask('');
  };

  const progressColor = progress === 0 ? 'bg-white/10' : progress < 40 ? 'bg-red-500' : progress < 70 ? 'bg-amber-500' : progress < 100 ? 'bg-emerald-500' : 'bg-emerald-400';

  return (
    <div className="h-full overflow-y-auto bg-[#0a0a0a] text-white p-4 md:p-6 no-scrollbar relative">
      <AnimatePresence>
        {popup && (
          <motion.div initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ type: 'spring', damping: 15 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-sm">
            <div className="bg-[#111] border border-emerald-500/25 rounded-2xl p-4 shadow-2xl shadow-emerald-500/10 flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0 text-emerald-400 font-bold text-sm">!</div>
              <div className="flex-1">
                <p className="text-sm text-white font-medium leading-relaxed">{popup.msg}</p>
                <p className="text-[11px] text-emerald-400 italic mt-1.5">{popup.quote}</p>
              </div>
              <button onClick={() => setPopup(null)} className="text-gray-600 hover:text-white flex-shrink-0"><X size={13} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display">Tasks</h1>
            <p className="text-sm text-gray-500 mt-0.5">{isToday ? 'Today' : format(date, 'EEEE, MMM d')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDate(d => subDays(d, 1))} className="p-1.5 bg-white/4 hover:bg-white/8 rounded-xl text-gray-500 hover:text-white transition-all"><ChevronLeft size={16} /></button>
            <button onClick={() => setDate(new Date())} className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold transition-all', isToday ? 'bg-emerald-500 text-white' : 'bg-white/4 text-gray-400 hover:bg-white/8')}>Today</button>
            <button onClick={() => setDate(d => addDays(d, 1))} className="p-1.5 bg-white/4 hover:bg-white/8 rounded-xl text-gray-500 hover:text-white transition-all"><ChevronRight size={16} /></button>
          </div>
        </div>

        {total > 0 && (
          <div className="bg-[#111] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">{done}/{total} complete</span>
              <span className="text-sm font-bold text-emerald-400 font-display">{progress}%</span>
            </div>
            <div className="h-1.5 bg-white/4 rounded-full overflow-hidden">
              <motion.div className={cn('h-full rounded-full', progressColor)} animate={{ width: progress + '%' }} transition={{ duration: 0.5 }} />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Add a task..."
            className="flex-1 h-12 px-4 bg-[#111] border border-white/6 rounded-2xl text-sm text-white placeholder-gray-700 outline-none focus:border-emerald-500/40 transition-all" />
          <button onClick={handleAdd} className="h-12 w-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-emerald-500/20">
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {dayTasks.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <p className="text-gray-600 text-sm">No tasks for this day</p>
                <p className="text-gray-700 text-xs mt-1">Type above and press Enter</p>
              </motion.div>
            ) : dayTasks.map(task => (
              <motion.div key={task.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                className={cn('flex items-center gap-3 p-4 rounded-2xl border transition-all group', task.completed ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-[#111] border-white/5 hover:border-white/8')}>
                <button onClick={() => toggleTask(task.id)} className={cn('w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all', task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 hover:border-emerald-500/60')}>
                  {task.completed && <Check size={11} strokeWidth={3} className="text-white" />}
                </button>
                <span className={cn('flex-1 text-sm font-medium', task.completed ? 'line-through text-gray-600' : 'text-gray-200')}>{task.name}</span>
                <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-700 hover:text-red-400 transition-all"><Trash2 size={13} /></button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
