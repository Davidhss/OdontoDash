import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, MessageSquare, Phone, Calendar, User, Clock, Send } from 'lucide-react';
import { useLeads } from '../hooks/useLeads';
import { useContatos } from '../hooks/useContatos';
import { Lead } from '../types';
import { Badge } from '../components/ui/Badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../lib/utils';

const Contatos: React.FC = () => {
  const { leads, loading: loadingLeads } = useLeads();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { contatos, createContato, loading: loadingContatos } = useContatos(selectedLeadId);
  
  const [newContato, setNewContato] = useState({
    tipo: 'WhatsApp' as any,
    direcao: 'enviado' as any,
    resumo: '',
    resultado: 'Respondeu' as any
  });

  const [isSaving, setIsSaving] = useState(false);

  const filteredLeads = useMemo(() => {
    return leads
      .filter(l => l.nome.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.ultima_atualizacao).getTime() - new Date(a.ultima_atualizacao).getTime());
  }, [leads, searchTerm]);

  const selectedLead = useMemo(() => {
    return leads.find(l => l.id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  const handleAddContato = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !newContato.resumo) return;
    
    setIsSaving(true);
    const success = await createContato({
      lead_id: selectedLeadId,
      ...newContato,
      autor: 'David'
    }, selectedLead?.nome || '');
    
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

  return (
    <div className="h-[calc(100vh-160px)] flex gap-6">
      {/* Lista de Leads */}
      <div className="w-80 flex flex-col glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border-card space-y-4">
          <h2 className="font-bold text-text-primary">Contatos</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
            <input
              type="text"
              placeholder="Buscar lead..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background-app border border-border-card rounded-xl pl-9 pr-4 py-2 text-xs focus:border-accent-primary outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {loadingLeads ? (
            <div className="p-8 text-center text-xs text-text-tertiary">Carregando leads...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-xs text-text-tertiary">Nenhum lead encontrado</div>
          ) : (
            filteredLeads.map((lead) => (
              <button
                key={lead.id}
                onClick={() => setSelectedLeadId(lead.id)}
                className={cn(
                  "w-full p-4 flex items-start gap-3 border-b border-border-card/50 transition-all hover:bg-background-app/50 text-left",
                  selectedLeadId === lead.id ? "bg-accent-primary/5 border-l-4 border-l-accent-primary" : "border-l-4 border-l-transparent"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary font-bold flex-shrink-0">
                  {lead.nome.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-sm text-text-primary truncate">{lead.nome}</h4>
                    <span className="text-[9px] text-text-tertiary">
                      {format(new Date(lead.ultima_atualizacao), "HH:mm")}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-secondary truncate uppercase font-bold tracking-wider">{lead.servico}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5">{lead.fonte}</Badge>
                    <Badge variant="primary" className="text-[8px] px-1 py-0 h-3.5 capitalize">{lead.etapa.replace('_', ' ')}</Badge>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Histórico e Registro */}
      <div className="flex-1 flex flex-col glass-card rounded-2xl overflow-hidden">
        {selectedLead ? (
          <>
            {/* Header do Lead Selecionado */}
            <div className="p-6 border-b border-border-card flex items-center justify-between bg-background-sidebar/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent-primary/20 flex items-center justify-center text-accent-primary font-bold text-lg">
                  {selectedLead.nome.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-lg leading-tight">{selectedLead.nome}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-text-secondary flex items-center gap-1">
                      <Phone size={12} /> {selectedLead.telefone}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-text-tertiary" />
                    <span className="text-xs text-text-secondary flex items-center gap-1">
                      <Clock size={12} /> Lead desde {format(new Date(selectedLead.created_at), "dd/MM/yyyy")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2.5 rounded-xl bg-background-app border border-border-card text-text-secondary hover:text-accent-primary transition-all">
                  <Phone size={20} />
                </button>
                <button className="p-2.5 rounded-xl bg-accent-primary text-background-app hover:opacity-90 transition-all">
                  <MessageSquare size={20} />
                </button>
              </div>
            </div>

            {/* Histórico de Timeline */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide bg-background-app/20">
              <div className="space-y-6 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border-card">
                {loadingContatos ? (
                  <div className="text-center py-8 text-sm text-text-tertiary">Carregando histórico...</div>
                ) : contatos.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-background-app border border-border-card flex items-center justify-center text-text-tertiary">
                      <MessageSquare size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-text-secondary">Nenhum contato registrado</p>
                      <p className="text-xs text-text-tertiary">Comece registrando sua primeira conversa abaixo.</p>
                    </div>
                  </div>
                ) : (
                  contatos.map((c, index) => (
                    <motion.div 
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative pl-10"
                    >
                      <div className={cn(
                        "absolute left-0 top-1 w-8 h-8 rounded-xl flex items-center justify-center border border-border-card z-10 shadow-sm",
                        c.tipo === 'WhatsApp' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-accent-primary/10 text-accent-primary'
                      )}>
                        {c.tipo === 'WhatsApp' ? <MessageSquare size={14} /> : <Phone size={14} />}
                      </div>
                      <div className="bg-background-sidebar border border-border-card rounded-2xl p-5 space-y-3 hover:border-accent-primary/30 transition-all shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-text-primary uppercase tracking-widest">{c.tipo} - {c.direcao}</span>
                            <Badge variant={c.resultado === 'Agendou' ? 'success' : 'outline'} className="text-[9px] px-1.5 py-0 h-4">
                              {c.resultado.toUpperCase()}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-text-tertiary font-medium">
                            {format(new Date(c.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed">{c.resumo}</p>
                        <div className="flex items-center gap-2 pt-2 border-t border-border-card/50">
                          <div className="w-5 h-5 rounded-full bg-accent-primary/20 flex items-center justify-center text-[8px] font-bold text-accent-primary">
                            {c.autor[0]}
                          </div>
                          <span className="text-[10px] text-text-tertiary font-medium">Registrado por {c.autor}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Input de Registro */}
            <div className="p-6 border-t border-border-card bg-background-sidebar/50">
              <form onSubmit={handleAddContato} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {['WhatsApp', 'Ligação', 'Email'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewContato({...newContato, tipo: t})}
                        className={cn(
                          "px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                          newContato.tipo === t ? "bg-accent-primary/10 border-accent-primary text-accent-primary" : "bg-background-app border-border-card text-text-tertiary"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {['Respondeu', 'Sem resposta', 'Agendou', 'Recusou'].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setNewContato({...newContato, resultado: r as any})}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                          newContato.resultado === r ? "bg-accent-secondary/10 border-accent-secondary text-accent-secondary" : "bg-background-app border-border-card text-text-tertiary"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <textarea 
                    required
                    rows={2}
                    value={newContato.resumo}
                    onChange={e => setNewContato({...newContato, resumo: e.target.value})}
                    placeholder="Resuma o que foi conversado com o lead..."
                    className="w-full bg-background-app border border-border-card rounded-2xl px-5 py-4 text-sm focus:border-accent-primary outline-none resize-none pr-16"
                  />
                  <button 
                    type="submit"
                    disabled={isSaving || !newContato.resumo}
                    className="absolute right-4 bottom-4 p-3 bg-accent-primary text-background-app rounded-xl hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-accent-primary/20"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-background-app border border-border-card flex items-center justify-center text-text-tertiary shadow-inner">
              <User size={48} />
            </div>
            <div className="max-w-xs space-y-2">
              <h3 className="text-xl font-bold text-text-primary">Selecione um Lead</h3>
              <p className="text-sm text-text-secondary">Escolha um lead na lista ao lado para visualizar o histórico de contatos e registrar novas interações.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contatos;
