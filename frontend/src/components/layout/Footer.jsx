import React from 'react';
import { Bot } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-black/5 py-12 px-5 sm:px-8 lg:px-12 xl:px-16 bg-white text-black">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-black" />
            <span className="font-bold text-lg tracking-tight">Insenio Lab Match</span>
          </div>
          <p className="text-black/50 text-sm font-medium">
            Databricks Campus Hackathon 2026.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-4">
          {['Students', 'Labs', 'Documentation', 'GitHub', 'Team'].map((item) => (
            <a 
              key={item} 
              href="#"
              className="text-sm font-medium text-black/60 hover:text-black transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-black/5 flex items-center justify-between">
        <p className="text-black/40 text-xs font-medium">
          © 2026 Insenio Lab Match
        </p>
      </div>
    </footer>
  );
}
