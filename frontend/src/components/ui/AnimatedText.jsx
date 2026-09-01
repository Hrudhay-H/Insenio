import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function AnimatedText({ text, className, el: Wrapper = 'p', delay = 0 }) {
  // Simple word-by-word fade up animation
  const words = text.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: delay * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <Wrapper className={cn('flex flex-wrap', className)}>
      <motion.span variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="flex flex-wrap">
        {words.map((word, index) => (
          <motion.span variants={child} key={index} className="mr-[0.25em] inline-block">
            {word}
          </motion.span>
        ))}
      </motion.span>
    </Wrapper>
  );
}
