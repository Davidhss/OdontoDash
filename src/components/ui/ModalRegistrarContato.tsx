import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useLeads } from '../../hooks/useLeads';
import { useContatos } from '../../hooks/useContatos';
import { Search, Phone, MessageCircle, Mail, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Lead } from '../../types';

interface ModalRegistrarContatoProps {
  isOpen: boolean;
  onClose: () => void;
  initialLeadId?: string;
}

export const ModalRegistrarContato: React.FC<ModalRegistrarContatoProps> = ({ isOpen, onClose, initialLeadId }) => {
  const { leads } = useLeads();
  const { createContato } = useContatos();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'WhatsApp' as any,
    direcao: 'enviado' as any,
    resumo: '',
    resultado: 'Respondeu' as any
  });

  useEffect(() => {
    if (initialLeadId && leads.length > 0) {
      const lead = leads.find(l => l.id === initialLeadId);
      if (lead) setSelectedLead(lead);
    }
  }, [initialLeadId, leads, isOpen]);

  const filteredLeads = leads.filter(l => 
    l.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.telefone?.includes(searchTerm)
  ).slice(0, 5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    
    setLoading(true);
    const success = await createContato({
      lead_id: selectedLead.id,
      ...formData,
      autor: 'David'
    }, selectedLead.nome);
    
    setLoading(false);
    if (success) {
      setFormData({
        tipo: 'WhatsApp',
        direcao: 'enviado',
        resumo: '',
        resultado: 'Respondeu'
      });
      setSelectedLead(null);
      setSearchTerm('');
      onClose();
    }
  };

  const tipos = [
    { id: 'WhatsApp', icon: MessageCircle, label: 'WhatsApp' },
    { id: 'Ligação', icon: Phone, label: 'Ligação' },
    { id: 'Email', icon: Mail, label: 'Email' },
    { id: 'Presencial', icon: Users, label: 'Presencial' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Contato Rápido">
      <form onSubmit={handleSubmit} className="space-y-5">
        {!selectedLead ? (
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Buscar Lead *</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Nome ou telefone..."
                className="w-full bg-background-sidebar border border-border-card rounded-xl pl-10 pr-4 py-2.5 focus:border-accent-primary outline-none"
              />
            </div>
            {searchTerm && filteredLeads.length > 0 && (
              <div className="bg-background-sidebar border border-border-card rounded-xl overflow-hidden mt-2">
                {filteredLeads.map(l => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setSelectedLead(l)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-border-card transition-colors text-left"
                  >
                    <div>
                      <div className="text-sm font-bold text-text-primary">{l.nome}</div>
                      <div className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">{l.etapa.replace('_', ' ')}</div>
                    </div>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      l.temperatura === 'quente' ? 'bg-danger' : l.temperatura === 'morno' ? 'bg-accent-alert' : 'bg-accent-secondary'
                    )} />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-background-app border border-border-card rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-text-primary">{selectedLead.nome}</div>
              <div className="text-xs text-text-tertiary">{selectedLead.telefone}</div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedLead(null)}
              className="text-xs font-bold text-accent-primary hover:underline"
            >
              Trocar lead
            </button>
          </div>
        )}

        {selectedLead && (
          <>
            <div className="space-y-3">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Tipo de Contato *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {tipos.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo: t.id })}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                      formData.tipo === t.id 
                        ? "bg-accent-primary/10 border-accent-primary text-accent-primary" 
                        : "bg-background-sidebar border-border-card text-text-tertiary hover:border-text-tertiary"
                    )}
                  >
                    <t.icon size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Direção *</label>
              <div className="flex bg-background-sidebar border border-border-card rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, direcao: 'enviado' })}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                    formData.direcao === 'enviado' ? "bg-background-app text-text-primary shadow-sm" : "text-text-tertiary"
                  )}
                >
                  Enviei mensagem
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, direcao: 'recebido' })}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                    formData.direcao === 'recebido' ? "bg-background-app text-text-primary shadow-sm" : "text-text-tertiary"
                  )}
                >
                  Recebi mensagem
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">O que aconteceu? *</label>
              <textarea
                required
                rows={3}
                value={formData.resumo}
                onChange={e => setFormData({ ...formData, resumo: e.target.value })}
                placeholder="Descreva o resultado do contato..."
                className="w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-2.5 focus:border-accent-primary outline-none resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Resultado *</label>
              <select
                required
                value={formData.resultado}
                onChange={e => setFormData({ ...formData, resultado: e.target.value as any })}
                className="w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-2.5 focus:border-accent-primary outline-none"
              >
                <option value="Respondeu">Respondeu</option>
                <option value="Sem resposta">Sem resposta</option>
                <option value="Agendou">Agendou</option>
                <option value="Recusou">Recusou</option>
                <option value="Vai pensar">Vai pensar</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border border-border-card font-bold hover:bg-border-card transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl bg-accent-secondary text-background-app font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar Contato'}
              </button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};
