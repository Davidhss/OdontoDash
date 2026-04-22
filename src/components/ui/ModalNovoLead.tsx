import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Modal } from './Modal';
import { useLeads } from '../../hooks/useLeads';
import { LeadFonte, LeadServico, LeadTemperature, LeadEtapa } from '../../types';
import { cn } from '../../lib/utils';
import { AlertCircle } from 'lucide-react';

interface ModalNovoLeadProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalNovoLead: React.FC<ModalNovoLeadProps> = ({ isOpen, onClose }) => {
  const { createLead } = useLeads();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    servico: 'Avaliação' as LeadServico,
    fonte: 'Meta Ads' as LeadFonte,
    temperatura: 'morno' as LeadTemperature,
    etapa: 'novo_lead' as LeadEtapa,
    anotacoes: ''
  });
  const [errors, setErrors] = useState({ nome: '', telefone: '' });
  const [touched, setTouched] = useState({ nome: false, telefone: false });

  const validateField = (field: 'nome' | 'telefone', value: string) => {
    if (field === 'nome') {
      if (!value.trim()) return 'Nome é obrigatório';
      if (value.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
    }
    if (field === 'telefone') {
      if (value && !/^(\(?\d{2}\)?[\s-]?\d{4,5}[-]?\d{4})?$/.test(value)) {
        return 'Telefone inválido';
      }
    }
    return '';
  };

  const handleBlur = (field: 'nome' | 'telefone') => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, formData[field]);
    setErrors({ ...errors, [field]: error });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      nome: validateField('nome', formData.nome),
      telefone: validateField('telefone', formData.telefone)
    };

    setErrors(newErrors);
    setTouched({ nome: true, telefone: true });

    if (newErrors.nome) return;

    setLoading(true);
    const success = await createLead(formData);
    setLoading(false);

    if (success) {
      setFormData({
        nome: '',
        telefone: '',
        servico: 'Avaliação',
        fonte: 'Meta Ads',
        temperatura: 'morno',
        etapa: 'novo_lead',
        anotacoes: ''
      });
      setErrors({ nome: '', telefone: '' });
      setTouched({ nome: false, telefone: false });
      onClose();
    }
  };

  const servicos: LeadServico[] = ['Avaliação', 'Clareamento', 'Implante', 'Ortodontia', 'Facetas', 'Limpeza', 'Canal', 'Prótese', 'Outro'];
  const fontes: LeadFonte[] = ['Meta Ads', 'Google', 'Indicação', 'Instagram Orgânico', 'Caminhada', 'Outro'];

  const formatTelefone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return `(${cleaned}`;
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    if (cleaned.length <= 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Novo Lead">
      <form onSubmit={handleSubmit} className="space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Nome Completo <span className="text-danger">*</span>
            </label>
            <input
              autoFocus
              required
              type="text"
              value={formData.nome}
              onChange={e => setFormData({ ...formData, nome: e.target.value })}
              onBlur={() => handleBlur('nome')}
              placeholder="Ex: Ana Silva"
              className={cn(
                "w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-3 transition-all input-focus",
                touched.nome && errors.nome && "border-danger input-focus-error"
              )}
            />
            {touched.nome && errors.nome && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-danger text-xs flex items-center gap-1"
              >
                <AlertCircle size={12} />
                {errors.nome}
              </motion.p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Telefone</label>
            <input
              type="tel"
              value={formData.telefone}
              onChange={e => setFormData({ ...formData, telefone: formatTelefone(e.target.value) })}
              onBlur={() => handleBlur('telefone')}
              placeholder="(11) 99999-9999"
              className={cn(
                "w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-3 transition-all input-focus",
                touched.telefone && errors.telefone && "border-danger input-focus-error"
              )}
            />
            {touched.telefone && errors.telefone && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-danger text-xs flex items-center gap-1"
              >
                <AlertCircle size={12} />
                {errors.telefone}
              </motion.p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Serviço de Interesse <span className="text-danger">*</span>
            </label>
            <select
              required
              value={formData.servico}
              onChange={e => setFormData({ ...formData, servico: e.target.value as LeadServico })}
              className="w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-3 transition-all input-focus cursor-pointer"
            >
              {servicos.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Fonte <span className="text-danger">*</span>
            </label>
            <select
              required
              value={formData.fonte}
              onChange={e => setFormData({ ...formData, fonte: e.target.value as LeadFonte })}
              className="w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-3 transition-all input-focus cursor-pointer"
            >
              {fontes.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Temperatura <span className="text-danger">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: 'quente', label: 'Quente', sublabel: 'quer agora', color: 'bg-danger', icon: '🔥' },
              { val: 'morno', label: 'Morno', sublabel: 'pesquisando', color: 'bg-accent-alert', icon: '🌡️' },
              { val: 'frio', label: 'Frio', sublabel: 'curiosidade', color: 'bg-accent-secondary', icon: '❄️' }
            ].map(t => (
              <label
                key={t.val}
                className={cn(
                  "cursor-pointer group relative overflow-hidden rounded-xl border-2 transition-all",
                  formData.temperatura === t.val
                    ? `border-${t.color.split('-')[1]}-500 ${t.color} text-white shadow-lg`
                    : "border-border-card bg-background-sidebar hover:border-text-tertiary"
                )}
              >
                <input
                  type="radio"
                  name="temperatura"
                  value={t.val}
                  checked={formData.temperatura === t.val}
                  onChange={e => setFormData({ ...formData, temperatura: e.target.value as LeadTemperature })}
                  className="hidden"
                />
                <div className="p-3 text-center">
                  <span className="text-2xl mb-1 block">{t.icon}</span>
                  <span className="text-sm font-bold block">{t.label}</span>
                  <span className="text-xs opacity-70">{t.sublabel}</span>
                </div>
              </label>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Etapa Inicial <span className="text-danger">*</span>
          </label>
          <select
            required
            value={formData.etapa}
            onChange={e => setFormData({ ...formData, etapa: e.target.value as LeadEtapa })}
            className="w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-3 transition-all input-focus cursor-pointer"
          >
            <option value="novo_lead">🎯 Novo Lead</option>
            <option value="contato_feito">📞 Contato Feito</option>
            <option value="consulta_agendada">📅 Consulta Agendada</option>
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Anotações Iniciais</label>
          <textarea
            rows={3}
            value={formData.anotacoes}
            onChange={e => setFormData({ ...formData, anotacoes: e.target.value })}
            placeholder="Ex: Viu anúncio de clareamento, perguntou sobre preço..."
            className="w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-3 transition-all input-focus resize-none"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3 pt-2"
        >
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl border border-border-card font-bold text-text-secondary hover:bg-border-card transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-background-app font-bold hover:opacity-90 transition-all shadow-lg shadow-accent-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-background-app border-t-transparent rounded-full animate-spin" />
                <span>Criando...</span>
              </>
            ) : (
              <>
                Criar Lead
                <motion.span
                  initial={{ x: -5 }}
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  →
                </motion.span>
              </>
            )}
          </button>
        </motion.div>
      </form>
    </Modal>
  );
};
