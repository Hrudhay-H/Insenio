import React, { useState } from 'react';
import { Reveal } from '../ui/Reveal';
import { motion } from 'framer-motion';

export function ContextCloudSection() {
  const [activeTab, setActiveTab] = useState(2); // Default to Filesystems

  const tabs = [
    { id: 1, label: "Memory & Continual Learning" },
    { id: 2, label: "SuperRAG (Retrieval)" },
    { id: 3, label: "Filesystems" },
    { id: 4, label: "Profiles" },
    { id: 5, label: "Connectors" },
    { id: 6, label: "Extractors" },
    { id: 7, label: "Qualitative Analysis" },
  ];

  return (
    <section className="py-24 px-5 sm:px-8 bg-white border-t border-black/5">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
        
        {/* Left Column - Navigation */}
        <div className="lg:w-1/3 flex flex-col">
          <Reveal className="mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-black leading-[1.1] mb-6">
              All the legos<br/>
              to build the<br/>
              perfect context<br/>
              <span className="text-blue">for your agent.</span>
            </h2>
            <p className="text-black/50 font-medium max-w-sm">
              Focused primitives for ingesting, understanding, routing, and retrieving context.
            </p>
          </Reveal>

          <div className="flex flex-col">
            {tabs.map((tab, idx) => {
              const isActive = activeTab === idx;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center gap-4 py-5 border-b text-left transition-colors duration-300 relative ${
                    isActive ? 'border-blue' : 'border-black/5 hover:border-black/20'
                  }`}
                >
                  <span className={`text-xs font-mono font-bold ${isActive ? 'text-blue' : 'text-black/30'}`}>
                    0{tab.id}
                  </span>
                  <span className={`text-lg font-bold tracking-tight ${isActive ? 'text-black' : 'text-black/50'}`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabIndicator"
                      className="absolute right-0 w-2 h-2 bg-blue"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column - Visual & Description */}
        <div className="lg:w-2/3 flex flex-col">
          
          {/* Blue Visual Container */}
          <div className="w-full aspect-[4/3] bg-blue relative p-8 flex items-center justify-center overflow-hidden mb-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:16px_16px]" />
            
            {/* Corner Markers */}
            <div className="absolute top-4 left-4 w-2 h-2 bg-white" />
            <div className="absolute top-4 right-4 w-2 h-2 bg-white" />
            <div className="absolute bottom-4 left-4 w-2 h-2 bg-white" />
            <div className="absolute bottom-4 right-4 w-2 h-2 bg-white" />
            
            {/* Visual content based on active tab (Simplified mock) */}
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative z-10 w-full max-w-md aspect-square bg-white shadow-2xl rounded-[3rem] border-[12px] border-[#e0e7ff] flex flex-col items-center justify-center transform -rotate-2"
            >
              <div className="w-48 h-48 border-[8px] border-blue/10 rounded-xl relative bg-[#f8fafc] flex items-center justify-center overflow-hidden shadow-inner">
                {/* Mock abstract UI representing a "Filesystem" drawer */}
                <div className="w-3/4 h-1/2 bg-blue rounded-t-lg absolute bottom-0 shadow-lg border-t-4 border-white">
                  <div className="w-12 h-2 bg-white/30 mx-auto mt-2 rounded-full" />
                </div>
                <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 flex gap-2 w-3/4 px-4">
                  <div className="w-6 h-8 bg-red-400 rounded shadow transform -rotate-12 translate-y-2" />
                  <div className="w-6 h-8 bg-yellow-400 rounded shadow transform -translate-y-2" />
                  <div className="w-6 h-8 bg-green-400 rounded shadow transform rotate-12 translate-y-2" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs font-bold text-blue tracking-widest uppercase mb-4">
              <span>0{tabs[activeTab].id}</span> <span className="text-blue/30">·</span> <span>{tabs[activeTab].label.toUpperCase()}</span>
            </div>
            <h3 className="text-4xl font-bold tracking-tight mb-4 text-black">{tabs[activeTab].label}</h3>
            <p className="text-black/60 font-medium leading-relaxed max-w-2xl text-lg">
              {activeTab === 2 
                ? "A real filesystem mount that gives your agent a supermemory. grep becomes semantic search, a live profile.md synthesizes context on the fly, and any file format is indexed automatically. Native POSIX on macOS and Linux; your agent just uses ls, cat, and grep."
                : "Context Cloud automatically processes and structures this capability, integrating seamlessly with your agent's workflow to provide the exact context required at the exact moment."}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
