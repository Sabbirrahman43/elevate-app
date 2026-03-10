import React, { useState } from 'react';
import { LayoutDashboard, CheckSquare, ListTodo, Bot, Settings, Shield, Sun, Moon, LogOut, Zap, Bell } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { userProfile, theme, setTheme, logout, markNotificationsRead } = useAppContext();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = userProfile?.notifications?.filter(n => !n.read).length || 0;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'habits', label: 'Habits', icon: CheckSquare },
    { id: 'tasks', label: 'Daily Tasks', icon: ListTodo },
    { id: 'ai', label: 'Intelligence', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Add Admin tab if user is the admin
  if (userProfile?.email === 'prantorahman6900@gmail.com') {
    tabs.push({ id: 'admin', label: 'Admin Control', icon: Shield });
  }

  return (
    <div className="w-72 bg-[#141414] dark:bg-[#050505] text-[#E4E3E0] h-full flex flex-col border-r border-white/10 transition-colors duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tighter text-white">Elevate<span className="text-emerald-500">.</span></h1>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center space-x-2 p-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-gray-400 hover:text-white border border-white/5"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span className="text-[10px] font-bold uppercase tracking-widest">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-gray-400 hover:text-white border border-white/5"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
        
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-4 right-4 top-24 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl z-50 p-4 max-h-[300px] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Notifications</h4>
                <button 
                  onClick={markNotificationsRead}
                  className="text-[8px] font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400"
                >
                  Mark all read
                </button>
              </div>
              <div className="space-y-3">
                {userProfile?.notifications?.length === 0 ? (
                  <p className="text-[10px] text-gray-500 text-center py-4">No notifications</p>
                ) : (
                  userProfile.notifications.map(n => (
                    <div key={n.id} className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-xs font-bold text-white mb-1">{n.title}</p>
                      <p className="text-[10px] text-gray-400 leading-relaxed">{n.message}</p>
                      <p className="text-[8px] text-gray-600 mt-2">{new Date(n.date).toLocaleDateString()}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-400 uppercase tracking-widest">Progress Tracker</p>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-6 border-t border-white/10 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-lg shadow-emerald-900/20">
            {userProfile?.avatar ? (
              <img src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span>{userProfile?.name?.charAt(0).toUpperCase() || 'U'}</span>
            )}
          </div>
          <div className="text-sm overflow-hidden flex-1">
            <p className="font-medium text-white truncate">{userProfile?.name || 'User'}</p>
            <p className="text-[10px] text-gray-400 truncate">{userProfile?.email || 'Operative'}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
        <div className="pt-2 border-t border-white/5">
          <a 
            href="https://www.instagram.com/pranto_raman/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-emerald-500 transition-colors group"
          >
            <span>Developed by</span>
            <span className="text-gray-400 group-hover:text-emerald-400">@pranto_raman</span>
          </a>
        </div>
      </div>
    </div>
  );
};
