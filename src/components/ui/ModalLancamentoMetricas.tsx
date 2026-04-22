import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useMetricasAds } from '../../hooks/useMetricasAds';
import { format } from 'date-fns';
import { cn, formatCurrency } from '../../lib/utils';

interface ModalLancamentoMetricasProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export const ModalLancamentoMetricas: React.FC<ModalLancamentoMetricasProps> = ({ isOpen, onClose, initialData }) => {
  const { createMetrica, updateMetrica } = useMetricasAds();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    data_lancamento: format(new Date(), 'yyyy-MM-dd'),
    campanha: '',
    investimento: 0,
    impressoes: 0,
    cliques: 0,
    leads_gerados: 0,
    consultas_geradas: 0,
    observacoes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        data_lancamento: initialData.data_lancamento,
        campanha: initialData.campanha,
        investimento: Number(initialData.investimento),
        impressoes: initialData.impressoes,
        cliques: initialData.cliques,
        leads_gerados: initialData.leads_gerados,
        consultas_geradas: initialData.consultas_geradas,
        observacoes: initialData.observacoes || ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    let success;
    if (initialData?.id) {
      success = await updateMetrica(initialData.id, formData);
    } else {
      success = await createMetrica(formData);
    }
    
    setLoading(false);
    if (success) {
      setFormData({
        data_lancamento: format(new Date(), 'yyyy-MM-dd'),
        campanha: '',
        investimento: 0,
        impressoes: 0,
        cliques: 0,
        leads_gerados: 0,
        consultas_geradas: 0,
        observacoes: ''
      });
      onClose();
    }
  };

  const cpl = formData.leads_gerados > 0 ? formData.investimento / formData.leads_gerados : 0;
  const ctr = formData.impressoes > 0 ? (formData.cliques / formData.impressoes) * 100 : 0;
  const conversionRate = formData.leads_gerados > 0 ? (formData.consultas_geradas / formData.leads_gerados) * 100 : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Editar Métricas" : "Lançar Métricas de Anúncios"}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Data *</label>
            <input
              required
              type="date"
              value={formData.data_lancamento}
              onChange={e => setFormData({ ...formData, data_lancamento: e.target.value })}
              className="w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-2.5 focus:border-accent-primary outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Campanha *</label>
            <input
              required
              type="text"
              value={formData.campanha}
              onChange={e => setFormData({ ...formData, campanha: e.target.value })}
              placeholder="Ex: Implante - Abril"
              className="w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-2.5 focus:border-accent-primary outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Investimento (R$) *</label>
            <input
              required
              type="number"
              step="0.01"
              value={formData.investimento}
              onChange={e => setFormData({ ...formData, investimento: Number(e.target.value) })}
              className="w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-2.5 focus:border-accent-primary outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Impressões</label>
            <input
              type="number"
              value={formData.impressoes}
              onChange={e => setFormData({ ...formData, impressoes: Number(e.target.value) })}
              className="w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-2.5 focus:border-accent-primary outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Cliques</label>
            <input
              type="number"
              value={formData.cliques}
              onChange={e => setFormData({ ...formData, cliques: Number(e.target.value) })}
              className="w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-2.5 focus:border-accent-primary outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Leads Gerados *</label>
            <input
              required
              type="number"
              value={formData.leads_gerados}
              onChange={e => setFormData({ ...formData, leads_gerados: Number(e.target.value) })}
              className="w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-2.5 focus:border-accent-primary outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Consultas Geradas</label>
            <input
              type="number"
              value={formData.consultas_geradas}
              onChange={e => setFormData({ ...formData, consultas_geradas: Number(e.target.value) })}
              className="w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-2.5 focus:border-accent-primary outline-none"
            />
          </div>
        </div>

        <div className="bg-background-app border border-border-card rounded-xl p-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1">CPL</div>
            <div className="text-sm font-bold text-accent-primary">{formatCurrency(cpl)}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1">CTR</div>
            <div className="text-sm font-bold text-accent-secondary">{ctr.toFixed(2)}%</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1">Taxa L→C</div>
            <div className="text-sm font-bold text-accent-alert">{conversionRate.toFixed(1)}%</div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Observações</label>
          <textarea
            rows={2}
            value={formData.observacoes}
            onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
            className="w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-2.5 focus:border-accent-primary outline-none resize-none"
          />
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
            className="flex-1 px-4 py-3 rounded-xl bg-accent-alert text-background-app font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Lançamento'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
