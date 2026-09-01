import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function ContextNode({ title, description, delay = 0, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.03, y: -2 }}
      className={cn(
        "group relative flex flex-col items-start justify-center p-4",
        "rounded-2xl border border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md",
        "hover:border-blue/30 transition-colors duration-300",
        className
      )}
    >
      <div className="absolute inset-0 rounded-2xl bg-brand-gradient opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300" />
      <span className="text-sm font-mono text-white/40 mb-1 group-hover:text-blue-light/80 transition-colors duration-300">
        {title}
      </span>
      {description && (
        <p className="text-white/80 text-sm mt-1 max-w-[200px]">
          {description}
        </p>
      )}
    </motion.div>
  );
}
