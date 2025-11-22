import React from 'react';
import { BrainCircuit, Zap, Check } from './Icons';

const LearnSection: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12 pb-20">
      
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-slate-900">Systems vs. Goals</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          "Goals are good for setting a direction, but systems are best for making progress." — James Clear
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">What is a System?</h3>
          </div>
          <p className="text-slate-600 leading-relaxed">
            A system is a repeatable process—a collection of tiny habits, cues, and environment setups—that you run every day. 
            Unlike a goal which is a one-time event (e.g., "Lose 5kg"), a system is the daily routine that makes the outcome inevitable.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">The Neuroscience</h3>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Systems leverage the "Cue → Routine → Reward" loop (basal ganglia). 
            By pre-deciding your actions (Implementation Intentions), you remove the reliance on willpower and reduce the friction of starting.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl">
        <h3 className="text-2xl font-bold mb-6">The Universal Formula</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
            <div>
              <h4 className="font-bold text-slate-100">Start Tiny (BJ Fogg)</h4>
              <p className="text-slate-300 text-sm mt-1">Make the habit so small it's impossible to say no. e.g., "Write 2 sentences", not "Write a chapter".</p>
            </div>
          </div>
           <div className="flex items-start gap-4">
            <div className="bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
            <div>
              <h4 className="font-bold text-slate-100">If-Then Planning (Gollwitzer)</h4>
              <p className="text-slate-300 text-sm mt-1">Pre-commit to a specific cue. "IF I [existing habit], THEN I will [new micro-action]."</p>
            </div>
          </div>
           <div className="flex items-start gap-4">
            <div className="bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
            <div>
              <h4 className="font-bold text-slate-100">Visible Progress (Seinfeld)</h4>
              <p className="text-slate-300 text-sm mt-1">Track every completion. "Don't break the chain." Visible progress releases dopamine.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg">
        <h4 className="font-semibold text-amber-900 mb-2">A Note on Identity</h4>
        <p className="text-amber-800">
          True behavior change is identity change. The goal isn't to run a marathon, but to <em>become a runner</em>. 
          Every time you execute your system, you cast a vote for that new identity.
        </p>
      </div>
    </div>
  );
};

export default LearnSection;