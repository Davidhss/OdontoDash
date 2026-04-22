import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, TrendingUp, BarChart3, Plus, ArrowRight, 
  Sparkles, Target, Star 
} from 'lucide-react';

interface EmptyStateDashboardProps {
  onAddLead?: () => void;
}

export const EmptyStateDashboard: React.FC<EmptyStateDashboardProps> = ({ onAddLead }) => {
  const features = [
    { icon: Users, title: 'Gestão de Leads', desc: 'Acompanhe cada lead do primeiro contato ao fechamento' },
    { icon: TrendingUp, title: 'Funil de Vendas', desc: 'Visualize a jornada completa dos seus pacientes' },
    { icon: BarChart3, title: 'Análise de Anúncios', desc: 'Monitore ROAS, CPL e performance das campanhas' },
    { icon: Target, title: 'Metas e KPIs', desc: 'Defina e acompanhe metas mensais em tempo real' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[70vh] relative"
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-primary rounded-full blur-[120px]"
        />
      </div>

      <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 border border-accent-primary/20 flex items-center justify-center shadow-[0_0_60px_rgba(10,126,106,0.2)]"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="text-accent-primary" size={40} />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-black text-text-primary mb-4 tracking-tight"
        >
          Sua clínica está pronta!
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-text-secondary mb-12 leading-relaxed"
        >
          Adicione seu primeiro lead para começar a acompanhar o crescimento da sua clínica em tempo real.
        </motion.p>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddLead}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-2xl font-bold text-lg shadow-[0_0_40px_rgba(10,126,106,0.4)] hover:shadow-[0_0_60px_rgba(10,126,106,0.6)] transition-all mb-16"
        >
          <Plus size={22} />
          Adicionar Primeiro Lead
          <ArrowRight size={22} />
        </motion.button>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {features.map((feature, i) => (
            <motion.div
              key={`empty-feature-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="glass-card p-5 rounded-2xl text-center group cursor-default"
            >
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="w-12 h-12 mx-auto mb-3 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary group-hover:bg-accent-primary/20 transition-colors"
              >
                <feature.icon size={22} />
              </motion.div>
              <h4 className="text-sm font-bold text-text-primary mb-1">{feature.title}</h4>
              <p className="text-xs text-text-tertiary leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 flex items-center justify-center gap-2 text-text-tertiary"
        >
          <Star size={14} className="text-accent-alert" />
          <span className="text-xs">Dica: Use o botão <span className="font-bold text-text-secondary">"+  Novo Lead"</span> no cabeçalho ou o botão flutuante</span>
        </motion.div>
      </div>
    </motion.div>
  );
};
