import React from 'react';
import { Reveal } from '../ui/Reveal';
import { motion } from 'framer-motion';

export function ContextComparison() {
  return (
    <section className="py-32 px-5 sm:px-8 lg:px-12 xl:px-16 bg-[#08090B] border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        <Reveal className="mb-24 text-center">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-white">
            From prompt<br/>
            to <span className="text-brand-gradient">understanding.</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 w-full max-w-5xl">
          
          {/* Without Context */}
          <Reveal className="flex flex-col relative" delay={0.1}>
            <div className="text-sm font-mono tracking-widest text-white/30 mb-12 uppercase text-center">
              Without Context
            </div>
            
            <div className="flex flex-col items-center gap-8 relative z-10">
              <div className="w-48 py-4 bg-white/5 border border-white/10 rounded-xl text-center text-white/60">
                Prompt
              </div>
              <div className="w-[1px] h-12 bg-white/10" />
              <div className="w-48 py-4 bg-white/5 border border-white/10 rounded-xl text-center text-white/60">
                Agent
              </div>
              <div className="w-[1px] h-12 bg-white/10" />
              <div className="w-48 py-4 bg-white/5 border border-white/10 rounded-xl text-center text-white/40 border-dashed">
                Generic response
              </div>
            </div>
          </Reveal>

          {/* With Context */}
          <Reveal className="flex flex-col relative" delay={0.2}>
            <div className="text-sm font-mono tracking-widest text-blue mb-12 uppercase text-center font-bold">
              With Context
            </div>
            
            <div className="flex flex-col items-center gap-8 relative z-10">
              <div className="flex gap-4">
                <div className="w-40 py-4 bg-white/5 border border-white/10 rounded-xl text-center text-white">
                  Prompt
                </div>
                <div className="flex items-center text-white/40">+</div>
                <motion.div 
                  className="w-40 py-4 bg-blue/10 border border-blue/30 rounded-xl text-center text-blue-light font-medium"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  Context
                </motion.div>
              </div>
              
              <div className="w-[1px] h-12 bg-gradient-to-b from-white/10 to-blue/50 relative overflow-hidden">
                <motion.div 
                  animate={{ y: ['-100%', '100%'] }} 
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 1 }}
                  className="absolute inset-0 h-1/2 bg-blue-light" 
                />
              </div>
              
              <div className="w-48 py-4 bg-white border border-white rounded-xl text-center text-black font-bold shadow-[0_0_30px_rgba(79,131,237,0.2)]">
                Agent
              </div>
              
              <div className="w-[1px] h-12 bg-blue/50 relative overflow-hidden">
                <motion.div 
                  animate={{ y: ['-100%', '100%'] }} 
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 1.2 }}
                  className="absolute inset-0 h-1/2 bg-blue-light" 
                />
              </div>
              
              <div className="w-64 py-4 bg-blue border border-blue-light rounded-xl text-center text-white font-bold shadow-[0_0_40px_rgba(79,131,237,0.4)]">
                Relevant action
              </div>
            </div>
            
            <div className="absolute inset-0 bg-brand-gradient opacity-[0.02] blur-3xl rounded-full" />
          </Reveal>

        </div>
      </div>
    </section>
  );
}
