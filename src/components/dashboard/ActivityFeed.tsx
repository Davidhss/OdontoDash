import React from 'react';
import { motion } from 'motion/react';
import { Calendar, UserPlus, CheckCircle2, DollarSign, MessageSquare, Target } from 'lucide-react';
import { Atividade } from '../../types';
import { Badge } from '../ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const iconMap: Record<string, any> = {
  lead_criado: { icon: UserPlus, color: 'primary', label: 'LEAD' },
  etapa_mudada: { icon: CheckCircle2, color: 'success', label: 'ETAPA' },
  contato_registrado: { icon: MessageSquare, color: 'secondary', label: 'CONTATO' },
  consulta_agendada: { icon: Calendar, color: 'secondary', label: 'AGENDADO' },
  cliente_fechado: { icon: DollarSign, color: 'alert', label: 'FECHADO' },
  meta_atualizada: { icon: Target, color: 'primary', label: 'META' },
};

interface ActivityFeedProps {
  activities: Atividade[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  return (
    <div className="glass-card rounded-2xl p-8 h-full overflow-hidden flex flex-col">
      <h3 className="text-xl font-bold text-text-primary mb-2">Atividade Recente</h3>
      <p className="text-sm text-text-secondary mb-8">Interações em tempo real com leads</p>

      <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-hide">
        {activities.map((item, index) => {
          const config = iconMap[item.tipo] || { icon: UserPlus, color: 'primary', label: 'INFO' };
          const Icon = config.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-start gap-4 group"
            >
              <div className={`p-2.5 rounded-xl bg-background-sidebar border border-border-card text-text-primary group-hover:border-accent-primary/50 transition-colors`}>
                <Icon size={18} className={
                  item.tipo === 'lead_criado' ? 'text-accent-primary' : 
                  item.tipo === 'contato_registrado' ? 'text-accent-secondary' : 
                  item.tipo === 'cliente_fechado' ? 'text-accent-alert' : 
                  'text-emerald-500'
                } />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary truncate">{item.descricao}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-text-tertiary font-medium">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-text-tertiary" />
                  <Badge variant={config.color as any} className="px-1.5 py-0 h-4 text-[9px]">
                    {config.label}
                  </Badge>
                </div>
              </div>
            </motion.div>
          );
        })}
        {activities.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-text-tertiary gap-2">
            <p className="text-sm font-medium">Nenhuma atividade recente</p>
          </div>
        )}
      </div>
    </div>
  );
};
