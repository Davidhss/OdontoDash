import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Thermometer, Target, Briefcase, MapPin, ChevronDown, CheckCircle, ExternalLink } from 'lucide-react';
import { LeadEtapa, LeadTemperature, LeadServico, ProcedimentoInteresse, AnguloOferta, EtapaJornada } from '../../types';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface LeadPanelProps {
  leadId: string;
  onClose: () => void;
  onUpdated?: () => void;
}

interface LeadData {
  id: string;
  nome: string;
  telefone: string;
  etapa: LeadEtapa;
  temperatura: LeadTemperature;
  servico: LeadServico;
  procedimento_interesse: ProcedimentoInteresse;
  angulo_oferta: AnguloOferta;
  etapa_jornada: EtapaJornada;
  anotacoes: string | null;
  valor_fechado: number | null;
  data_consulta: string | null;
  fonte: string;
}

const etapas: { value: LeadEtapa; label: string; icon: string; color: string }[] = [
  { value: 'novo_lead', label: 'Novo Lead', icon: '🎯', color: 'bg-blue-500' },
  { value: 'contato_feito', label: 'Contato Feito', icon: '📞', color: 'bg-purple-500' },
  { value: 'consulta_agendada', label: 'Consulta Agendada', icon: '📅', color: 'bg-amber-500' },
  { value: 'consulta_realizada', label: 'Consulta Realizada', icon: '✅', color: 'bg-cyan-500' },
  { value: 'cliente_fechado', label: 'Cliente Fechado', icon: '🏆', color: 'bg-emerald-500' },
  { value: 'perdido', label: 'Perdido', icon: '❌', color: 'bg-red-500' },
];

const temperaturas: { value: LeadTemperature; label: string; icon: string; color: string }[] = [
  { value: 'quente', label: 'Quente', icon: '🔥', color: 'from-red-500 to-orange-500' },
  { value: 'morno', label: 'Morno', icon: '🌡️', color: 'from-amber-500 to-yellow-500' },
  { value: 'frio', label: 'Frio', icon: '❄️', color: 'from-blue-500 to-cyan-500' },
];

