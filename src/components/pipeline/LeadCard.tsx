import React from 'react';
import { motion } from 'motion/react';
import { Flame, Snowflake, Zap, MessageCircle, MoreVertical, Calendar, DollarSign, Phone, MapPin } from 'lucide-react';
import { Lead } from '../../types';
import { Badge } from '../ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn, formatCurrency } from '../../lib/utils';

interface LeadCardProps {
  lead: Lead;
  onClick?: () => void;
  isOverlay?: boolean;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick, isOverlay }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const tempConfig = {
    quente: { icon: Flame, color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20' },
    morno: { icon: Zap, color: 'text-accent-alert', bg: 'bg-accent-alert/10', border: 'border-accent-alert/20' },
    frio: { icon: Snowflake, color: 'text-accent-secondary', bg: 'bg-accent-secondary/10', border: 'border-accent-secondary/20' },
  };

  const sourceColors: Record<string, string> = {
    'Meta Ads': 'primary',
    'Google': 'secondary',
    'Indicação': 'alert',
    'Instagram Orgânico': 'secondary',
    'Caminhada': 'outline',
    'Outro': 'outline',
  };

  const TempIcon = tempConfig[lead.temperatura].icon;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "bg-background-sidebar border border-border-card p-4 rounded-xl cursor-grab active:cursor-grabbing transition-all group relative overflow-hidden",
        isDragging && "opacity-50 grayscale scale-95",
        isOverlay && "cursor-grabbing shadow-2xl border-accent-primary rotate-2 scale-105 z-50"
      )}
    >
      {/* Hover effect background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <motion.div whileHover={{ scale: 1.05 }}>
            <Badge variant={sourceColors[lead.fonte] as any || 'outline'}>{lead.fonte}</Badge>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.95 }}
            className={cn(tempConfig[lead.temperatura].bg, "p-1.5 rounded-lg border", tempConfig[lead.temperatura].border)}
          >
            <TempIcon size={14} className={tempConfig[lead.temperatura].color} />
          </motion.div>
        </div>

        <h4 className="font-bold text-text-primary mb-1 group-hover:text-accent-primary transition-colors truncate">
          {lead.nome}
        </h4>

        <div className="flex flex-col gap-1.5 mb-3">
          {lead.telefone && (
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-text-tertiary">
              <Phone size={10} />
              <span className="truncate">{lead.telefone}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
              {lead.procedimento_interesse || lead.servico}
            </span>
            <span className="text-[10px] font-medium text-text-tertiary/60">•</span>
            <span className="text-[10px] font-medium text-text-tertiary/60">{lead.angulo_oferta}</span>
          </div>
          {lead.data_consulta && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 text-[10px] font-bold text-accent-secondary"
            >
              <Calendar size={10} />
              <span>{new Date(lead.data_consulta).toLocaleDateString('pt-BR')}</span>
            </motion.div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border-card/50">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[10px] text-text-tertiary font-medium"
          >
            {formatDistanceToNow(new Date(lead.ultima_atualizacao), { addSuffix: true, locale: ptBR })}
          </motion.span>

          <div className="flex items-center gap-2">
            {lead.valor_fechado && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg"
              >
                <DollarSign size={10} />
                <span>{formatCurrency(Number(lead.valor_fechado))}</span>
              </motion.div>
            )}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-lg hover:bg-border-card text-text-tertiary transition-colors"
            >
              <MoreVertical size={16} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Animated border for new leads */}
      {lead.etapa === 'novo_lead' && (
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-accent-primary to-accent-secondary"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.5, delay: 0.3 }}
        />
      )}
    </motion.div>
  );
};
