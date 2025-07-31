
import React from 'react';
import { BotIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/60 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
             <BotIcon className="w-8 h-8 text-indigo-500" />
            <h1 className="text-xl font-bold text-slate-100">AI Document Analysis Hub</h1>
          </div>
        </div>
      </div>
    </header>
  );
};
