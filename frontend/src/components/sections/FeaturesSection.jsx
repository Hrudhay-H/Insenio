import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal } from '../ui/Reveal';
import { cn } from '../../lib/utils';

const FEATURES = [
  {
    id: '01',
    category: 'PROFILE',
    title: 'Conversational Profile',
    shortDesc: 'Build your profile through conversation.',
    description: 'Tell Insenio about your skills, interests, academic background, and availability naturally instead of filling out long forms. Insenio asks follow-up questions when your interests are vague and turns the conversation into a structured student profile. Your profile can evolve as your skills and interests change.',
    image: '/feature1.png'
  },
  {
    id: '02',
    category: 'DISCOVERY',
    title: 'Explore Research Labs',
    shortDesc: 'Discover labs beyond your network.',
    description: 'Browse research opportunities through a marketplace-style experience rather than relying on referrals or cold emails. Explore labs across different research areas, filter by commitment and availability, and see which labs are actively taking students. This turns research discovery from network-gated to data-driven.',
    image: '/feature2.png'
  },
  {
    id: '03',
    category: 'MATCHING',
    title: 'Transparent Lab Matching',
    shortDesc: 'See why a lab matches you.',
    description: 'Instead of hiding everything behind one mysterious compatibility score, we break a match into understandable signals: skill overlap, interest alignment, and availability. Every recommendation comes with specific reasons explaining where you fit and where you don\'t.',
    image: '/feature3.png'
  },
  {
    id: '04',
    category: 'ANALYSIS',
    title: 'Skill Gap Analysis',
    shortDesc: 'Know what stands between you and the lab.',
    description: 'See exactly which skills a research lab expects and how your current abilities compare. Missing a skill doesn\'t automatically eliminate an opportunity — meaningful interest can surface a lab as a Stretch Pick, showing you what you need to build toward.',
    image: '/feature4.png'
  },
  {
    id: '05',
    category: 'ASSISTANT',
    title: 'Insenio Research Assistant',
    shortDesc: 'Ask for research opportunities in plain language.',
    description: 'Use Insenio to explore the research landscape conversationally. Ask questions such as which labs need Python, which opportunities have open capacity, or which research areas align with your interests. Insenio queries the underlying structured lab data instead of acting as a generic chatbot.',
    image: '/feature5.png'
  },
  {
    id: '06',
    category: 'APPLICATION',
    title: 'Apply Assist',
    shortDesc: 'Turn a good match into a thoughtful application.',
    description: 'Once you find a promising lab, Insenio helps draft a personalized outreach message using your actual skills and interests. If the lab has additional questions, Insenio can help draft those answers too. You always review and edit the message before anything is sent — no autonomous applications.',
    image: '/feature6.png'
  }
];

export function FeaturesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeFeature = FEATURES[activeIndex];

  // Auto-cycle through features every 5 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % FEATURES.length);
    }, 5000);
    return () => clearInterval(timer); // Reset timer when user manually clicks
  }, [activeIndex]);

  return (
    <section id="how-it-works" className="py-24 bg-white border-t border-black/5 relative">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-12">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-gray-400">
            <span className="text-blue">›</span> PRODUCT CATALOG
          </div>
          <div className="text-[10px] font-bold tracking-widest text-gray-400 font-mono">
            [ {activeIndex + 1} / {FEATURES.length} ]
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">
          
          {/* Left Column - List */}
          <div className="lg:col-span-5 flex flex-col">
            
            <Reveal>
              <h2 className="text-4xl sm:text-5xl font-medium tracking-tight leading-[1.05] text-black mb-6 pr-4">
                All the tools to find the perfect lab <span className="text-blue">for your research.</span>
              </h2>
              <p className="text-sm font-medium text-gray-500 mb-12 pr-4 leading-relaxed">
                Focused primitives for profile building, discovering, analyzing, and applying to research labs.
              </p>
            </Reveal>

            <div className="flex flex-col border-t border-gray-100 pt-2 gap-1">
              {FEATURES.map((feature, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={feature.id}
                    onClick={() => setActiveIndex(idx)}
                    className={cn(
                      "flex items-center py-4 px-4 transition-all relative text-left group rounded-lg",
                      isActive ? "bg-black shadow-lg" : "hover:bg-gray-50 border-b border-gray-100/50"
                    )}
                  >
                    <span className={cn(
                      "text-[10px] font-mono font-bold w-12",
                      isActive ? "text-[#0066FF]" : "text-gray-400"
                    )}>
                      {feature.id}
                    </span>
                    <span className={cn(
                      "text-[15px] font-medium flex-1",
                      isActive ? "text-white" : "text-gray-500 group-hover:text-black"
                    )}>
                      {feature.title}
                    </span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 bg-[#0066FF] ml-4" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column - Image & Details */}
          <div className="lg:col-span-7 flex flex-col pl-0 lg:pl-12">
            
            <Reveal className="w-full flex-1">
              {/* Image Container */}
              <div className="w-full aspect-[4/3] bg-gray-50 relative flex items-center justify-center mb-10 group overflow-hidden rounded-xl border border-black/5 shadow-sm">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <img
                      src={activeFeature.image}
                      alt={activeFeature.title}
                      className="w-full h-full object-cover drop-shadow-sm relative z-10"
                      onError={(e) => {
                        e.target.style.opacity = '0';
                      }}
                    />
                    {/* Fallback visible if image fails or before it loads */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 m-8 z-0">
                      <span className="font-mono text-sm">{activeFeature.image}</span>
                      <span className="text-xs mt-2 opacity-50">(Image placeholder)</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Feature Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col"
                >
                  <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-blue mb-4">
                    <span>{activeFeature.id}</span>
                    <span className="text-gray-300">•</span>
                    <span>{activeFeature.category}</span>
                  </div>
                  
                  <h3 className="text-3xl sm:text-4xl font-medium tracking-tight text-black mb-4">
                    {activeFeature.title}
                  </h3>
                  
                  <h4 className="text-lg font-medium text-black mb-4">
                    {activeFeature.shortDesc}
                  </h4>
                  
                  <p className="text-gray-500 leading-relaxed font-medium">
                    {activeFeature.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </Reveal>

          </div>
        </div>
      </div>
    </section>
  );
}
