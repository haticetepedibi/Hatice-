import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import IdeaGenerator from './components/IdeaGenerator';
import CharacterDesigner from './components/CharacterDesigner';
import WorldBuilder from './components/WorldBuilder';
import WritingGame from './components/WritingGame';
import { AppView } from './types';

function App() {
  // Default to the writing game as requested
  const [currentView, setCurrentView] = useState<AppView>(AppView.WRITING_GAME);

  const renderContent = () => {
    switch (currentView) {
      case AppView.WRITING_GAME:
        return <WritingGame />;
      case AppView.IDEA_GENERATOR:
        return <IdeaGenerator />;
      case AppView.CHARACTER_DESIGNER:
        return <CharacterDesigner />;
      case AppView.WORLD_BUILDER:
        return <WorldBuilder />;
      case AppView.DASHBOARD:
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6 animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-4">
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            </div>
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Welcome to GameGenesis
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl">
              Your AI-powered production studio. Select a module from the sidebar to start designing your next masterpiece.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mt-12">
               <button onClick={() => setCurrentView(AppView.WRITING_GAME)} className="col-span-1 md:col-span-2 p-8 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500 rounded-xl hover:shadow-lg hover:shadow-indigo-500/20 transition-all text-center group relative overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Play: Writing Climber</h3>
                    <p className="text-indigo-200 relative z-10">Launch the interactive language learning game prototype.</p>
               </button>
               <button onClick={() => setCurrentView(AppView.IDEA_GENERATOR)} className="p-6 bg-slate-800 border border-slate-700 rounded-xl hover:border-indigo-500 transition-all text-left group">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400">Generate Ideas</h3>
                    <p className="text-sm text-slate-400">Create unique game concepts, mechanics loops, and detailed synopses.</p>
               </button>
               <button onClick={() => setCurrentView(AppView.CHARACTER_DESIGNER)} className="p-6 bg-slate-800 border border-slate-700 rounded-xl hover:border-indigo-500 transition-all text-left group">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400">Design Characters</h3>
                    <p className="text-sm text-slate-400">Build deep personalities, RPG stats, and generate visual portraits.</p>
               </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      <main className="ml-64 p-8 min-h-screen">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;