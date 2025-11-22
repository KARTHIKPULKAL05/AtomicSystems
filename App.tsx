import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Plus, BookOpen } from './components/Icons';
import Dashboard from './components/Dashboard';
import SystemBuilder from './components/SystemBuilder';
import LearnSection from './components/LearnSection';
import { SystemPlan, AppView } from './types';

function App() {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [systems, setSystems] = useState<SystemPlan[]>([]);
  const [editingSystem, setEditingSystem] = useState<SystemPlan | undefined>(undefined);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('atomic_systems');
    if (saved) {
      try {
        setSystems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved systems");
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('atomic_systems', JSON.stringify(systems));
  }, [systems]);

  const handleSaveSystem = (newSystem: SystemPlan) => {
    if (editingSystem) {
      // Update existing system
      setSystems(systems.map(s => s.id === newSystem.id ? newSystem : s));
      setEditingSystem(undefined);
    } else {
      // Add new system
      setSystems([...systems, newSystem]);
    }
    setView(AppView.DASHBOARD);
  };

  const handleEditSystem = (system: SystemPlan) => {
    setEditingSystem(system);
    setView(AppView.BUILDER);
  };

  const handleNewSystem = () => {
    setEditingSystem(undefined);
    setView(AppView.BUILDER);
  };

  const handleCancelSystem = () => {
    setEditingSystem(undefined);
    setView(AppView.DASHBOARD);
  };

  const handleDeleteSystem = (id: string) => {
    setSystems(systems.filter(s => s.id !== id));
  };

  const handleToggleToday = (id: string) => {
    setSystems(systems.map(sys => {
      if (sys.id !== id) return sys;

      const now = new Date().toISOString();
      const todayDate = now.split('T')[0];
      
      // Prevent double logging for same day
      if (sys.lastCompleted && sys.lastCompleted.split('T')[0] === todayDate) {
        return sys;
      }

      const newStreak = sys.streak + 1;
      const newHistory = [...sys.history, now];

      return {
        ...sys,
        lastCompleted: now,
        streak: newStreak,
        history: newHistory
      };
    }));
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-brand-100">
      
      {/* Header */}
      <header className="bg-white border-b-2 border-slate-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView(AppView.DASHBOARD)}>
             {/* Logo Icon */}
             <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white shadow-[0_4px_0_rgb(3,105,161)] border-b-4 border-brand-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </div>
            <h1 className="font-extrabold text-2xl text-slate-700 tracking-tight hidden sm:block">Atomic<span className="text-brand-500">Systems</span></h1>
          </div>

          <nav className="flex gap-2">
            <button 
              onClick={() => setView(AppView.DASHBOARD)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all border-b-4 active:border-b-0 active:translate-y-1
                ${view === AppView.DASHBOARD 
                  ? 'bg-brand-50 text-brand-500 border-brand-200' 
                  : 'text-slate-400 border-transparent hover:bg-slate-50 hover:text-slate-600'
                }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button 
              onClick={() => setView(AppView.LEARN)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all border-b-4 active:border-b-0 active:translate-y-1
                ${view === AppView.LEARN 
                  ? 'bg-brand-50 text-brand-500 border-brand-200' 
                  : 'text-slate-400 border-transparent hover:bg-slate-50 hover:text-slate-600'
                }`}
            >
              <BookOpen className="w-5 h-5" />
               <span className="hidden sm:inline">Guide</span>
            </button>
            <button 
              onClick={handleNewSystem}
              className={`ml-2 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all border-b-4 active:border-b-0 active:translate-y-1
                 ${view === AppView.BUILDER 
                  ? 'bg-slate-800 text-white border-slate-900' 
                  : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200 hover:text-slate-600'
                }`}
            >
              <Plus className="w-5 h-5" />
               <span className="hidden sm:inline">Create</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-80px)]">
        {view === AppView.DASHBOARD && (
          <Dashboard 
            systems={systems} 
            onDelete={handleDeleteSystem} 
            onToggleToday={handleToggleToday}
            onNewSystem={handleNewSystem}
            onEdit={handleEditSystem}
          />
        )}
        
        {view === AppView.BUILDER && (
          <SystemBuilder 
            onSave={handleSaveSystem} 
            onCancel={handleCancelSystem}
            initialSystem={editingSystem}
          />
        )}

        {view === AppView.LEARN && (
          <LearnSection />
        )}
      </main>

    </div>
  );
}

export default App;