import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 right-8 z-[100] flex items-center gap-3 bg-accent-primary text-background-app px-6 py-4 rounded-xl shadow-xl font-bold"
        >
          <CheckCircle2 size={20} />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
