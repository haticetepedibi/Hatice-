import React, { useState } from 'react';
import { generateGameIdea } from '../services/geminiService';
import { GameIdea, LoadingState } from '../types';
import { Loader2, Sparkles, Send } from 'lucide-react';

const IdeaGenerator: React.FC = () => {
  const [inputs, setInputs] = useState({ genre: '', theme: '', style: '' });
  const [idea, setIdea] = useState<GameIdea | null>(null);
  const [status, setStatus] = useState<LoadingState>('idle');
  const [error, setError] = useState<string>('');

  const handleGenerate = async () => {
    if (!inputs.genre) {
      setError('Please enter a genre');
      return;
    }
    
    setStatus('loading');
    setError('');
    try {
      const result = await generateGameIdea(inputs.genre, inputs.theme, inputs.style);
      setIdea(result);
      setStatus('success');
    } catch (err: any) {
      setError(err.message || 'Failed to generate idea');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Idea Generator</h2>
        <p className="text-slate-400">Spark your next project with AI-driven concepts.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Genre</label>
          <input
            type="text"
            placeholder="e.g. Roguelike, RPG..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            value={inputs.genre}
            onChange={(e) => setInputs({ ...inputs, genre: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Theme</label>
          <input
            type="text"
            placeholder="e.g. Cyberpunk, Medieval..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            value={inputs.theme}
            onChange={(e) => setInputs({ ...inputs, theme: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Visual Style</label>
          <input
            type="text"
            placeholder="e.g. Pixel Art, Low Poly..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            value={inputs.style}
            onChange={(e) => setInputs({ ...inputs, style: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={status === 'loading'}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
          {status === 'loading' ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Sparkles size={20} />
          )}
          Generate Concept
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded-lg text-center border border-red-900/50">
          {error}
        </div>
      )}

      {idea && (
        <div className="animate-fade-in bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-6 border-b border-slate-700">
            <h3 className="text-2xl font-bold text-white">{idea.title}</h3>
            <div className="flex gap-2 mt-2">
              <span className="px-3 py-1 bg-slate-900 rounded-full text-xs text-indigo-300 border border-indigo-900">{idea.genre}</span>
              <span className="px-3 py-1 bg-slate-900 rounded-full text-xs text-purple-300 border border-purple-900">{idea.platform}</span>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-indigo-400 font-medium mb-2 uppercase text-xs tracking-wider">The Pitch (USP)</h4>
              <p className="text-lg text-slate-200 italic">"{idea.uniqueSellingPoint}"</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-indigo-400 font-medium mb-2 uppercase text-xs tracking-wider">Core Gameplay Loop</h4>
                <p className="text-slate-300 leading-relaxed">{idea.coreLoop}</p>
              </div>
              <div>
                <h4 className="text-indigo-400 font-medium mb-2 uppercase text-xs tracking-wider">Story Synopsis</h4>
                <p className="text-slate-300 leading-relaxed">{idea.storySynopsis}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeaGenerator;