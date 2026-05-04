import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, MessageSquare, Calendar, User, Clock, Tag, Save, Trash2, Copy, DollarSign, CheckCircle2 } from 'lucide-react';
import { Lead, Contato, LeadEtapa } from '../../types';
import { Badge } from '../ui/Badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useLeads } from '../../hooks/useLeads';
import { useContatos } from '../../hooks/useContatos';
import { cn, formatCurrency } from '../../lib/utils';
import { toast } from 'react-hot-toast';

interface LeadDetailSidebarProps {
  lead: Lead | null;
  onClose: () => void;
}

export const LeadDetailSidebar: React.FC<LeadDetailSidebarProps> = ({ lead, onClose }) => {
  const { updateLead, deleteLead } = useLeads();
  const { contatos, createContato, loading: loadingContatos } = useContatos(lead?.id);
  
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    anotacoes: '',
    data_consulta: '',
    valor_fechado: 0,
    etapa: '' as LeadEtapa,
    temperatura: '' as any,
    fonte: '' as any,
    servico: '' as any,
    procedimento_interesse: '' as any,
    angulo_oferta: '' as any,
    etapa_jornada: '' as any,
    created_at: ''
  });

  const [newContato, setNewContato] = useState({
    tipo: 'WhatsApp' as any,
    direcao: 'enviado' as any,
    resumo: '',
    resultado: 'Respondeu' as any
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (lead) {
      setFormData({
        nome: lead.nome,
        telefone: lead.telefone || '',
        anotacoes: lead.anotacoes || '',
        data_consulta: lead.data_consulta ? lead.data_consulta.substring(0, 16) : '',
        valor_fechado: Number(lead.valor_fechado) || 0,
        etapa: lead.etapa,
        temperatura: lead.temperatura || 'morno',
        fonte: lead.fonte || 'Meta Ads',
        servico: lead.servico || 'Outro',
        procedimento_interesse: lead.procedimento_interesse || 'Outro',
        angulo_oferta: lead.angulo_oferta || 'Direto',
        etapa_jornada: lead.etapa_jornada || 'Descoberta',
        created_at: lead.created_at ? lead.created_at.substring(0, 10) : ''
      });
    }
  }, [lead]);

  if (!lead) return null;

  const handleUpdateLead = async () => {
    setIsSaving(true);
    const submitData = {
      ...formData,
      data_consulta: formData.data_consulta || null
    };
    await updateLead(lead.id, submitData);
    setIsSaving(false);
  };

  const handleAddContato = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContato.resumo) return;
    
    setIsSaving(true);
    const success = await createContato({
      lead_id: lead.id,
      ...newContato,
      autor: 'David'
    }, lead.nome);
    
    if (success) {
      setNewContato({
        tipo: 'WhatsApp',
        direcao: 'enviado',
        resumo: '',
        resultado: 'Respondeu'
      });
    }
    setIsSaving(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência');
  };

  return (
    <AnimatePresence>
      {lead && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full max-w-lg bg-background-sidebar border-l border-border-card z-50 shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-border-card flex items-center justify-between bg-background-sidebar/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center text-accent-primary font-bold">
                  {lead.nome.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-text-primary leading-tight">{lead.nome}</h3>
                  <p className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">Detalhes do Lead</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => deleteLead(lead.id, lead.nome).then(success => success && onClose())}
                  className="p-2 hover:bg-danger/10 text-text-tertiary hover:text-danger rounded-xl transition-colors"
                  title="Excluir Lead"
                >
                  <Trash2 size={20} />
                </button>
                <button onClick={onClose} className="p-2 hover:bg-border-card rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
              {/* Informações Básicas */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Informações Básicas</h4>
                  <button 
                    onClick={handleUpdateLead}
                    disabled={isSaving}
                    className="text-[10px] font-bold text-accent-primary uppercase tracking-widest flex items-center gap-1 hover:opacity-80 disabled:opacity-50"
                  >
                    <Save size={12} /> {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-tertiary uppercase">Nome</label>
                    <input 
                      type="text"
                      value={formData.nome}
                      onChange={e => setFormData({...formData, nome: e.target.value})}
                      className="w-full bg-background-app border border-border-card rounded-xl px-3 py-2 text-sm focus:border-accent-primary outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-tertiary uppercase">Data de Entrada do Lead</label>
                    <input 
                      type="date"
                      value={formData.created_at}
                      onChange={e => setFormData({...formData, created_at: e.target.value})}
                      className="w-full bg-background-app border border-border-card rounded-xl px-3 py-2 text-sm focus:border-accent-primary outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-tertiary uppercase">Telefone</label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={formData.telefone}
                        onChange={e => setFormData({...formData, telefone: e.target.value})}
                        className="w-full bg-background-app border border-border-card rounded-xl pl-3 pr-8 py-2 text-sm focus:border-accent-primary outline-none"
                      />
                      <button 
                        onClick={() => copyToClipboard(formData.telefone)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-tertiary uppercase">Data e Horário da Consulta</label>
                    <input 
                      type="datetime-local"
                      value={formData.data_consulta}
                      onChange={e => setFormData({...formData, data_consulta: e.target.value})}
                      className="w-full bg-background-app border border-border-card rounded-xl px-3 py-2 text-sm focus:border-accent-primary outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-tertiary uppercase">Valor Fechado (R$)</label>
                    <input 
                      type="number"
                      value={formData.valor_fechado}
                      onChange={e => setFormData({...formData, valor_fechado: Number(e.target.value)})}
                      className="w-full bg-background-app border border-border-card rounded-xl px-3 py-2 text-sm focus:border-accent-primary outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-tertiary uppercase">Etapa</label>
                    <select
                      value={formData.etapa}
                      onChange={e => setFormData({...formData, etapa: e.target.value as any})}
                      className="w-full bg-background-app border border-border-card rounded-xl px-3 py-2 text-sm focus:border-accent-primary outline-none"
                    >
                      <option value="novo_lead">Novos Leads</option>
                      <option value="contato_feito">Contatos</option>
                      <option value="consulta_agendada">Agendados</option>
                      <option value="consulta_realizada">Consultas</option>
                      <option value="cliente_fechado">Tratamento Fechado</option>
                      <option value="perdido">Perdido</option>
                      <option value="desqualificado">Desqualificado</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-tertiary uppercase">Temperatura</label>
                    <select
                      value={formData.temperatura}
                      onChange={e => setFormData({...formData, temperatura: e.target.value as any})}
                      className="w-full bg-background-app border border-border-card rounded-xl px-3 py-2 text-sm focus:border-accent-primary outline-none"
                    >
                      <option value="quente">Quente</option>
                      <option value="morno">Morno</option>
                      <option value="frio">Frio</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-tertiary uppercase">Procedimento Interesse</label>
                    <select
                      value={formData.procedimento_interesse}
                      onChange={e => setFormData({...formData, procedimento_interesse: e.target.value as any})}
                      className="w-full bg-background-app border border-border-card rounded-xl px-3 py-2 text-sm focus:border-accent-primary outline-none"
                    >
                      <option value="Implante">Implante</option>
                      <option value="Facetas">Facetas</option>
                      <option value="Clareamento">Clareamento</option>
                      <option value="Avaliação">Avaliação</option>
                      <option value="Ortodontia">Ortodontia</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-tertiary uppercase">Fonte</label>
                    <select
                      value={formData.fonte}
                      onChange={e => setFormData({...formData, fonte: e.target.value as any})}
                      className="w-full bg-background-app border border-border-card rounded-xl px-3 py-2 text-sm focus:border-accent-primary outline-none"
                    >
                      <option value="Meta Ads">Meta Ads</option>
                      <option value="Google">Google</option>
                      <option value="Indicação">Indicação</option>
                      <option value="Instagram Orgânico">Instagram Orgânico</option>
                      <option value="Caminhada">Caminhada</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-tertiary uppercase">Anotações</label>
                  <textarea 
                    rows={3}
                    value={formData.anotacoes}
                    onChange={e => setFormData({...formData, anotacoes: e.target.value})}
                    className="w-full bg-background-app border border-border-card rounded-xl px-3 py-2 text-sm focus:border-accent-primary outline-none resize-none"
                  />
                </div>
              </section>

              {/* Registro de Contato */}
              <section className="space-y-4 bg-background-app/50 p-4 rounded-2xl border border-border-card">
                <h4 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Registrar Novo Contato</h4>
                <form onSubmit={handleAddContato} className="space-y-3">
                  <div className="flex gap-2">
                    {['WhatsApp', 'Ligação', 'Email'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewContato({...newContato, tipo: t})}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all",
                          newContato.tipo === t ? "bg-accent-primary/10 border-accent-primary text-accent-primary" : "bg-background-sidebar border-border-card text-text-tertiary"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <textarea 
                    required
                    rows={2}
                    value={newContato.resumo}
                    onChange={e => setNewContato({...newContato, resumo: e.target.value})}
                    placeholder="O que foi conversado?"
                    className="w-full bg-background-sidebar border border-border-card rounded-xl px-3 py-2 text-sm focus:border-accent-primary outline-none resize-none"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <select
                      value={newContato.resultado}
                      onChange={e => setNewContato({...newContato, resultado: e.target.value as any})}
                      className="bg-background-sidebar border border-border-card rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider outline-none"
                    >
                      <option value="Respondeu">Respondeu</option>
                      <option value="Sem resposta">Sem resposta</option>
                      <option value="Agendou">Agendou</option>
                      <option value="Recusou">Recusou</option>
                    </select>
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-1.5 bg-accent-primary text-background-app rounded-lg text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      Registrar
                    </button>
                  </div>
                </form>
              </section>

              {/* Histórico de Contatos */}
              <section className="space-y-4">
                <h4 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Histórico de Contatos</h4>
                <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border-card">
                  {loadingContatos ? (
                    <div className="text-center py-4 text-xs text-text-tertiary">Carregando histórico...</div>
                  ) : contatos.length === 0 ? (
                    <div className="text-center py-4 text-xs text-text-tertiary">Nenhum contato registrado</div>
                  ) : (
                    contatos.map((c) => (
                      <div key={c.id} className="relative pl-8">
                        <div className={cn(
                          "absolute left-0 top-1 w-6 h-6 rounded-lg flex items-center justify-center border border-border-card z-10",
                          c.tipo === 'WhatsApp' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-accent-primary/10 text-accent-primary'
                        )}>
                          {c.tipo === 'WhatsApp' ? <MessageSquare size={12} /> : <Phone size={12} />}
                        </div>
                        <div className="bg-background-app border border-border-card rounded-xl p-3 space-y-1 hover:border-text-tertiary transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">{c.tipo} - {c.direcao}</span>
                            <span className="text-[9px] text-text-tertiary">{format(new Date(c.created_at), "dd/MM HH:mm")}</span>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed">{c.resumo}</p>
                          <div className="flex items-center gap-2 pt-1">
                            <Badge variant={c.resultado === 'Agendou' ? 'success' : 'outline'} className="text-[8px] px-1 py-0 h-3.5">
                              {c.resultado.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
