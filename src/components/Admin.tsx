import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Shield, Search, XCircle, Globe, Save, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Admin: React.FC = () => {
  const { userProfile, getAllUsers } = useAppContext();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = () => {
    try {
      setUsers(getAllUsers());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (userProfile?.email !== 'prantorahman6900@gmail.com') {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <XCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-500">You do not have administrative privileges to view this page.</p>
          <p className="text-xs text-gray-400 mt-2">Current user: {userProfile?.email}</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-[#F5F5F5] dark:bg-[#0A0A0A] text-[#141414] dark:text-[#E4E3E0] transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 md:mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Admin Control</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Manage your users and system health.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex-1 lg:max-w-xs">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">System Info</p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 leading-tight">
                You can monitor user activity and system usage from this panel. 
                Subscription features have been disabled as per current requirements.
              </p>
            </div>
            <div className="flex items-center space-x-4 shrink-0">
              <div className="bg-white dark:bg-[#141414] px-6 py-3 rounded-2xl shadow-sm border border-black/5 dark:border-white/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Users</p>
                <p className="text-xl font-bold">{users.length}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="bg-white dark:bg-[#141414] rounded-[32px] shadow-sm border border-black/5 dark:border-white/5 overflow-hidden transition-colors mb-8">
          <div className="p-6 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="text-blue-500" size={24} />
              <h3 className="text-xl font-bold">Google Cloud Integration</h3>
            </div>
            <p className="text-xs text-gray-500 mb-6">
              Configure your Google OAuth credentials here. These are stored securely on the server and are only accessible by you.
            </p>
            <GoogleConfigForm />
          </div>
        </div>

        <div className="bg-white dark:bg-[#141414] rounded-[32px] shadow-sm border border-black/5 dark:border-white/5 overflow-hidden transition-colors">
          <div className="p-6 border-b border-black/5 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full h-12 pl-10 pr-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={fetchUsers} className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                <Users size={18} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase font-bold tracking-widest text-gray-400 bg-gray-50 dark:bg-white/5 border-b border-black/5 dark:border-white/5">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {loading ? (
                  <tr><td colSpan={2} className="px-6 py-12 text-center text-gray-400">Loading users...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={2} className="px-6 py-12 text-center text-gray-400">No users found.</td></tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs">{user.messageCount} msgs</p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const GoogleConfigForm = () => {
  return (
    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-2xl">
      <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">Server-Side Feature</p>
      <p className="text-xs text-amber-600 dark:text-amber-500">
        Google OAuth configuration requires a backend server. This app is currently running in local storage mode,
        which works fully without a server. Email &amp; password login is available and fully functional.
      </p>
    </div>
  );
};
