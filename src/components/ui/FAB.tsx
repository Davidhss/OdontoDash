import React, { useState } from 'react';
import { Plus, UserPlus, MessageSquare, BarChart3, X, Video, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface FABProps {
  onNewLead: () => void;
  onRegisterContact: () => void;
  onLaunchMetrics: () => void;
  onRegisterApologia: () => void;
}

export const FAB: React.FC<FABProps> = ({ onNewLead, onRegisterContact, onLaunchMetrics, onRegisterApologia }) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: UserPlus,
      label: 'Novo lead',
      description: 'Adicionar novo paciente',
      onClick: onNewLead,
      color: 'bg-accent-primary',
      glow: 'shadow-[0_0_20px_rgba(10,126,106,0.4)]',
      hover: 'hover:shadow-[0_0_30px_rgba(10,126,106,0.6)]'
    },
    {
      icon: MessageSquare,
      label: 'Registrar contato',
      description: 'Registro de interação',
      onClick: onRegisterContact,
      color: 'bg-accent-secondary',
      glow: 'shadow-[0_0_20px_rgba(13,148,136,0.4)]',
      hover: 'hover:shadow-[0_0_30px_rgba(13,148,136,0.6)]'
    },
    {
      icon: Video,
      label: 'Registrar depoimento',
      description: 'Novo vídeo de apologia',
      onClick: onRegisterApologia,
      color: 'bg-emerald-500',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
      hover: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]'
    },
    {
      icon: BarChart3,
      label: 'Lançar métricas',
      description: 'Dados de anúncios',
      onClick: onLaunchMetrics,
      color: 'bg-accent-alert',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
      hover: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.6)]'
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-end gap-3 mb-2"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: 50, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.8 }}
                transition={{
                  delay: index * 0.06,
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 group pointer-events-auto"
              >
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 + 0.1 }}
                  className="flex flex-col items-end"
                >
                  <span className="bg-background-card border border-border-card px-4 py-2 rounded-xl text-sm font-bold text-text-primary shadow-xl whitespace-nowrap">
                    {action.label}
                  </span>
                  <span className="text-xs text-text-tertiary mr-2 -mt-0.5">{action.description}</span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all duration-300",
                    action.color,
                    action.glow,
                    action.hover
                  )}
                >
                  <action.icon size={20} />
                </motion.div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.08, rotate: isOpen ? 90 : 0, opacity: 1 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-300 relative overflow-hidden backdrop-blur-md pointer-events-auto",
          isOpen ? "bg-gradient-to-br from-danger-600 to-danger-500 opacity-100" : "bg-gradient-to-br from-accent-primary/70 to-accent-secondary/70 opacity-70 hover:opacity-100 shadow-[0_0_20px_rgba(10,126,106,0.3)] hover:shadow-[0_0_30px_rgba(10,126,106,0.6)]"
        )}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
          animate={isOpen ? {} : { x: ['100%', '-100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
        />
        {isOpen ? <X size={24} className="relative z-10" /> : <Plus size={24} className="relative z-10" />}
      </motion.button>
    </div>
  );
};
