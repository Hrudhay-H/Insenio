import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Reveal } from '../ui/Reveal';
import { Activity, Database, Clock, ArrowRight, BrainCircuit } from 'lucide-react';

export function ProductPreview() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={containerRef} className="py-32 px-5 sm:px-8 lg:px-12 xl:px-16 bg-[#08090B] overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        <Reveal className="w-full">
          <motion.div 
            style={{ y }}
            className="w-full aspect-auto md:aspect-video rounded-3xl bg-[#0a0a0c] border border-white/10 shadow-2xl overflow-hidden flex flex-col relative"
          >
            {/* Header */}
            <div className="h-12 border-b border-white/10 flex items-center px-6 justify-between bg-black/20">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                </div>
                <div className="text-xs font-mono text-white/40">context-agent-debugger</div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-emerald-500">Connected</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 p-6 gap-6 relative">
              {/* Left Panel */}
              <div className="col-span-1 border border-white/5 rounded-xl bg-white/[0.02] p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-white/60 mb-2">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm font-medium tracking-tight">Active Context</span>
                </div>
                
                {[
                  { icon: Database, label: "Vector DB", value: "3 docs loaded" },
                  { icon: Clock, label: "History", value: "Last 5 turns" },
                  { icon: BrainCircuit, label: "Memory", value: "User prefs sync" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 group hover:border-blue/30 transition-colors cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-white/40 group-hover:text-blue-light transition-colors">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-white/80">{item.label}</span>
                    </div>
                    <span className="text-xs font-mono text-white/40">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Right Panel / Flow */}
              <div className="col-span-1 md:col-span-2 border border-white/5 rounded-xl bg-black/40 p-6 flex flex-col font-mono text-sm relative">
                 <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
                    <div className="w-64 h-64 bg-blue rounded-full blur-[100px]" />
                 </div>
                 
                 <div className="text-white/40 mb-4">{"// Agent Context Resolution"}</div>
                 
                 <div className="flex gap-4 mb-2">
                    <span className="text-blue-light">1</span>
                    <span className="text-white/60">Resolving implicit entities...</span>
                 </div>
                 <div className="flex gap-4 mb-6">
                    <span className="text-blue-light">2</span>
                    <span className="text-emerald-400">Found: "Q3 Financials" (id: doc_982a)</span>
                 </div>
                 
                 <div className="flex gap-4 mb-2">
                    <span className="text-blue-light">3</span>
                    <span className="text-white/60">Injecting structured context...</span>
                 </div>
                 
                 <div className="p-4 rounded bg-white/5 border border-white/10 mt-4 text-xs text-white/80 overflow-hidden relative">
                    <div className="text-blue mb-2">{"{"}</div>
                    <div className="pl-4">
                      <div className="text-white/40">"task": <span className="text-[#ce9178]">"Summarize revenue growth"</span>,</div>
                      <div className="text-white/40">"context": <span className="text-blue-light">{"{"}</span></div>
                      <div className="pl-4">
                        <div className="text-white/40">"doc_type": <span className="text-[#ce9178]">"financial_report"</span>,</div>
                        <div className="text-white/40">"period": <span className="text-[#ce9178]">"2026-Q3"</span>,</div>
                        <div className="text-white/40">"revenue": <span className="text-[#b5cea8]">45.2e6</span></div>
                      </div>
                      <div className="text-blue-light">{"}"}</div>
                    </div>
                    <div className="text-blue">{"}"}</div>
                 </div>
                 
                 <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                    <span className="text-white/40">Status: Ready for generation</span>
                    <button className="px-4 py-2 rounded bg-white text-black font-sans font-medium text-xs flex items-center gap-2 hover:bg-white/90">
                      Execute <ArrowRight className="w-3 h-3" />
                    </button>
                 </div>
              </div>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
