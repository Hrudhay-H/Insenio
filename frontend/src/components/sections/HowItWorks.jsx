import React from 'react';
import { Reveal } from '../ui/Reveal';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';

export function HowItWorks() {
  return (
    <section className="py-24 px-5 sm:px-8 bg-white border-t border-black/5">
      <div className="max-w-7xl mx-auto flex flex-col">
        
        <Reveal className="mb-16">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-black">
              How it <span className="text-blue">works.</span>
            </h2>
            <p className="text-black/50 max-w-sm text-sm font-medium hidden md:block">
              Conversational intake, Delta Lake data structure, Transparent Matching, and Apply Assist.
            </p>
          </div>
        </Reveal>

        <div className="border border-black/10 rounded-2xl overflow-hidden flex flex-col shadow-sm">
          
          {/* Top Visual Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-off-white border-b border-black/10">
            
            {/* Left - Chat Intake */}
            <div className="p-8 md:p-12 relative flex items-center justify-center border-b md:border-b-0 md:border-r border-black/10 bg-[#e8f1fc] overflow-hidden">
              <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
              
              <motion.div 
                className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden border border-black/5"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-black/5">
                  <Bot className="w-4 h-4 text-blue" />
                  <div className="text-sm font-bold text-black">Insenio Spaces</div>
                </div>
                
                <div className="p-4 flex flex-col gap-3 bg-gray-50 h-[220px] overflow-hidden">
                  <div className="flex gap-2 self-start">
                    <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                      <Bot className="w-3 h-3 text-blue" />
                    </div>
                    <div className="p-2 bg-white border border-gray-200 rounded-lg text-xs shadow-sm max-w-[200px]">
                      What programming languages do you know?
                    </div>
                  </div>
                  
                  <div className="flex gap-2 self-end flex-row-reverse">
                    <div className="w-6 h-6 rounded-full bg-blue flex items-center justify-center shrink-0">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <div className="p-2 bg-blue text-white rounded-lg text-xs shadow-sm max-w-[200px]">
                      I am intermediate in Python and learning C++.
                    </div>
                  </div>
                  
                  <div className="flex gap-2 self-start">
                    <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                      <Bot className="w-3 h-3 text-blue" />
                    </div>
                    <div className="p-2 bg-white border border-gray-200 rounded-lg text-xs shadow-sm max-w-[200px]">
                      Got it. Profile updated in Delta Lake.
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right - Transparent Gap Reasoning */}
            <div className="p-8 md:p-12 relative flex items-center justify-center bg-gradient-to-br from-white to-[#f8fafc]">
              <div className="relative z-10 w-full max-w-md flex flex-col gap-4">
                
                <motion.div 
                  className="bg-white rounded-xl shadow-xl border border-black/5 p-5 flex flex-col gap-3"
                  initial={{ y: 20 }}
                  whileInView={{ y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-black">Data Science Lab</h4>
                    <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Stretch Pick</span>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                      <div className="w-4 h-4 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-[10px]">✕</div>
                      <span className="text-xs font-semibold">Skill Gap</span>
                      <span className="text-xs text-gray-500 ml-auto">Missing: C++</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                      <div className="w-4 h-4 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-[10px]">✓</div>
                      <span className="text-xs font-semibold">Interest Match</span>
                      <span className="text-xs text-gray-500 ml-auto">AI Alignment</span>
                    </div>
                  </div>
                </motion.div>

              </div>
            </div>
            
          </div>

          {/* Bottom Text Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-white">
            
            <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-black/10">
              <div className="flex items-center gap-2 text-xs font-bold text-blue tracking-widest uppercase mb-4">
                <span>01</span> <span className="text-blue/30">/</span> <span>Onboard</span>
              </div>
              <h3 className="text-3xl font-bold tracking-tight mb-4">Conversational Intake.</h3>
              <p className="text-black/60 font-medium leading-relaxed">
                Describe your skills and interests to Insenio natively. Your profile is built into structured Delta Lake tables automatically.
              </p>
            </div>
            
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-2 text-xs font-bold text-blue tracking-widest uppercase mb-4">
                <span>02</span> <span className="text-blue/30">/</span> <span>Discover</span>
              </div>
              <h3 className="text-3xl font-bold tracking-tight mb-4">Transparent Matching.</h3>
              <p className="text-black/60 font-medium leading-relaxed">
                See exactly why you're a match or a stretch. View missing skills and align your interests visually, rather than guessing a black-box score.
              </p>
            </div>
          </div>

          {/* Row 2 Visual Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-off-white border-t border-b border-black/10">
            {/* Left - Skill Gap (Item 3) */}
            <div className="p-8 md:p-12 relative flex items-center justify-center border-b md:border-b-0 md:border-r border-black/10 bg-slate-50 min-h-[300px] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
              <motion.div 
                className="relative z-10 w-full max-w-sm flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
              >
                {/* Visual placeholder for Skill Gap */}
                <div className="relative w-48 h-48">
                  {/* Center Node */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-blue text-white flex items-center justify-center shadow-lg z-20">
                    <User className="w-8 h-8" />
                  </div>
                  {/* Satellite Nodes */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded bg-white shadow border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 z-10">Py</div>
                  <div className="absolute bottom-4 left-0 w-10 h-10 rounded bg-white shadow border border-green-200 text-green-500 flex items-center justify-center text-xs font-bold z-10">C++</div>
                  <div className="absolute bottom-4 right-0 w-10 h-10 rounded bg-white shadow border border-red-200 text-red-500 flex items-center justify-center text-xs font-bold z-10">ML</div>
                  {/* Connecting Lines */}
                  <svg className="absolute inset-0 w-full h-full z-0" style={{ pointerEvents: 'none' }}>
                    <line x1="50%" y1="50%" x2="50%" y2="20px" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" />
                    <line x1="50%" y1="50%" x2="40px" y2="85%" stroke="#cbd5e1" strokeWidth="2" />
                    <line x1="50%" y1="50%" x2="150px" y2="85%" stroke="#ef4444" strokeWidth="2" strokeDasharray="4" />
                  </svg>
                </div>
              </motion.div>
            </div>

            {/* Right - Assistant (Item 4) */}
            <div className="p-8 md:p-12 relative flex items-center justify-center bg-blue/5 min-h-[300px] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#bfdbfe_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
              <motion.div 
                className="relative z-10 w-full max-w-sm bg-white rounded-xl shadow-xl border border-black/5 p-4 flex flex-col gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-full bg-gray-50 rounded-lg h-10 px-4 flex items-center gap-2 border border-black/5">
                  <Bot className="w-4 h-4 text-blue" />
                  <span className="text-sm text-gray-500">Find labs needing Python...</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="bg-white rounded-lg border border-black/5 shadow-sm p-4 flex flex-col gap-2">
                    <div className="w-1/3 h-2 bg-blue/20 rounded" />
                    <div className="w-full h-2 bg-gray-100 rounded mt-1" />
                    <div className="w-5/6 h-2 bg-gray-100 rounded" />
                  </div>
                  <div className="bg-white rounded-lg border border-black/5 shadow-sm p-4 flex flex-col gap-2 opacity-50">
                    <div className="w-1/4 h-2 bg-blue/20 rounded" />
                    <div className="w-full h-2 bg-gray-100 rounded mt-1" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Row 2 Text Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-white border-b border-black/10">
            <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-black/10">
              <div className="flex items-center gap-2 text-xs font-bold text-blue tracking-widest uppercase mb-4">
                <span>03</span> <span className="text-blue/30">/</span> <span>Understand</span>
              </div>
              <h3 className="text-3xl font-bold tracking-tight mb-4">Skill Gap Analysis.</h3>
              <p className="text-black/60 font-medium leading-relaxed">
                See exactly which skills a research lab expects and how your current abilities compare. Missing a skill doesn't eliminate an opportunity.
              </p>
            </div>
            
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-2 text-xs font-bold text-blue tracking-widest uppercase mb-4">
                <span>04</span> <span className="text-blue/30">/</span> <span>Retrieve</span>
              </div>
              <h3 className="text-3xl font-bold tracking-tight mb-4">Insenio Assistant.</h3>
              <p className="text-black/60 font-medium leading-relaxed">
                Explore the research landscape conversationally. Ask questions such as which labs need Python, which opportunities have open capacity, or which align with you.
              </p>
            </div>
          </div>

          {/* Row 3 - Item 5 (Full Width) */}
          <div className="bg-[#0066FF] text-white flex flex-col md:flex-row relative overflow-hidden">
            <div className="p-8 md:p-12 lg:p-16 flex-1 flex flex-col justify-center relative z-10">
              <div className="flex items-center gap-2 text-xs font-bold text-white tracking-widest uppercase mb-4">
                <span>05</span> <span className="text-white/50">/</span> <span>Real-time Traversal</span>
              </div>
              <h3 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Apply Assist.</h3>
              <p className="text-white/80 font-medium leading-relaxed max-w-md text-lg">
                Once you find a promising lab, Insenio helps draft a personalized outreach message using your actual skills and interests. You always review before sending.
              </p>
            </div>
            
            <div className="flex-1 p-8 md:p-12 relative flex items-center justify-center min-h-[400px]">
              {/* Background gradient/pattern for visual flair */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0066FF] to-blue-600" />
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.15)_1.5px,transparent_1.5px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none" />
              
              <motion.div 
                className="relative z-10 w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 flex flex-col gap-4"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {/* Mock Browser Header */}
                <div className="w-full h-4 flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <div className="ml-auto w-1/3 h-2 bg-white/20 rounded-full" />
                </div>
                
                {/* Mock Content */}
                <div className="w-16 h-2 bg-white/50 rounded mb-2" />
                <div className="w-full h-1.5 bg-white/30 rounded mt-1" />
                <div className="w-full h-1.5 bg-white/30 rounded" />
                <div className="w-5/6 h-1.5 bg-white/30 rounded" />
                <div className="w-full h-1.5 bg-white/30 rounded mt-4" />
                <div className="w-4/6 h-1.5 bg-white/30 rounded" />
                
                {/* Mock Button */}
                <div className="mt-6 w-full py-3 bg-white text-blue text-sm font-bold rounded-xl flex items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors shadow-lg">
                  Send Application
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
