import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useFollowUp } from '../hooks/useFollowUp';
import { useLeads } from '../hooks/useLeads';
import { format, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  MessageCircle, 
  Copy, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Search,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const TEMPLATES = [
  { 
    title: 'Primeiro Contato', 
    text: 'Olá [NOME], tudo bem? Aqui é da Odonto Prime. Vimos que você se interessou por [PROCEDIMENTO]. Gostaria de agendar uma avaliação com nossos especialistas?' 
  },
  { 
    title: 'Lembrete de Consulta', 
    text: 'Olá [NOME], confirmando sua consulta para amanhã às [HORA]. Podemos contar com sua presença?' 
  },
  { 
    title: 'Pós-Consulta (Não Fechou)', 
    text: 'Olá [NOME], tudo bem? Ficamos muito felizes com sua visita. Ficou alguma dúvida sobre o plano de tratamento de [PROCEDIMENTO] que conversamos?' 
  },
  { 
    title: 'Reativação (6 meses)', 
    text: 'Olá [NOME], quanto tempo! Está na hora de fazer sua limpeza semestral para manter seu sorriso saudável. Vamos agendar?' 
  }
];

const FollowUp: React.FC = () => {
  const { followUps, loading, markAsRealizado } = useFollowUp();
  const { leads } = useLeads();
  const [searchTerm, setSearchTerm] = useState('');

  const pendingFollowUps = followUps.filter(f => !f.realizado);

  const getLeadName = (leadId: string) => {
    return leads.find(l => l.id === leadId)?.nome || 'Lead Desconhecido';
  };

  const getLeadProcedure = (leadId: string) => {
    return leads.find(l => l.id === leadId)?.procedimento_interesse || 'Tratamento';
  };

  const copyToClipboard = (text: string, leadId: string) => {
    const leadName = getLeadName(leadId);
    const procedure = getLeadProcedure(leadId);
    const personalized = text
      .replace('[NOME]', leadName.split(' ')[0])
      .replace('[PROCEDIMENTO]', procedure);
    
    navigator.clipboard.writeText(personalized);
    toast.success('Mensagem copiada!');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Gestão de Follow-up</h1>
          <p className="text-sm text-text-secondary">Acompanhe leads pendentes e utilize templates de conversão</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
          <input
            type="text"
            placeholder="Buscar por paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-background-card border border-border-card rounded-xl pl-10 pr-4 py-2 text-sm focus:border-accent-primary outline-none w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Follow-ups */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Clock className="text-accent-primary" size={20} />
            Próximas Ações
          </h2>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {pendingFollowUps.length === 0 ? (
              <div className="bg-background-card border border-border-card rounded-3xl p-12 text-center">
                <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4 opacity-20" />
                <p className="text-text-secondary font-medium">Tudo em dia! Nenhum follow-up pendente.</p>
              </div>
            ) : (
              pendingFollowUps.map((follow) => {
                const isAtrasado = isPast(new Date(follow.data_prevista)) && !isToday(new Date(follow.data_prevista));
                return (
                  <motion.div
                    key={follow.id}
                    variants={itemVariants}
                    className={cn(
                      "bg-background-card border p-6 rounded-3xl transition-all hover:shadow-lg group",
                      isAtrasado ? "border-danger/30 bg-danger/[0.02]" : "border-border-card"
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center text-white",
                          isAtrasado ? "bg-danger" : "bg-accent-primary"
                        )}>
                          <MessageCircle size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                            {getLeadName(follow.lead_id)}
                          </h3>
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-tertiary">
                            <span>{getLeadProcedure(follow.lead_id)}</span>
                            <span>•</span>
                            <span className={cn(isAtrasado ? "text-danger" : "text-accent-primary")}>
                              {format(new Date(follow.data_prevista), "dd 'de' MMMM", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isAtrasado && (
                        <div className="flex items-center gap-1.5 bg-danger/10 text-danger px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                          <AlertCircle size={12} />
                          Atrasado
                        </div>
                      )}
                    </div>

                    <div className="bg-background-sidebar border border-border-card rounded-2xl p-4 mb-4 italic text-sm text-text-secondary">
                      "{follow.mensagem_template}"
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => copyToClipboard(follow.mensagem_template, follow.lead_id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-background-sidebar border border-border-card py-2.5 rounded-xl text-sm font-bold text-text-primary hover:bg-border-card transition-all"
                      >
                        <Copy size={16} />
                        Copiar Mensagem
                      </button>
                      <button 
                        onClick={() => markAsRealizado(follow.id, 'Mensagem Enviada')}
                        className="flex-1 flex items-center justify-center gap-2 bg-accent-primary text-white py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
                      >
                        <CheckCircle2 size={16} />
                        Marcar como Feito
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </div>

        {/* Templates Sidebar */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Copy className="text-accent-primary" size={20} />
            Templates Recomendados
          </h2>

          <div className="space-y-4">
            {TEMPLATES.map((template, i) => (
              <div 
                key={i}
                className="bg-background-card border border-border-card p-5 rounded-3xl hover:border-accent-primary/50 transition-all cursor-pointer group"
                onClick={() => {
                  navigator.clipboard.writeText(template.text);
                  toast.success('Template copiado!');
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-sm text-text-primary group-hover:text-accent-primary transition-colors">{template.title}</h4>
                  <Copy size={14} className="text-text-tertiary" />
                </div>
                <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                  {template.text}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-accent-primary/5 border border-accent-primary/20 p-6 rounded-3xl mt-8">
            <h4 className="font-bold text-accent-primary mb-2 flex items-center gap-2">
              <ExternalLink size={16} />
              Dica de Conversão
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Leads que recebem follow-up em menos de 24h têm 7x mais chances de agendar uma consulta. Use os templates para agilizar seu atendimento!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowUp;

import { cn } from '../lib/utils';
