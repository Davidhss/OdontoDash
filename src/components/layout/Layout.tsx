import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { FAB } from '../ui/FAB';
import { ModalNovoLead } from '../ui/ModalNovoLead';
import { ModalRegistrarContato } from '../ui/ModalRegistrarContato';
import { ModalLancamentoMetricas } from '../ui/ModalLancamentoMetricas';
import { useBusiness } from '../../hooks/useBusiness';
import { WelcomeScreen } from '../ui/WelcomeScreen';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const { loading: businessLoading, activeBusiness, businesses } = useBusiness();

  if (businessLoading) {
    return (
      <div className="min-h-screen bg-background-app flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-accent-secondary/20 border-t-accent-secondary rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-text-secondary font-bold"
          >
            Carregando seu ambiente...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (businesses.length === 0) {
    return <WelcomeScreen />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background-app text-text-primary flex"
    >
      <Sidebar />

      <main className="flex-1 ml-[80px] md:ml-[240px] transition-all duration-300">
        <Header onAddLead={() => setIsLeadModalOpen(true)} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 max-w-[1600px] mx-auto"
        >
          {children}
        </motion.div>
      </main>

      <FAB
        onNewLead={() => setIsLeadModalOpen(true)}
        onRegisterContact={() => setIsContactModalOpen(true)}
        onLaunchMetrics={() => setIsMetricsModalOpen(true)}
        onRegisterApologia={() => navigate('/apologia')}
      />

      <AnimatePresence>
        <ModalNovoLead
          isOpen={isLeadModalOpen}
          onClose={() => setIsLeadModalOpen(false)}
        />

        <ModalRegistrarContato
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />

        <ModalLancamentoMetricas
          isOpen={isMetricsModalOpen}
          onClose={() => setIsMetricsModalOpen(false)}
        />
      </AnimatePresence>
    </motion.div>
  );
};
