import React from 'react';
import { cn } from '../../lib/utils';

export function GradientText({ children, className }) {
  return (
    <span className={cn("text-brand-gradient inline-block font-semibold", className)}>
      {children}
    </span>
  );
}
