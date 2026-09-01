import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Bot } from 'lucide-react';
import { Reveal } from '../ui/Reveal';

const WORDS = ["Lab Match.", "Discovery.", "RAG Search.", "AI Outreach."];

export function Hero() {
  const [cursorVisible, setCursorVisible] = useState(true);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Typewriter effect
  useEffect(() => {
    const currentWord = WORDS[wordIndex % WORDS.length];

    let delay = isDeleting ? 40 : 120; // 40ms deleting, 120ms typing

    if (!isDeleting && text === currentWord) {
      delay = 2500; // Pause for 2.5s when word is complete
    } else if (isDeleting && text === "") {
      delay = 500; // Pause for 0.5s before typing next word
    }

    const timeout = setTimeout(() => {
      if (!isDeleting && text === currentWord) {
        setIsDeleting(true);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setWordIndex(prev => prev + 1);
      } else {
        setText(currentWord.slice(0, text.length + (isDeleting ? -1 : 1)));
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex]);

  return (
    <section className="relative w-full pt-32 pb-16 overflow-hidden bg-white min-h-screen flex flex-col items-center">
      {/* Dot Pattern Background */}
      <div 
        className="absolute inset-0 z-0 h-full w-full opacity-50"
        style={{
          backgroundImage: 'radial-gradient(#3b82f6 1.5px, transparent 1.5px), radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
          maskImage: 'radial-gradient(ellipse 100% 100% at 50% 50%, black 10%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 50% 50%, black 10%, transparent 80%)'
        }}
      ></div>
      
      <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10 mb-20">
        
        <Reveal delay={0.1} className="flex flex-col items-start w-full text-left">
          

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight leading-[1.05] text-black mb-6">
            A Data-Driven Platform
            <br />
            for <span className="text-blue font-bold">
              {text}<span className={`inline-block w-4 h-10 md:w-5 md:h-[4rem] bg-blue translate-y-2 ml-1 ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}></span>
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium mb-10 max-w-lg">
            Build your living profile through natural conversation, browse labs with transparent gap analysis, and apply with AI-assisted outreach.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-10 lg:mb-0">
            <button className="flex items-center gap-3 px-8 py-4 bg-black text-white hover:bg-gray-900 transition-colors text-xs font-bold tracking-widest uppercase rounded-sm">
              <ArrowRight className="w-4 h-4" /> Get Started
            </button>
            <button className="px-8 py-4 border border-gray-200 text-gray-600 hover:text-black hover:border-gray-300 transition-colors text-xs font-bold tracking-widest uppercase rounded-sm">
              Watch Demo
            </button>
          </div>
        </Reveal>

        {/* Side Image */}
        <Reveal delay={0.2} className="w-full relative hidden lg:block">
          <div className="w-full   rounded-xl flex items-center justify-center overflow-hidden relative ">
            <img 
              src="/hero-side.png" 
              alt="Platform Dashboard" 
              className="w-full h-full object-contain " 
            />
          </div>
        </Reveal>

      </div>

      {/* Logo Strip / Marquee */}
      <Reveal delay={0.3} className="w-full  border-t border-gray-100">
        <div 
          className="relative z-10 w-full overflow-hidden flex items-center whitespace-nowrap py-10"
          style={{ 
            maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
          }}
        >
          <div className="animate-marquee flex items-center gap-16 font-sans font-black text-2xl text-gray-300 uppercase tracking-widest">
            <span>DATABRICKS</span>
            <span>STANFORD</span>
            <span>MIT CSAIL</span>
            <span>OPENAI</span>
            <span>BERKELEY</span>
            <span>DATABRICKS</span>
            <span>STANFORD</span>
            <span>MIT CSAIL</span>
            <span>OPENAI</span>
            <span>BERKELEY</span>
            <span>DATABRICKS</span>
            <span>STANFORD</span>
            <span>MIT CSAIL</span>
            <span>OPENAI</span>
            <span>BERKELEY</span>
          </div>
        </div>
      </Reveal>

      {/* Bottom Image */}
      <Reveal delay={0.4} className="w-full mx-auto mt-10">
        <div className="w-full h-[30vh] md:h-[40vh] overflow-hidden relative border border-black/5 border-b-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex items-center justify-center">
          <img 
            src="/hero-bg.png" 
            alt="Platform Interface" 
            className="absolute inset-0 w-full h-full object-cover object-center opacity-90 transition-all duration-700 blur-[3px] z-0"
          />
          
          {/* Black Film */}
          <div className="absolute inset-0 bg-black/10 z-10"></div>
          
          {/* Centered Logo */}
          <div className="relative z-20 flex flex-col items-center gap-3 text-white">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <span className="font-bold text-2xl md:text-3xl tracking-tight">Insenio Lab Match</span>
          </div>
        </div>
      </Reveal>

    </section>
  );
}
