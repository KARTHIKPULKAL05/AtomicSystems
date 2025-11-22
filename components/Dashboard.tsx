import React, { useState, useMemo } from 'react';
import { SystemPlan } from '../types';
import { Check, Plus, Trash2, Flame, RefreshCw, List, Grid, Edit, TrendingUp, Calendar, Download } from './Icons';

interface DashboardProps {
  systems: SystemPlan[];
  onDelete: (id: string) => void;
  onToggleToday: (id: string) => void;
  onNewSystem: () => void;
  onEdit: (system: SystemPlan) => void;
}

type ViewMode = 'grid' | 'table' | 'stats' | 'tracker';

const Dashboard: React.FC<DashboardProps> = ({ systems, onDelete, onToggleToday, onNewSystem, onEdit }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [systemToDelete, setSystemToDelete] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const isCompletedToday = (system: SystemPlan) => {
    if (!system.lastCompleted) return false;
    const today = new Date().toISOString().split('T')[0];
    const last = system.lastCompleted.split('T')[0];
    return today === last;
  };

  // Streak Goal Logic
  const getNextMilestone = (streak: number) => {
    const milestones = [3, 7, 14, 21, 30, 50, 100, 365];
    for (const m of milestones) {
      if (streak < m) return m;
    }
    return streak + 50;
  };

  // Helper to get the current week's dates (Mon-Sun)
  const getWeekDays = () => {
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(today.setDate(diff));
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const weekDays = getWeekDays();

  // Handle Delete Confirmation
  const handleDeleteClick = (id: string) => {
    setSystemToDelete(id);
  };

  const confirmDelete = () => {
    if (systemToDelete) {
      onDelete(systemToDelete);
      setSystemToDelete(null);
    }
  };

  // Render the 7-day week bubbles
  const renderWeekTracker = (system: SystemPlan) => {
    const todayStr = new Date().toISOString().split('T')[0];

    return (
      <div className="flex justify-between w-full max-w-[300px] mx-auto sm:mx-0 gap-1">
        {weekDays.map((date, i) => {
          const dateStr = date.toISOString().split('T')[0];
          const isDone = system.history.some(h => h.split('T')[0] === dateStr);
          const isToday = dateStr === todayStr;
          const dayLabel = date.toLocaleDateString('en-US', { weekday: 'narrow' });

          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-brand-600' : 'text-slate-400'}`}>
                {dayLabel}
              </span>
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                  ${isDone 
                    ? 'bg-brand-action border-brand-action text-white shadow-sm' 
                    : isToday
                      ? 'border-brand-400 bg-brand-50 text-slate-300 border-dashed'
                      : 'border-slate-200 bg-slate-50 text-transparent'
                  }
                `}
              >
                {isDone && <Check className="w-5 h-5" />}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // --- MARKDOWN EXPORT LOGIC ---
  const handleCopyToMarkdown = () => {
    const today = new Date();
    const last7Days = [];
    // Generate header for last 7 days reversed
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      last7Days.push(d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }));
    }

    // Build Table
    let md = `| Habit | Current Streak | ${last7Days.join(' | ')} |\n`;
    md += `|:---|:---:|${last7Days.map(() => ':---:').join('|')}|\n`;

    systems.forEach(sys => {
       const row = [];
       for (let i = 6; i >= 0; i--) {
         const d = new Date();
         d.setDate(today.getDate() - i);
         const dateStr = d.toISOString().split('T')[0];
         const done = sys.history.some(h => h.startsWith(dateStr));
         row.push(done ? "✅" : " ");
       }
       md += `| ${sys.microAction} | ${sys.streak} 🔥 | ${row.join(' | ')} |\n`;
    });

    navigator.clipboard.writeText(md);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // --- ANALYTICS GRAPH COMPONENT ---
  const ConsistencyGraph: React.FC<{ system: SystemPlan }> = ({ system }) => {
    const days = 30;
    const data = useMemo(() => {
      const result = [];
      const today = new Date();
      
      // Generate last 30 days
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        // Calculate Rolling 7-day Average Consistency for this specific date
        let completedInWindow = 0;
        for (let j = 0; j < 7; j++) {
           const windowDate = new Date(d);
           windowDate.setDate(d.getDate() - j);
           const wDateStr = windowDate.toISOString().split('T')[0];
           if (system.history.some(h => h.startsWith(wDateStr))) {
             completedInWindow++;
           }
        }
        const consistency = completedInWindow / 7; // 0 to 1
        result.push({ date: dateStr, value: consistency });
      }
      return result;
    }, [system.history]);

    // SVG Dimensions
    const width = 300;
    const height = 100;
    const padding = 5;

    // Generate Path
    const points = data.map((d, i) => {
      const x = (i / (days - 1)) * width;
      const y = height - (d.value * (height - padding * 2)) - padding; // Invert Y
      return `${x},${y}`;
    }).join(' ');

    // Generate Fill Path (close the loop at the bottom)
    const fillPoints = `${points} ${width},${height} 0,${height}`;

    const currentConsistency = Math.round(data[data.length - 1].value * 100);

    return (
      <div className="w-full">
        <div className="flex justify-between items-end mb-2 px-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">30-Day Trend</span>
          <span className={`text-sm font-extrabold ${currentConsistency >= 80 ? 'text-green-500' : currentConsistency >= 50 ? 'text-yellow-500' : 'text-slate-400'}`}>
            {currentConsistency}% Consistency
          </span>
        </div>
        <div className="w-full h-32 bg-slate-50 rounded-xl border border-slate-100 relative overflow-hidden group">
           <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-3d">
              {/* Gradient Definition */}
              <defs>
                <linearGradient id={`grad-${system.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />

              {/* The Area Fill */}
              <polygon points={fillPoints} fill={`url(#grad-${system.id})`} />

              {/* The Line */}
              <polyline 
                points={points} 
                fill="none" 
                stroke="#0ea5e9" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="drop-shadow-md"
              />

              {/* Last Point Dot */}
              <circle 
                cx={width} 
                cy={height - (data[data.length - 1].value * (height - padding * 2)) - padding} 
                r="4" 
                fill="#0ea5e9" 
                stroke="white" 
                strokeWidth="2" 
              />
           </svg>
        </div>
      </div>
    );
  };

  // Empty State
  if (systems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-100 p-8 rounded-full mb-6 animate-bounce">
          <RefreshCw className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-3">No Systems Yet</h2>
        <p className="text-slate-500 max-w-md mb-8 text-lg">
          "You do not rise to the level of your goals. You fall to the level of your systems."
        </p>
        <button 
          onClick={onNewSystem}
          className="btn-press px-8 py-4 bg-brand-500 text-white rounded-2xl font-bold text-lg border-brand-600 hover:bg-brand-400 transition-all flex items-center gap-3"
        >
          <Plus className="w-6 h-6" />
          Start Your First System
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 space-y-8 relative">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Systems</h2>
          <p className="text-slate-500 font-medium">Keep the streak alive!</p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl overflow-x-auto max-w-full">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
            title="Grid View"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setViewMode('tracker')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'tracker' ? 'bg-white shadow text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
            title="Tracker View"
          >
            <Calendar className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setViewMode('stats')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'stats' ? 'bg-white shadow text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
            title="Analytics View"
          >
            <TrendingUp className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* --- GRID VIEW (Duolingo Style) --- */}
      {viewMode === 'grid' && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
          {systems.map(system => {
            const completed = isCompletedToday(system);
            const nextMilestone = getNextMilestone(system.streak);
            const progressPercent = Math.min(100, (system.streak / nextMilestone) * 100);

            return (
              <div 
                key={system.id} 
                className={`
                  relative bg-white rounded-3xl p-6 border-2 border-slate-200 border-b-[6px] transition-all hover:-translate-y-1 group
                  ${completed ? 'border-green-200' : ''}
                `}
              >
                {/* Action Buttons (Delete/Edit) */}
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button 
                    onClick={() => onEdit(system)}
                    className="p-2 text-slate-300 hover:text-brand-500 transition-colors"
                    title="Edit System"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(system.id)}
                    className="p-2 text-slate-300 hover:text-red-400 transition-colors"
                    title="Delete System"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Header of Card */}
                <div className="flex justify-between items-start mb-6">
                   <div className="flex-1 pr-4">
                     <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-brand-600 text-xs font-extrabold uppercase tracking-wide mb-2">
                       <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                       Goal: {system.goal}
                     </div>
                     <h3 className="text-xl font-extrabold text-slate-800 leading-tight break-words">{system.microAction}</h3>
                     <p className="text-slate-500 text-sm mt-1 font-medium">Trigger: {system.cue}</p>
                   </div>

                   {/* Streak Badge & Goal */}
                   <div className="flex flex-col items-center gap-1 min-w-[60px]">
                     <div className={`flex items-center gap-1 ${system.streak > 0 ? 'text-orange-500' : 'text-slate-300'}`}>
                       <Flame className="w-6 h-6" />
                       <span className="font-black text-2xl">{system.streak}</span>
                     </div>
                     
                     {/* Mini Progress to next milestone */}
                     <div className="w-full">
                       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                         <div 
                            style={{ width: `${progressPercent}%` }} 
                            className={`h-full rounded-full transition-all duration-500 ${system.streak > 0 ? 'bg-orange-400' : 'bg-slate-300'}`} 
                         />
                       </div>
                       <p className="text-[10px] text-slate-400 text-center font-bold mt-1">Goal: {nextMilestone}</p>
                     </div>
                   </div>
                </div>

                {/* Week Tracker */}
                <div className="mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {renderWeekTracker(system)}
                </div>

                {/* Action Button */}
                <button 
                  onClick={() => onToggleToday(system.id)}
                  disabled={completed}
                  className={`
                    w-full btn-press py-4 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2 transition-all
                    ${completed 
                      ? 'bg-white text-brand-action border-2 border-slate-100 cursor-default shadow-none' 
                      : 'bg-brand-action text-white border-brand-actionShadow hover:bg-[#66e007]'
                    }
                  `}
                >
                  {completed ? (
                    <>
                      <Check className="w-6 h-6" />
                      Completed!
                    </>
                  ) : (
                    'Mark Complete'
                  )}
                </button>
              </div>
            );
          })}

          {/* Add New Card */}
          <button 
            onClick={onNewSystem}
            className="min-h-[300px] border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center text-slate-400 hover:text-brand-500 hover:border-brand-400 hover:bg-brand-50 transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-white flex items-center justify-center mb-4 transition-colors">
              <Plus className="w-8 h-8" />
            </div>
            <span className="font-bold text-lg">Add New System</span>
          </button>
        </div>
      )}

      {/* --- TRACKER VIEW (Minimal Matrix) --- */}
      {viewMode === 'tracker' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr>
                    <th className="p-4 w-64 border-b border-r border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider sticky left-0 z-10">
                      Habit
                    </th>
                    {Array.from({ length: 14 }).map((_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() - (13 - i));
                      const isToday = d.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                      return (
                        <th key={i} className={`p-2 text-center border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wider min-w-[40px] ${isToday ? 'text-brand-600' : 'text-slate-400'}`}>
                          <div className="flex flex-col">
                            <span>{d.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>
                            <span>{d.getDate()}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {systems.map(system => (
                    <tr key={system.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4 border-r border-slate-100 sticky left-0 bg-white group-hover:bg-slate-50/50 z-10">
                        <div className="font-bold text-slate-800 text-sm">{system.microAction}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[180px]">{system.goal}</div>
                      </td>
                      {Array.from({ length: 14 }).map((_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (13 - i));
                        const dateStr = d.toISOString().split('T')[0];
                        const isDone = system.history.some(h => h.startsWith(dateStr));
                        const isToday = dateStr === new Date().toISOString().split('T')[0];

                        return (
                          <td key={i} className="p-2 text-center">
                            <div className="flex items-center justify-center">
                              {isDone ? (
                                <div className="w-6 h-6 bg-green-500 rounded text-white flex items-center justify-center shadow-sm">
                                  <Check className="w-4 h-4" />
                                </div>
                              ) : isToday ? (
                                <button 
                                  onClick={() => onToggleToday(system.id)}
                                  className="w-6 h-6 border-2 border-slate-200 rounded hover:border-brand-500 hover:bg-brand-50 transition-colors"
                                />
                              ) : (
                                <div className="w-1.5 h-1.5 bg-slate-100 rounded-full" />
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex justify-end">
             <button 
              onClick={handleCopyToMarkdown}
              className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors px-4 py-2 rounded-lg hover:bg-slate-100"
            >
              {copySuccess ? (
                <span className="text-green-600 flex items-center gap-2">
                  <Check className="w-4 h-4" /> Copied Table!
                </span>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Copy as Markdown
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* --- TABLE VIEW (Notion Style) --- */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 w-1/4">Goal</th>
                  <th className="p-4 w-1/4">System (Micro-Action)</th>
                  <th className="p-4 w-1/4">Cue (Trigger)</th>
                  <th className="p-4 w-24 text-center">Streak</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {systems.map(system => {
                  const completed = isCompletedToday(system);
                  return (
                    <tr key={system.id} className="hover:bg-slate-50 group transition-colors">
                      <td className="p-4 font-medium text-slate-900">{system.goal}</td>
                      <td className="p-4">
                        <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-100 inline-block text-sm">
                          {system.microAction}
                        </div>
                      </td>
                      <td className="p-4 text-slate-500 text-sm">{system.cue}</td>
                      <td className="p-4 text-center font-bold text-slate-700">{system.streak} 🔥</td>
                      <td className="p-4 text-right flex justify-end items-center gap-2">
                         <button 
                          onClick={() => onEdit(system)}
                          className="p-1.5 text-slate-400 hover:text-brand-500"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteClick(system.id)} className="p-1.5 text-slate-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="w-2"></div>
                        <button 
                          onClick={() => onToggleToday(system.id)}
                          disabled={completed}
                          className={`
                             px-3 py-1.5 rounded-lg font-bold text-xs transition-all
                            ${completed 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-slate-900 text-white hover:bg-slate-700'
                            }
                          `}
                        >
                          {completed ? 'Done' : 'Check'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
           <div 
            onClick={onNewSystem}
            className="p-3 border-t border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New
          </div>
        </div>
      )}

      {/* --- STATS VIEW (Stock Market Style) --- */}
      {viewMode === 'stats' && (
        <div className="grid gap-6 md:grid-cols-2">
          {systems.map(system => (
            <div key={system.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800">{system.microAction}</h3>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-1">{system.goal}</p>
                </div>
                <div className="flex flex-col items-end">
                   <div className="flex items-center gap-1 text-orange-500">
                      <Flame className="w-5 h-5" />
                      <span className="font-bold text-xl">{system.streak}</span>
                   </div>
                   <span className="text-[10px] text-slate-400 font-bold">CURRENT STREAK</span>
                </div>
              </div>

              <ConsistencyGraph system={system} />
              
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
                <div>
                  <span className="block text-2xl font-black text-slate-800">{system.history.length}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Reps</span>
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-black text-slate-800">
                    {system.history.length > 0 ? Math.round((system.history.length / (Math.ceil((new Date().getTime() - new Date(system.id).getTime() || 1) / (1000 * 3600 * 24)) || 1)) * 100) : 0}%
                  </span>
                   <span className="text-xs font-bold text-slate-400 uppercase">Lifetime Rate</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {systemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform transition-all animate-in zoom-in-95 duration-200 border-b-8 border-slate-200">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                <Trash2 className="w-10 h-10" />
              </div>
              
              <div>
                <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Are you sure?</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  This will delete your system and all your streak history. This action cannot be undone.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  onClick={() => setSystemToDelete(null)}
                  className="py-3 rounded-xl font-extrabold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors uppercase tracking-wider text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="btn-press py-3 rounded-xl font-extrabold text-white bg-red-500 border-red-600 border-b-4 active:border-b-0 active:translate-y-1 shadow-lg shadow-red-200 uppercase tracking-wider text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;