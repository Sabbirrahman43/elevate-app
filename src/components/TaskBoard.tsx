import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { Check, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const TaskBoard: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newTaskName, setNewTaskName] = useState('');

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const filteredTasks = tasks.filter(t => t.date === dateStr);
  const completedCount = filteredTasks.filter(t => t.completed).length;
  const total = filteredTasks.length;
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const isToday = isSameDay(selectedDate, new Date());

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskName.trim()) { addTask(newTaskName, dateStr); setNewTaskName(''); }
  };

  // Quick date chips
  const quickDates = [-1, 0, 1, 2].map(offset => {
    const d = addDays(new Date(), offset);
    return { date: d, label: offset === -1 ? 'Yesterday' : offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : format(d, 'EEE') };
  });

  return (
    <div className="h-full overflow-y-auto bg-[#F5F5F5] dark:bg-[#0A0A0A] text-[#141414] dark:text-[#E4E3E0] transition-colors">
      <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-4 pb-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Tasks</h2>
          <div className="flex items-center bg-white dark:bg-[#141414] border border-black/5 dark:border-white/5 rounded-xl overflow-hidden">
            <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"><ChevronLeft size={16} /></button>
            <div className="px-3 text-center min-w-[100px]">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{isToday ? 'Today' : format(selectedDate, 'EEEE')}</p>
              <p className="font-bold text-xs">{format(selectedDate, 'MMM d')}</p>
            </div>
            <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"><ChevronRight size={16} /></button>
          </div>
        </div>

        {/* Quick date chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {quickDates.map(({ date, label }) => (
            <button key={label} onClick={() => setSelectedDate(date)}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all border",
                isSameDay(date, selectedDate)
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                  : "bg-white dark:bg-[#141414] text-gray-500 border-black/5 dark:border-white/5 hover:border-emerald-500/30")}>
              {label}
            </button>
          ))}
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="bg-white dark:bg-[#141414] border border-black/5 dark:border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{completedCount}/{total} done</span>
              <span className="text-sm font-black text-emerald-500">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div className="h-full bg-emerald-500 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
            </div>
          </div>
        )}

        {/* Add task */}
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input value={newTaskName} onChange={e => setNewTaskName(e.target.value)} placeholder="Add a task..." 
            className="flex-1 bg-white dark:bg-[#141414] border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-0 transition-all" />
          <button type="submit" className="flex items-center gap-1.5 px-4 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors flex-shrink-0 shadow-lg shadow-emerald-500/20">
            <Plus size={16} />
          </button>
        </form>

        {/* Task list */}
        <div className="space-y-2">
          <AnimatePresence>
            {filteredTasks.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 opacity-30">
                <div className="text-4xl mb-3">📋</div>
                <p className="font-bold uppercase tracking-widest text-sm">No tasks for this day</p>
              </motion.div>
            ) : (
              filteredTasks.map(task => (
                <motion.div key={task.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                  className={cn("flex items-center gap-3 p-4 bg-white dark:bg-[#141414] border rounded-2xl group transition-all",
                    task.completed ? "border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-500/5" : "border-black/5 dark:border-white/5")}>
                  <button onClick={() => toggleTask(task.id)}
                    className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all",
                      task.completed ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20" : "border-gray-200 dark:border-white/20 hover:border-emerald-500")}>
                    {task.completed && <Check size={13} />}
                  </button>
                  <span className={cn("flex-1 text-sm font-medium min-w-0", task.completed && "line-through text-gray-400 dark:text-gray-600")}>
                    {task.name}
                  </span>
                  <button onClick={() => deleteTask(task.id)} className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
