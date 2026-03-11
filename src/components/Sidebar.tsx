import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, CheckSquare, ListTodo, Bot, Settings, Shield, Sun, Moon, LogOut, Zap, Bell } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

// Ninja fight canvas for sidebar
const SidebarNinja: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width = 288;
    const H = canvas.height = 120;
    const ground = H - 18;

    const particles: any[] = [];
    function spawnP(x: number, y: number, color: string) {
      for (let i = 0; i < 5; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 1.5 + Math.random() * 3;
        particles.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s-1.5, life: 1, decay: 0.06+Math.random()*0.04, size: 1.5+Math.random()*2, color });
      }
    }

    function drawF(x: number, y: number, right: boolean, state: string, frame: number, hb: string) {
      ctx.save();
      ctx.translate(x, y);
      if (!right) ctx.scale(-1, 1);
      const t = frame * 0.15;
      let fL=0.2, bL=-0.2, fA=-0.3, bA=0.4, lean=0, kb=0;
      if (state==='run') { const s=Math.sin(t*2); fL=s*0.6; bL=-s*0.6; fA=-s*0.45; bA=s*0.45; lean=0.15; kb=Math.abs(s)*0.3; }
      else if (state==='attack1') { fA=-1.4; bA=0.7; fL=0.3; lean=0.3; }
      else if (state==='attack2') { fL=-1.2; bL=-0.1; fA=-0.8; lean=0.2; }
      else if (state==='attack3') { fA=-1.7+Math.sin(t*4)*0.3; lean=0.3; }
      else if (state==='jump') { fL=-0.4; bL=0.4; fA=-0.9; kb=0.4; }
      const sc='rgba(20,20,30,0.95)', hR=8, bH=22, lH=24, aL=16;
      const shY=-bH-hR*2+2, hipY=-lH+2, bx=Math.sin(lean)*3;
      ctx.strokeStyle=sc; ctx.fillStyle=sc; ctx.lineWidth=2.5; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.shadowBlur=6; ctx.shadowColor='rgba(0,0,0,0.4)';
      ctx.globalAlpha=0.4;
      ctx.beginPath(); ctx.moveTo(0,hipY); ctx.lineTo(Math.sin(bL)*lH*0.5, hipY+Math.cos(Math.abs(bL))*lH*0.5+kb*7); ctx.lineTo(Math.sin(bL)*lH*0.45+Math.sin(bL+kb)*lH*0.45, hipY+lH*0.5+kb*7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,shY); const baex=Math.sin(bA)*aL*0.5, baey=shY+Math.cos(Math.abs(bA))*aL*0.5; ctx.lineTo(baex,baey); ctx.lineTo(baex+Math.sin(bA*0.7)*aL*0.5, baey+aL*0.45); ctx.stroke();
      ctx.globalAlpha=1;
      ctx.beginPath(); ctx.moveTo(0,hipY); ctx.lineTo(bx,shY); ctx.stroke();
      ctx.beginPath(); ctx.arc(bx,shY-hR,hR,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(bx,shY-hR,hR+1,Math.PI*0.75,Math.PI*0.25); ctx.strokeStyle=hb; ctx.lineWidth=2.5; ctx.shadowColor=hb; ctx.shadowBlur=10; ctx.stroke();
      ctx.strokeStyle=sc; ctx.shadowColor='rgba(0,0,0,0.4)'; ctx.shadowBlur=6; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.moveTo(0,hipY); const fkx=Math.sin(fL)*lH*0.5, fky=hipY+Math.cos(Math.abs(fL))*lH*0.5+kb*6; ctx.lineTo(fkx,fky); ctx.lineTo(fkx+Math.sin(fL+kb*0.5)*lH*0.45, fky+lH*0.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx,shY); const faex=bx+Math.sin(fA)*aL*0.5, faey=shY+Math.cos(Math.abs(fA))*aL*0.5; ctx.lineTo(faex,faey); const fahx=faex+Math.sin(fA*0.8)*aL*0.5, fahy=faey+aL*0.5; ctx.lineTo(fahx,fahy); ctx.stroke();
      if (state.startsWith('attack')||state==='run') {
        const sa=fA-0.3;
        ctx.beginPath(); ctx.moveTo(fahx,fahy); ctx.lineTo(fahx+Math.sin(sa)*28, fahy-Math.cos(sa)*12);
        ctx.strokeStyle=hb.replace('0.9','0.7'); ctx.shadowColor=hb; ctx.shadowBlur=14; ctx.lineWidth=1.5; ctx.stroke();
        if(state==='attack1'||state==='attack3'){ctx.beginPath();ctx.moveTo(fahx,fahy);ctx.lineTo(fahx+Math.sin(sa+0.5)*22,fahy-Math.cos(sa+0.5)*9);ctx.strokeStyle=hb.replace('0.9','0.18');ctx.lineWidth=6;ctx.stroke();}
      }
      ctx.restore();
    }

    type F = {x:number;y:number;vy:number;state:string;timer:number;frame:number;right:boolean;hb:string;};
    const fs: F[] = [
      {x:72, y:ground, vy:0, state:'idle', timer:60, frame:0, right:true, hb:'rgba(100,180,255,0.9)'},
      {x:216, y:ground, vy:0, state:'idle', timer:80, frame:0, right:false, hb:'rgba(255,80,80,0.9)'}
    ];

    function update(f: F, o: F) {
      f.frame++; f.timer--;
      if (f.y < ground) { f.vy += 0.9; f.y += f.vy; if(f.y>=ground){f.y=ground;f.vy=0;if(f.state==='jump')f.state='idle';} }
      if (f.timer > 0) return;
      const dist = Math.abs(f.x-o.x); const r=Math.random();
      if (dist < 90) {
        if(r<0.4){f.state='attack1';f.timer=18;spawnP((f.x+o.x)/2,ground-42,f.hb);}
        else if(r<0.7){f.state='attack2';f.timer=22;}
        else{f.state='attack3';f.timer=24;spawnP((f.x+o.x)/2,ground-42,f.hb);}
      } else if (dist<160) {
        if(r<0.35){f.state='jump';f.timer=28;f.vy=-13;}
        else{f.state='attack1';f.timer=18;}
      } else {
        f.state='run'; f.timer=16;
        f.x += f.right ? 20 : -20;
        f.x = Math.max(30, Math.min(258, f.x));
      }
    }

    let animId: number;
    function loop() {
      ctx.clearRect(0,0,W,H);
      // Subtle bg
      ctx.fillStyle='rgba(8,8,12,0)'; ctx.fillRect(0,0,W,H);
      // Ground line
      ctx.fillStyle='rgba(255,255,255,0.05)'; ctx.fillRect(0,ground+1,W,1);

      fs.forEach((f,i) => update(f, fs[1-i]));

      // Shadows
      fs.forEach(f => {
        ctx.save(); ctx.globalAlpha=0.2; ctx.fillStyle='rgba(0,0,0,0.5)';
        ctx.beginPath(); ctx.ellipse(f.x,ground+2,18,4,0,0,Math.PI*2); ctx.fill(); ctx.restore();
      });

      drawF(fs[0].x,fs[0].y,true,fs[0].state,fs[0].frame,fs[0].hb);
      drawF(fs[1].x,fs[1].y,false,fs[1].state,fs[1].frame,fs[1].hb);

      for(let i=particles.length-1;i>=0;i--){
        const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=0.2; p.life-=p.decay;
        if(p.life<=0){particles.splice(i,1);continue;}
        ctx.save(); ctx.globalAlpha=p.life; ctx.fillStyle=p.color; ctx.shadowColor=p.color; ctx.shadowBlur=5;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size*p.life,0,Math.PI*2); ctx.fill(); ctx.restore();
      }
      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} width={288} height={120} className="w-full opacity-70" />;
};

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
        {/* Ninja fight animation */}
        <div className="rounded-2xl overflow-hidden border border-white/5 bg-black/30">
          <SidebarNinja />
        </div>
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