export const LeadPanel: React.FC<LeadPanelProps> = ({ leadId, onClose, onUpdated }) => {
  const [lead, setLead] = useState<LeadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editData, setEditData] = useState<Partial<LeadData>>({});

  useEffect(() => {
    const fetchLead = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (error) {
        console.error('Erro ao carregar lead:', error);
        toast.error('Erro ao carregar dados da lead');
        setLoading(false);
        return;
      }

      setLead(data as LeadData);
      setEditData({});
      setHasChanges(false);
      setLoading(false);
    };

    if (leadId) fetchLead();
  }, [leadId]);

  const updateField = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!lead || !hasChanges) return;

    setSaving(true);
    try {
      // Map etapa to etapa_jornada automatically
      let finalData = { ...editData };
      if (finalData.etapa) {
        const etapaMap: Record<string, EtapaJornada> = {
          'novo_lead': 'Descoberta',
          'contato_feito': 'Atração',
          'consulta_agendada': 'Curiosidade',
          'consulta_realizada': 'Ação',
          'cliente_fechado': 'Apologia',
        };
        if (etapaMap[finalData.etapa]) {
          finalData.etapa_jornada = etapaMap[finalData.etapa];
        }
      }

      const { error } = await supabase
        .from('leads')
        .update({
          ...finalData,
          ultima_atualizacao: new Date().toISOString(),
        })
        .eq('id', lead.id);

      if (error) throw error;

      // Update whatsapp_chats name if nome was changed
      if (finalData.nome) {
        await supabase
          .from('whatsapp_chats')
          .update({ contact_name: finalData.nome })
          .eq('lead_id', lead.id);
      }

      setLead(prev => prev ? { ...prev, ...finalData } : prev);
      setEditData({});
      setHasChanges(false);
      toast.success('Lead atualizada com sucesso!');
      onUpdated?.();
    } catch (err) {
      console.error('Erro ao salvar lead:', err);
      toast.error('Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  const getValue = (field: keyof LeadData) => {
    return (editData as any)[field] ?? lead?.[field] ?? '';
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-[320px] border-l border-border-card bg-background-card flex items-center justify-center"
      >
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </motion.div>
    );
  }

  if (!lead) return null;

  const currentEtapa = etapas.find(e => e.value === getValue('etapa'));
  const currentTemp = temperaturas.find(t => t.value === getValue('temperatura'));

  const servicos: LeadServico[] = ['Avaliação', 'Clareamento', 'Implante', 'Ortodontia', 'Facetas', 'Limpeza', 'Canal', 'Prótese', 'Outro'];
  const procedimentos: ProcedimentoInteresse[] = ['Implante', 'Facetas', 'Clareamento', 'Avaliação', 'Ortodontia', 'Outro'];
  const angulos: AnguloOferta[] = ['Direto', 'Dor-Desejo', 'Autoridade', 'Indicação'];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-[320px] border-l border-border-card bg-background-card flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-card flex items-center justify-between bg-gradient-to-r from-emerald-500/10 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Target size={14} className="text-emerald-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">Gerenciar Lead</h3>
            <p className="text-[10px] text-text-tertiary">{lead.nome}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-border-card/50 transition-colors text-text-secondary hover:text-text-primary"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-hide">
        {/* Nome */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-1">
            Nome
          </label>
          <input
            type="text"
            value={getValue('nome')}
            onChange={e => updateField('nome', e.target.value)}
            placeholder="Nome do paciente"
            className="w-full bg-background-sidebar border border-border-card rounded-xl px-3 py-2.5 transition-all input-focus text-xs"
          />
        </div>

        {/* Telefone */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-1">
            Telefone
          </label>
          <input
            type="tel"
            value={getValue('telefone')}
            onChange={e => {
              const cleaned = e.target.value.replace(/\D/g, '');
              let formatted = cleaned;
              if (cleaned.length <= 2) formatted = cleaned ? `(${cleaned}` : '';
              else if (cleaned.length <= 7) formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
              else if (cleaned.length <= 11) formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
              else formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
              updateField('telefone', formatted);
            }}
            placeholder="(11) 99999-9999"
            className="w-full bg-background-sidebar border border-border-card rounded-xl px-3 py-2.5 transition-all input-focus text-xs"
          />
        </div>

        {/* Pipeline Stage */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Etapa do Pipeline</label>
          <div className="space-y-1.5">
            {etapas.map(e => (
              <button
                key={e.value}
                onClick={() => updateField('etapa', e.value)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all text-sm ${
                  getValue('etapa') === e.value
                    ? `${e.color} text-white shadow-lg`
                    : 'bg-background-sidebar border border-border-card hover:border-emerald-500/30 text-text-secondary'
                }`}
              >
                <span className="text-base">{e.icon}</span>
                <span className="font-medium text-xs">{e.label}</span>
                {getValue('etapa') === e.value && (
                  <CheckCircle size={14} className="ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Data da Consulta */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-1">
            📅 Data da Consulta
          </label>
          <input
            type="datetime-local"
            value={getValue('data_consulta') ? new Date(getValue('data_consulta')).toISOString().slice(0, 16) : ''}
            onChange={e => updateField('data_consulta', e.target.value ? new Date(e.target.value).toISOString() : null)}
            className="w-full bg-background-sidebar border border-border-card rounded-xl px-3 py-2.5 transition-all input-focus text-xs cursor-pointer"
          />
        </div>

        {/* Temperature */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Temperatura</label>
          <div className="grid grid-cols-3 gap-2">
            {temperaturas.map(t => (
              <button
                key={t.value}
                onClick={() => updateField('temperatura', t.value)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all ${
                  getValue('temperatura') === t.value
                    ? `bg-gradient-to-br ${t.color} text-white shadow-lg`
                    : 'bg-background-sidebar border border-border-card hover:border-emerald-500/30 text-text-secondary'
                }`}
              >
                <span className="text-lg">{t.icon}</span>
                <span className="text-[10px] font-bold">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Service */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-1">
            <Briefcase size={10} /> Serviço
          </label>
          <select
            value={getValue('servico')}
            onChange={e => updateField('servico', e.target.value)}
            className="w-full bg-background-sidebar border border-border-card rounded-xl px-3 py-2.5 transition-all input-focus cursor-pointer text-xs"
          >
            {servicos.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Procedimento */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Procedimento</label>
          <select
            value={getValue('procedimento_interesse')}
            onChange={e => updateField('procedimento_interesse', e.target.value)}
            className="w-full bg-background-sidebar border border-border-card rounded-xl px-3 py-2.5 transition-all input-focus cursor-pointer text-xs"
          >
            {procedimentos.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Ângulo */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Ângulo de Oferta</label>
          <select
            value={getValue('angulo_oferta')}
            onChange={e => updateField('angulo_oferta', e.target.value)}
            className="w-full bg-background-sidebar border border-border-card rounded-xl px-3 py-2.5 transition-all input-focus cursor-pointer text-xs"
          >
            {angulos.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {/* Valor Fechado */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Valor Fechado (R$)</label>
          <input
            type="number"
            value={getValue('valor_fechado') || ''}
            onChange={e => updateField('valor_fechado', e.target.value ? Number(e.target.value) : null)}
            placeholder="0,00"
            className="w-full bg-background-sidebar border border-border-card rounded-xl px-3 py-2.5 transition-all input-focus text-xs"
          />
        </div>

        {/* Anotações */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Anotações</label>
          <textarea
            rows={3}
            value={getValue('anotacoes') || ''}
            onChange={e => updateField('anotacoes', e.target.value)}
            placeholder="Observações sobre a lead..."
            className="w-full bg-background-sidebar border border-border-card rounded-xl px-3 py-2.5 transition-all input-focus resize-none text-xs"
          />
        </div>
      </div>

      {/* Save Button */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4 border-t border-border-card"
          >
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  Salvar Alterações
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
