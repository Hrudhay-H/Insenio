import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll } from 'framer-motion';
import { Bot, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 10);
    });
  }, [scrollY]);

  return (
    <motion.nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white",
        isScrolled ? "border-b border-black/5 shadow-sm py-4" : "py-6 border-b border-transparent"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 xl:px-16 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <Bot className="w-6 h-6 text-blue" />
          <span className="font-bold text-xl tracking-tight">Insenio Lab Match</span>
        </div>

        {/* Center Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-8">
          {['For Students', 'For Faculty', 'How it works', 'Docs'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className="text-sm font-medium text-black/70 hover:text-black transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          <Link to="/login" className="hidden sm:block text-sm font-medium text-gray-500 hover:text-black transition-colors">
            Login
          </Link>
          <Link to="/dashboard" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0066FF] text-white text-sm font-bold shadow-md hover:bg-blue-600 transition-colors">
            Find a Lab <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </motion.nav>
  );
}
