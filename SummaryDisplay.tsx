
import React, { useState } from 'react';
import type { Summary } from '../types';
import { ListIcon, TldrIcon, TagIcon } from './icons';

interface SummaryDisplayProps {
  summary: Summary;
}

type ActiveTab = 'tldr' | 'bullets' | 'entities';

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tldr');

  const renderContent = () => {
    switch (activeTab) {
      case 'tldr':
        return (
          <div className="text-slate-300 text-sm">
            <p>{summary.tldr}</p>
          </div>
        );
      case 'bullets':
        return (
          <ul className="space-y-3 pl-5">
            {summary.bullets.map((bullet, index) => (
              <li key={index} className="flex items-start">
                <span className="text-indigo-400 mr-3 mt-1 flex-shrink-0">◆</span>
                <span className="text-slate-300">{bullet}</span>
              </li>
            ))}
          </ul>
        );
      case 'entities':
        return (
          <div className="flex flex-wrap gap-2">
            {summary.entities.map((entity, index) => (
              <div key={index} className="bg-slate-700 rounded-full px-3 py-1 text-sm group relative">
                <span className="font-medium text-slate-200">{entity.name}</span>
                <span className="text-indigo-400 ml-1.5">{entity.type}</span>
                <div className="absolute bottom-full mb-2 w-64 p-2 bg-slate-900 border border-slate-600 rounded-md text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {entity.context}
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };
  
  const TabButton = ({ tab, icon, label }: { tab: ActiveTab; icon: React.ReactNode; label: string;}) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tab
          ? 'bg-indigo-600 text-white'
          : 'text-slate-300 hover:bg-slate-700/50'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="p-4 flex flex-col">
      <h2 className="text-lg font-bold text-slate-100 mb-3">Document Summary</h2>
      <div className="flex items-center gap-2 border-b border-slate-700 mb-4 pb-2">
        <TabButton tab="tldr" icon={<TldrIcon className="w-4 h-4" />} label="TL;DR" />
        <TabButton tab="bullets" icon={<ListIcon className="w-4 h-4" />} label="Key Points" />
        <TabButton tab="entities" icon={<TagIcon className="w-4 h-4" />} label="Entities" />
      </div>
      <div className="flex-grow min-h-[150px] max-h-[300px] overflow-y-auto pr-2">
        {renderContent()}
      </div>
    </div>
  );
};
