import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Trash2, FileText, X, ChevronRight, Shield, RefreshCw, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export const Admin: React.FC = () => {
  const { getAllUsers } = useAppContext();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); const u = await getAllUsers(); setUsers(u); setLoading(false); };
  return (
    <div className="h-full overflow-y-auto bg-[#0a0a0a] text-white p-6 no-scrollbar">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3"><Shield size={20} className="text-emerald-400" /><h1 className="text-2xl font-bold font-display">Admin</h1></div>
          <button onClick={load} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Load Users
          </button>
        </div>
        <div className="space-y-3">
          {users.length === 0 && !loading && <p className="text-gray-600 text-center py-12 text-sm">Click Load Users</p>}
          {users.map((u, i) => (
            <div key={i} className="bg-[#111] border border-white/5 rounded-2xl p-4">
              <p className="text-sm font-semibold text-white font-mono">{u.id}</p>
              <p className="text-xs text-gray-500 mt-1">{u.data?.userProfile?.name || 'No name'} - {u.data?.userProfile?.email || 'No email'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};