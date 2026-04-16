import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { HabitGrid } from './components/HabitGrid';
import { TaskBoard } from './components/TaskBoard';
import { AIInterface } from './components/AIInterface';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { Admin } from './components/Admin';
import { Onboarding } from './components/Onboarding';
import { Notepad } from './components/Notepad';
import { LayoutDashboard, CheckSquare, ListTodo, Bot, Settings as SI, BookOpen } from 'lucide-react';
import { cn } from './lib/utils';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, userProfile, activeTab, setActiveTab } = useAppContext();
  const [splash, setSplash] = useState(true);
  const [onboard, setOnboard] = useState(false);

  useEffect(() => { const t = setTimeout(() => setSplash(false), 1400); return () => clearTimeout(t); }, []);
  useEffect(() => { if (!isLoading && isAuthenticated && userProfile && !userProfile.name) setOnboard(true); }, [isLoading, isAuthenticated, userProfile]);

  if (splash || isLoading) return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 animate-pulse">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      </div>
      <h1 className="text-3xl font-bold text-white font-display">Elevate</h1>
      <p className="text-sm text-gray-600 mt-2">Loading...</p>
    </div>
  );
  if (!isAuthenticated) return <Login />;
  if (onboard) return <Onboarding onComplete={() => setOnboard(false)} />;

  const tabs: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />, habits: <HabitGrid />, tasks: <TaskBoard />,
    ai: <AIInterface />, notes: <Notepad />, settings: <Settings />, admin: <Admin />,
  };

  const nav = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'habits', icon: CheckSquare, label: 'Habits' },
    { id: 'tasks', icon: ListTodo, label: 'Tasks' },
    { id: 'ai', icon: Bot, label: 'AI' },
    { id: 'notes', icon: BookOpen, label: 'Notes' },
    { id: 'settings', icon: SI, label: 'More' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a]">
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <main className="flex-1 overflow-hidden pb-16 md:pb-0">
        {tabs[activeTab] || tabs['dashboard']}
      </main>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-white/5 flex z-50">
        {nav.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={cn('flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors', activeTab === t.id ? 'text-emerald-400' : 'text-gray-700')}>
            <t.icon size={18} />
            <span className="text-[9px] font-bold uppercase tracking-widest">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return <AppProvider><AppContent /></AppProvider>;
}
