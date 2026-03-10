import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Save, Bot, Shield, Zap, User, MessageSquare, Volume2, Cpu, Upload, Wand2, Loader2, Image as ImageIcon, Download, FileJson, Trash2, AlertTriangle, Sparkles, Lock, Star, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";

export const Settings: React.FC = () => {
  const { aiSettings, updateAISettings, userProfile, updateUserProfile, habits, tasks, aiMemory, importData, resetData, forceSave } = useAppContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleForceSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await forceSave();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Save failed', e);
    } finally {
      setIsSaving(false);
    }
  };

  const personas = [
    { id: 'Coach', name: 'Coach', locked: false },
    { id: 'Teacher', name: 'Teacher', locked: false },
    { id: 'Trainer', name: 'Trainer', locked: false },
    { id: 'Partner', name: 'Partner', locked: false },
    { id: 'Friend', name: 'Friend', locked: false },
    { id: 'Wife', name: 'Wife', locked: false },
    { id: 'Girlfriend', name: 'Girlfriend', locked: false },
  ];
  const models = [
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', speed: 'Fastest', desc: 'Lowest quota, best for quick chats', locked: false },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', speed: 'Balanced', desc: 'Fast and smart, recommended default', locked: false },
    { id: 'gemini-2.5-pro-preview-03-25', name: 'Gemini 2.5 Pro', speed: 'Smartest', desc: 'Most powerful, uses more quota', locked: false },
  ];
  const voices = ['Puck', 'Kore', 'Zephyr'];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      updateAISettings({ avatar: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAvatar = async () => {
    if (!aiSettings.apiKey) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: aiSettings.apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ 
            text: `Generate a square avatar image for an AI assistant. 
                   Name: ${aiSettings.name}. 
                   Persona: ${aiSettings.persona}. 
                   Style: Professional, digital art, clean background.` 
          }]
        }
      });

      // Find image part
      let imageUrl = '';
      const candidate = response.candidates?.[0];
      if (candidate && candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (imageUrl) {
        updateAISettings({ avatar: imageUrl });
      }
    } catch (error) {
      console.error("Avatar generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-[#F5F5F5] dark:bg-[#0A0A0A] text-[#141414] dark:text-[#E4E3E0] transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Settings</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Customize your Elevate experience and AI agent.</p>
        </header>

        <div className="space-y-6 md:space-y-8">
          {/* API Configuration */}
          <section className="bg-white dark:bg-[#141414] p-6 md:p-8 rounded-3xl shadow-sm border border-black/5 dark:border-white/5 transition-colors">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="text-emerald-500" size={24} />
              <h3 className="text-xl font-bold">API Configuration</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Gemini API Key</label>
                <input
                  type="password"
                  value={aiSettings.apiKey || ''}
                  onChange={(e) => updateAISettings({ apiKey: e.target.value })}
                  placeholder="Enter your Google Gemini API Key"
                  className="w-full h-12 px-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm transition-all"
                />
                <p className="mt-2 text-[10px] text-gray-400">Your key is stored locally in your browser. Never share it.</p>
              </div>
            </div>
          </section>

          {/* User Profile */}
          <section className="bg-white dark:bg-[#141414] p-6 md:p-8 rounded-3xl shadow-sm border border-black/5 dark:border-white/5 transition-colors">
            <div className="flex items-center space-x-3 mb-6">
              <User className="text-emerald-500" size={24} />
              <h3 className="text-xl font-bold">Your Profile</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Your Name</label>
                <input
                  type="text"
                  value={userProfile?.name || ''}
                  onChange={(e) => updateUserProfile({ name: e.target.value })}
                  className="w-full h-12 px-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Your Photo</label>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm shrink-0">
                    {userProfile?.avatar ? (
                      <img src={userProfile.avatar} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <User className="text-gray-400" size={24} />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center space-x-2">
                      <Upload size={16} />
                      <span>Upload</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            updateUserProfile({ avatar: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }} 
                      />
                    </label>
                    {userProfile?.avatar && (
                      <button
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = userProfile.avatar;
                          a.download = 'user-photo.png';
                          a.click();
                        }}
                        className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 p-2 rounded-xl transition-all"
                        title="Download Photo"
                      >
                        <Download size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Off Days</label>
                <div className="flex flex-wrap gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                    <button
                      key={day}
                      onClick={() => {
                        const newOffDays = userProfile.offDays.includes(i)
                          ? userProfile.offDays.filter(d => d !== i)
                          : [...userProfile.offDays, i];
                        updateUserProfile({ offDays: newOffDays });
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                        userProfile.offDays.includes(i)
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">About You</label>
                <textarea
                  value={userProfile?.about || ''}
                  onChange={(e) => updateUserProfile({ about: e.target.value })}
                  rows={3}
                  className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium resize-none transition-all"
                  placeholder="Tell the AI about yourself..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Your Goals</label>
                <textarea
                  value={userProfile?.goals || ''}
                  onChange={(e) => updateUserProfile({ goals: e.target.value })}
                  rows={3}
                  className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium resize-none transition-all"
                  placeholder="What do you want to achieve?"
                />
              </div>
            </div>
          </section>

          {/* AI Identity */}
          <section className="bg-white dark:bg-[#141414] p-6 md:p-8 rounded-3xl shadow-sm border border-black/5 dark:border-white/5 transition-colors">
            <div className="flex items-center space-x-3 mb-6">
              <Bot className="text-emerald-500" size={24} />
              <h3 className="text-xl font-bold">AI Identity</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center">
                  Agent Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={aiSettings.name || ''}
                    onChange={(e) => updateAISettings({ name: e.target.value })}
                    className="w-full h-12 pl-10 pr-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium transition-all"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center">
                  Avatar
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm shrink-0">
                      {aiSettings.avatar ? (
                        <img src={aiSettings.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Bot className="text-gray-400" size={32} />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex space-x-2">
                        <label className="flex-1 cursor-pointer bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center space-x-2">
                          <Upload size={16} />
                          <span>Upload</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </label>
                        <button 
                          onClick={() => handleGenerateAvatar()}
                          disabled={isGenerating || !aiSettings.apiKey}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                          <span>Generate</span>
                        </button>
                        {aiSettings.avatar && (
                          <button
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = aiSettings.avatar;
                              a.download = `${aiSettings.name}-avatar.png`;
                              a.click();
                            }}
                            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 p-2 rounded-xl transition-all"
                            title="Download Avatar"
                          >
                            <Download size={16} />
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={aiSettings.avatar || ''}
                          onChange={(e) => updateAISettings({ avatar: e.target.value })}
                          placeholder="Or paste image URL..."
                          className="w-full h-10 pl-9 pr-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-[10px] font-medium transition-all"
                        />
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Persona</label>
                <div className="relative">
                  <select
                    value={aiSettings.persona || 'Coach'}
                    onChange={(e) => {
                      updateAISettings({ persona: e.target.value });
                    }}
                    className="w-full h-12 pl-10 pr-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium appearance-none transition-all"
                  >
                    {personas.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <Zap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center">
                Behavior & Tags
              </label>
              <div className="relative">
                <textarea
                  value={aiSettings.behavior || ''}
                  onChange={(e) => updateAISettings({ behavior: e.target.value })}
                  rows={3}
                  className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium resize-none transition-all"
                  placeholder="e.g. Motivating, strict, uses emojis, focuses on discipline..."
                />
                <MessageSquare className="absolute right-4 bottom-4 text-gray-300 dark:text-gray-700" size={18} />
              </div>
            </div>
          </section>

          {/* Model & Voice */}
          <section className="bg-white dark:bg-[#141414] p-6 md:p-8 rounded-3xl shadow-sm border border-black/5 dark:border-white/5 transition-colors">
            <div className="flex items-center space-x-3 mb-6">
              <Cpu className="text-emerald-500" size={24} />
              <h3 className="text-xl font-bold">Model & Voice</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Gemini Model</label>
                <div className="space-y-3">
                  {models.map(model => (
                    <button
                      key={model.id}
                      onClick={() => {
                        updateAISettings({ model: model.id });
                      }}
                      className={cn(
                        "w-full p-4 rounded-2xl border text-left transition-all relative overflow-hidden",
                        aiSettings.model === model.id 
                          ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 shadow-sm" 
                          : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/30"
                      )}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">{model.name}</span>
                        </div>
                        <span className={cn(
                          "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                          model.speed === 'Fastest' ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600" : "bg-blue-100 dark:bg-blue-500/20 text-blue-600"
                        )}>
                          {model.speed}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{model.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Voice Profile</label>
                <div className="grid grid-cols-2 gap-3">
                  {voices.map(voice => (
                    <button
                      key={voice}
                      onClick={() => updateAISettings({ voice })}
                      className={cn(
                        "p-4 rounded-2xl border flex flex-col items-center space-y-2 transition-all",
                        aiSettings.voice === voice 
                          ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 shadow-sm" 
                          : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/30"
                      )}
                    >
                      <Volume2 size={24} className={aiSettings.voice === voice ? "text-emerald-500" : "text-gray-400"} />
                      <span className="font-bold text-xs">{voice}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Data Management */}
          <section className="bg-white dark:bg-[#141414] p-6 md:p-8 rounded-3xl shadow-sm border border-black/5 dark:border-white/5 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <FileJson className="text-emerald-500" size={24} />
                <h3 className="text-xl font-bold">Data Management</h3>
              </div>
              <button
                onClick={handleForceSave}
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  saveSuccess
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                } disabled:opacity-50`}
              >
                {isSaving ? (
                  <><Loader2 size={14} className="animate-spin" /> Saving...</>
                ) : saveSuccess ? (
                  <><Save size={14} /> Saved ✓</>
                ) : (
                  <><Save size={14} /> Sync to Cloud</>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">Data auto-saves every second. Use "Sync to Cloud" if changes aren't appearing on another device.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              <button
                onClick={() => {
                  const data = { habits, tasks, aiMemory, aiSettings, userProfile };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `elevate-backup-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group"
              >
                <Download className="text-gray-400 group-hover:text-emerald-500 mb-3 transition-colors" size={32} />
                <span className="font-bold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest">Export</span>
              </button>

              <label className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer group">
                <Upload className="text-gray-400 group-hover:text-blue-500 mb-3 transition-colors" size={32} />
                <span className="font-bold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest">Import</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const data = JSON.parse(event.target?.result as string);
                        importData(data);
                      } catch (err) {
                        alert('Invalid backup file');
                      }
                    };
                    reader.readAsText(file);
                  }}
                />
              </label>

              <button
                onClick={resetData}
                className="flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors group"
              >
                <AlertTriangle className="text-red-400 group-hover:text-red-600 mb-3 transition-colors" size={32} />
                <span className="font-bold text-xs text-red-700 dark:text-red-400 uppercase tracking-widest">Reset</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
