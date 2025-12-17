import React from 'react';
import { AppView } from '../types';
import { Layout, Lightbulb, User, Map, PenTool } from 'lucide-react';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: <Layout size={20} /> },
    { id: AppView.WRITING_GAME, label: 'Writing Climber', icon: <PenTool size={20} />, highlight: true },
    { id: AppView.IDEA_GENERATOR, label: 'Idea Generator', icon: <Lightbulb size={20} /> },
    { id: AppView.CHARACTER_DESIGNER, label: 'Character Lab', icon: <User size={20} /> },
    { id: AppView.WORLD_BUILDER, label: 'World Builder', icon: <Map size={20} /> },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col h-full fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          GameGenesis
        </h1>
        <p className="text-xs text-slate-400 mt-1">AI Design Assistant</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === item.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            } ${item.highlight ? 'border border-indigo-500/30 bg-indigo-900/10' : ''}`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-xs text-slate-500 text-center">Powered by Gemini 2.5</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;