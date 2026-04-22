import React from 'react';
import { motion } from 'motion/react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4 overflow-hidden relative">
      <div className="h-4 w-24 bg-border-card rounded animate-pulse" />
      <div className="h-8 w-32 bg-border-card rounded animate-pulse" />
      <div className="h-4 w-48 bg-border-card rounded animate-pulse" />
      
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full"
        animate={{ x: ['100%', '-100%'] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
      />
    </div>
  );
};
