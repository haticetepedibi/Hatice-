
import React, { useState } from 'react';
import { generateCharacterProfile, generateCharacterImage } from '../services/geminiService';
import { GeneratedCharacter, LoadingState } from '../types';
import { Loader2, User, Palette, Shield, Zap, Brain, MessageCircle } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const CharacterDesigner: React.FC = () => {
  const [archetype, setArchetype] = useState('');
  const [traits, setTraits] = useState('');
  const [character, setCharacter] = useState<GeneratedCharacter | null>(null);
  const [status, setStatus] = useState<LoadingState>('idle');
  const [imageStatus, setImageStatus] = useState<LoadingState>('idle');
  
  const handleGenerate = async () => {
    if (!archetype) return;

    setStatus('loading');
    setImageStatus('idle'); // Reset image status
    setCharacter(null);

    try {
      // 1. Generate text profile
      const char = await generateCharacterProfile(archetype, traits);
      setCharacter(char);
      setStatus('success');

      // 2. Automatically kick off image generation
      if (char) {
        setImageStatus('loading');
        try {
            const visualDescription = `${char.name}, ${char.role}, ${char.backstory.substring(0, 100)}`;
            // Fix: Provided missing style and characterType arguments for generateCharacterImage
            const imageUrl = await generateCharacterImage(visualDescription, 'high quality digital art portrait', char.role);
            setCharacter(prev => prev ? { ...prev, imageUrl } : null);
            setImageStatus('success');
        } catch (imgErr) {
            console.error(imgErr);
            setImageStatus('error');
        }
      }

    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const chartData = character ? [
    { subject: 'Strength', A: character.stats.strength, fullMark: 10 },
    { subject: 'Agility', A: character.stats.agility, fullMark: 10 },
    { subject: 'Intelligence', A: character.stats.intelligence, fullMark: 10 },
    { subject: 'Charisma', A: character.stats.charisma, fullMark: 10 },
  ] : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
       <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Character Lab</h2>
        <p className="text-slate-400">Design deep characters with visuals and stats.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <div className="flex-1 space-y-2">
            <label className="text-sm text-slate-400">Archetype / Class</label>
            <input
                value={archetype}
                onChange={(e) => setArchetype(e.target.value)}
                placeholder="e.g. Space Marine, Elven Mage"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
        </div>
        <div className="flex-1 space-y-2">
            <label className="text-sm text-slate-400">Personality / Traits</label>
            <input
                value={traits}
                onChange={(e) => setTraits(e.target.value)}
                placeholder="e.g. Grumpy, loyal, scarred"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
        </div>
        <div className="flex items-end">
             <button
                onClick={handleGenerate}
                disabled={status === 'loading' || !archetype}
                className="h-[50px] bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-900/30"
            >
                {status === 'loading' ? <Loader2 className="animate-spin" size={18} /> : <User size={18} />}
                Create
            </button>
        </div>
      </div>

      {character && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Left Col: Visuals */}
            <div className="lg:col-span-1 space-y-4">
                <div className="aspect-[3/4] bg-slate-900 rounded-xl border border-slate-700 overflow-hidden relative group">
                    {imageStatus === 'loading' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                            <Loader2 className="animate-spin mb-2" size={32} />
                            <span className="text-xs uppercase tracking-widest">Generating Visuals...</span>
                        </div>
                    )}
                    {imageStatus === 'success' && character.imageUrl && (
                        <img 
                            src={character.imageUrl} 
                            alt={character.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    )}
                    {imageStatus === 'error' && (
                        <div className="absolute inset-0 flex items-center justify-center text-red-400">
                            <span className="text-xs">Image Generation Failed</span>
                        </div>
                    )}
                </div>
                
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 h-[300px]">
                    <h4 className="text-slate-400 text-sm uppercase tracking-wider mb-2 text-center">Stats Radar</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                        <Radar
                            name={character.name}
                            dataKey="A"
                            stroke="#818cf8"
                            strokeWidth={2}
                            fill="#6366f1"
                            fillOpacity={0.3}
                        />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Right Col: Details */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <User size={120} />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-4xl font-bold text-white mb-2">{character.name}</h2>
                        <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded text-sm font-medium mb-6">
                            {character.role}
                        </span>

                        <div className="space-y-6">
                            <div>
                                <h3 className="flex items-center gap-2 text-slate-200 font-medium mb-3">
                                    <Brain size={18} className="text-purple-400" />
                                    Backstory
                                </h3>
                                <p className="text-slate-400 leading-relaxed text-lg">
                                    {character.backstory}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 uppercase mb-1">
                                        <Shield size={12} /> Strength
                                    </div>
                                    <div className="text-2xl font-bold text-white">{character.stats.strength}</div>
                                </div>
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 uppercase mb-1">
                                        <Zap size={12} /> Agility
                                    </div>
                                    <div className="text-2xl font-bold text-white">{character.stats.agility}</div>
                                </div>
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 uppercase mb-1">
                                        <Brain size={12} /> Intel
                                    </div>
                                    <div className="text-2xl font-bold text-white">{character.stats.intelligence}</div>
                                </div>
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 uppercase mb-1">
                                        <MessageCircle size={12} /> Charisma
                                    </div>
                                    <div className="text-2xl font-bold text-white">{character.stats.charisma}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CharacterDesigner;
