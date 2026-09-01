import React from 'react';
import { motion } from 'framer-motion';
import { Reveal } from '../ui/Reveal';
import { GradientText } from '../ui/GradientText';

export function FinalCTA() {
  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center py-32 px-5 sm:px-8 lg:px-12 xl:px-16 bg-[#08090B] overflow-hidden">
      
      {/* Animated blue radial glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue/10 rounded-full blur-[150px] pointer-events-none" 
      />

      <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
        <Reveal>
          <h2 className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tighter leading-[1.1] mb-8">
            Agents shouldn't<br/>
            start from <GradientText>zero.</GradientText>
          </h2>
        </Reveal>
        
        <Reveal delay={0.1}>
          <p className="text-xl md:text-2xl text-white/60 font-medium tracking-tight mb-12 max-w-2xl">
            Give every agent the context to understand what matters.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <button className="px-10 py-5 bg-white text-black rounded-full font-bold text-lg flex items-center gap-2 hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              Start building <span>→</span>
            </button>
            <button className="px-10 py-5 rounded-full font-semibold text-lg text-white/80 hover:text-white transition-colors border border-white/10 hover:border-white/30">
              Read the documentation
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
