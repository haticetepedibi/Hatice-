import React, { useState } from 'react';
import { generateWorldLore } from '../services/geminiService';
import { WorldLore, LoadingState } from '../types';
import { Loader2, Globe, MapPin, Flag, Thermometer } from 'lucide-react';

const WorldBuilder: React.FC = () => {
  const [setting, setSetting] = useState('');
  const [tone, setTone] = useState('');
  const [lore, setLore] = useState<WorldLore | null>(null);
  const [status, setStatus] = useState<LoadingState>('idle');

  const handleGenerate = async () => {
    if (!setting) return;
    setStatus('loading');
    try {
      const result = await generateWorldLore(setting, tone);
      setLore(result);
      setStatus('success');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">World Builder</h2>
        <p className="text-slate-400">Construct history, geography, and factions.</p>
      </div>

      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 grid md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
        <div className="space-y-2">
           <label className="text-sm text-slate-400">Setting Type</label>
           <input
             value={setting}
             onChange={(e) => setSetting(e.target.value)}
             placeholder="e.g. Post-apocalyptic desert"
             className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
           />
        </div>
        <div className="space-y-2">
           <label className="text-sm text-slate-400">Tone</label>
           <input
             value={tone}
             onChange={(e) => setTone(e.target.value)}
             placeholder="e.g. Dark, Hopeful, Mysterious"
             className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
           />
        </div>
        <button
            onClick={handleGenerate}
            disabled={status === 'loading' || !setting}
            className="h-[50px] bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
            {status === 'loading' ? <Loader2 className="animate-spin" /> : <Globe size={20} />}
            Forge
        </button>
      </div>

      {lore && (
        <div className="bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-2xl relative overflow-hidden animate-fade-in">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-600 to-red-600"></div>
             
             <div className="flex items-center justify-between mb-8 border-b border-slate-700 pb-6">
                <h2 className="text-4xl font-serif font-bold text-yellow-500">{lore.regionName}</h2>
                <div className="flex items-center gap-2 text-slate-400 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-700">
                    <Thermometer size={16} />
                    <span className="text-sm">{lore.climate}</span>
                </div>
             </div>

             <div className="space-y-8">
                <section>
                    <h3 className="text-xl font-bold text-white mb-3 font-serif">Historical Archives</h3>
                    <p className="text-slate-300 leading-relaxed border-l-4 border-slate-600 pl-4 italic">
                        "{lore.history}"
                    </p>
                </section>

                <div className="grid md:grid-cols-2 gap-8">
                    <section className="bg-slate-900/30 p-5 rounded-lg border border-slate-700/50 hover:border-indigo-500/50 transition-colors">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-400 mb-4">
                            <Flag size={20} /> Factions
                        </h3>
                        <ul className="space-y-2">
                            {lore.factions.map((faction, i) => (
                                <li key={i} className="flex items-center gap-2 text-slate-300">
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                    {faction}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="bg-slate-900/30 p-5 rounded-lg border border-slate-700/50 hover:border-emerald-500/50 transition-colors">
                         <h3 className="flex items-center gap-2 text-lg font-bold text-emerald-400 mb-4">
                            <MapPin size={20} /> Key Locations
                        </h3>
                        <ul className="space-y-2">
                            {lore.keyLocations.map((loc, i) => (
                                <li key={i} className="flex items-center gap-2 text-slate-300">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                    {loc}
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default WorldBuilder;