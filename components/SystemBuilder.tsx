import React, { useState } from 'react';
import { BrainCircuit, ArrowRight, Zap } from './Icons';
import { SystemPlan } from '../types';
import { generateSystemFromGoal } from '../services/geminiService';

interface SystemBuilderProps {
  onSave: (system: SystemPlan) => void;
  onCancel: () => void;
  initialSystem?: SystemPlan;
}

const CoachTip = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="bg-brand-50 border-l-4 border-brand-400 p-4 rounded-r-xl mt-4">
    <div className="flex items-center gap-2 mb-1">
      <div className="text-xl">🦉</div>
      <span className="font-bold text-brand-700 text-sm uppercase tracking-wide">{title}</span>
    </div>
    <p className="text-brand-800 text-sm leading-relaxed">
      {children}
    </p>
  </div>
);

const SystemBuilder: React.FC<SystemBuilderProps> = ({ onSave, onCancel, initialSystem }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State - Initialize with initialSystem if available
  const [goal, setGoal] = useState(initialSystem?.goal || '');
  const [microAction, setMicroAction] = useState(initialSystem?.microAction || '');
  const [cue, setCue] = useState(initialSystem?.cue || '');
  const [environment, setEnvironment] = useState(initialSystem?.environment || '');
  const [reward, setReward] = useState(initialSystem?.reward || '');
  const [aiAdvice, setAiAdvice] = useState('');

  const handleAiAssist = async () => {
    if (!goal || goal.length < 3) return;
    
    setIsLoading(true);
    setAiAdvice('');
    const result = await generateSystemFromGoal(goal);
    setIsLoading(false);

    if (result) {
      setMicroAction(result.microAction);
      setCue(result.cue);
      setEnvironment(result.environment);
      setReward(result.reward);
      setAiAdvice(result.advice);
      setStep(2); // Move to details step
    }
  };

  const handleSave = () => {
    const newSystem: SystemPlan = {
      id: initialSystem?.id || Date.now().toString(),
      goal,
      microAction,
      cue,
      environment,
      reward,
      streak: initialSystem?.streak || 0,
      lastCompleted: initialSystem?.lastCompleted || null,
      history: initialSystem?.history || []
    };
    onSave(newSystem);
  };

  const isEditing = !!initialSystem;

  return (
    <div className="max-w-xl mx-auto p-6 pb-20">
      
      {/* Progress Header */}
      <div className="mb-8 flex items-center justify-between">
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 font-bold text-sm">Close</button>
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
             <div key={i} className={`h-2 w-8 rounded-full transition-all ${step >= i ? 'bg-brand-500' : 'bg-slate-200'}`} />
          ))}
        </div>
        <div className="text-xs font-bold text-slate-400">STEP {step} OF 3</div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border-2 border-slate-100">
        
        <div className="p-8">
          
          {/* Step 1: The Goal */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-extrabold text-slate-800">{isEditing ? 'Edit Goal' : 'Define the Goal'}</h2>
                <p className="text-slate-500 font-medium">What outcome do you want?</p>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Learn Python, Run a 5k"
                  className="w-full p-4 text-xl font-bold text-center text-slate-800 border-b-4 border-slate-200 rounded-xl focus:border-brand-500 focus:bg-brand-50 outline-none transition-all placeholder:font-normal"
                  onKeyDown={(e) => e.key === 'Enter' && handleAiAssist()}
                />
              </div>

              <CoachTip title="Why this matters">
                Goals set the direction, but systems provide the progress. Keep it clear so we can reverse-engineer the daily habit.
              </CoachTip>

              <div className="pt-6 flex flex-col gap-4">
                 <button
                  onClick={handleAiAssist}
                  disabled={!goal || isLoading}
                  className="btn-press w-full py-4 bg-brand-500 text-white border-brand-600 border-b-4 rounded-2xl font-extrabold text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:border-b-0 disabled:translate-y-0 transition-all"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"/>
                      Designing...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="w-6 h-6" />
                      {isEditing ? 'Regenerate with AI' : 'Generate System with AI'}
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setStep(2)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-center text-sm"
                >
                  {isEditing ? 'Continue to details' : "I'll design it manually"}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: The System Mechanics */}
          {step === 2 && (
             <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="text-center">
                 <h2 className="text-2xl font-extrabold text-slate-800">Build Your System</h2>
                 <p className="text-slate-500">You can do it</p>
              </div>

              {aiAdvice && (
                <div className="bg-indigo-50 p-4 rounded-xl text-indigo-700 text-sm font-medium border border-indigo-100">
                  ✨ <strong>AI Tip:</strong> {aiAdvice}
                </div>
              )}

              <div className="space-y-6">
                
                <div>
                  <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    1. The Micro-Action
                  </label>
                  <input
                    type="text"
                    value={microAction}
                    onChange={(e) => setMicroAction(e.target.value)}
                    className="w-full p-3 text-lg font-semibold text-slate-900 border-2 border-slate-200 rounded-xl focus:border-brand-500 outline-none"
                    placeholder="Read 1 page"
                  />
                  <p className="text-xs text-slate-400 mt-1 font-medium">Must be less than 2 minutes to do.</p>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    2. The Cue (If-Then)
                  </label>
                  <input
                    type="text"
                    value={cue}
                    onChange={(e) => setCue(e.target.value)}
                    className="w-full p-3 text-lg font-semibold text-slate-900 border-2 border-slate-200 rounded-xl focus:border-brand-500 outline-none"
                    placeholder="After I pour coffee..."
                  />
                  <CoachTip title="Implementation Intention">
                    Be specific. "After I [existing habit], I will [new habit]."
                  </CoachTip>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    3. Environment Design
                  </label>
                  <input
                    type="text"
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="w-full p-3 text-lg font-semibold text-slate-900 border-2 border-slate-200 rounded-xl focus:border-brand-500 outline-none"
                    placeholder="Put book on pillow"
                  />
                </div>

                <div>
                   <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    4. Immediate Reward
                  </label>
                  <input
                    type="text"
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    className="w-full p-3 text-lg font-semibold text-slate-900 border-2 border-slate-200 rounded-xl focus:border-brand-500 outline-none"
                    placeholder="Fist pump!"
                  />
                </div>

              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!microAction || !cue}
                  className="flex-[2] btn-press py-3 bg-brand-500 text-white border-brand-600 border-b-4 rounded-xl font-extrabold shadow-sm disabled:opacity-50 disabled:border-b-0 disabled:translate-y-0"
                >
                  Review System
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="text-center space-y-2">
                 <h2 className="text-2xl font-extrabold text-slate-800">Ready to Launch?</h2>
                 <p className="text-slate-500">Review your habit loop.</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 space-y-6 relative overflow-hidden">
                {/* Decorative background element */}
                <Zap className="absolute -top-4 -right-4 w-32 h-32 text-slate-200 opacity-20 rotate-12" />

                <div className="relative">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">When</span>
                  <p className="text-lg font-bold text-slate-800">{cue}</p>
                </div>
                
                <div className="flex justify-center">
                  <ArrowRight className="text-slate-300 w-6 h-6 rotate-90 md:rotate-0" />
                </div>

                <div className="relative">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">I will</span>
                  <p className="text-xl font-black text-brand-600">{microAction}</p>
                  <p className="text-sm text-slate-500 mt-1 italic">Setup: {environment}</p>
                </div>

                 <div className="flex justify-center">
                  <ArrowRight className="text-slate-300 w-6 h-6 rotate-90 md:rotate-0" />
                </div>

                 <div className="relative">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Then I celebrate</span>
                  <p className="text-lg font-bold text-slate-800">{reward}</p>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleSave}
                  className="flex-[2] btn-press py-4 bg-brand-action text-white border-brand-actionShadow border-b-4 rounded-2xl font-extrabold text-lg shadow-xl hover:brightness-105"
                >
                  {isEditing ? 'Save Changes' : 'Create System'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SystemBuilder;