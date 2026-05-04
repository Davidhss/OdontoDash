import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Modal } from '../ui/Modal';
import { LeadFonte, LeadServico, LeadTemperature, LeadEtapa, ProcedimentoInteresse, AnguloOferta, EtapaJornada } from '../../types';
import { cn } from '../../lib/utils';
import { AlertCircle, User, Phone, MessageCircle } from 'lucide-react';

interface ModalCriarLeadWhatsAppProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leadData: LeadFormData) => Promise<void>;
  initialName: string;
  initialPhone: string;
}

export interface LeadFormData {
  nome: string;
  telefone: string;
  servico: LeadServico;
  fonte: LeadFonte;
  temperatura: LeadTemperature;
  etapa: LeadEtapa;
  procedimento_interesse: ProcedimentoInteresse;
  angulo_oferta: AnguloOferta;
  etapa_jornada: EtapaJornada;
  anotacoes: string;
  data_consulta: string;
}

const formatTelefone = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 2) return cleaned ? `(${cleaned}` : '';
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  if (cleaned.length <= 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};

const formatPhoneFromRaw = (raw: string): string => {
  const cleaned = raw.replace(/\D/g, '');
  // Brazilian number with country code: 55 + DDD(2) + number(8-9)
  if (cleaned.startsWith('55') && cleaned.length >= 12) {
    const ddd = cleaned.slice(2, 4);
    const number = cleaned.slice(4);
    if (number.length === 9) {
      return `(${ddd}) ${number.slice(0, 5)}-${number.slice(5)}`;
    }
    if (number.length === 8) {
      return `(${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`;
    }
  }
  // Already a local number
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return raw;
};

export const ModalCriarLeadWhatsApp: React.FC<ModalCriarLeadWhatsAppProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialName,
  initialPhone,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LeadFormData>({
    nome: '',
    telefone: '',
    servico: 'Avaliação',
    fonte: 'Outro',
    temperatura: 'morno',
    etapa: 'novo_lead',
    procedimento_interesse: 'Avaliação',
    angulo_oferta: 'Direto',
    etapa_jornada: 'Descoberta',
    anotacoes: '',
    data_consulta: '',
  });
  const [errors, setErrors] = useState({ nome: '' });

  // Reset form when modal opens with new initial values
  useEffect(() => {
    if (isOpen) {
      setFormData({
        nome: initialName || '',
        telefone: formatPhoneFromRaw(initialPhone || ''),
        servico: 'Avaliação',
        fonte: 'Outro',
        temperatura: 'morno',
        etapa: 'novo_lead',
        procedimento_interesse: 'Avaliação',
        angulo_oferta: 'Direto',
        etapa_jornada: 'Descoberta',
        anotacoes: '',
        data_consulta: '',
      });
      setErrors({ nome: '' });
    }
  }, [isOpen, initialName, initialPhone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      setErrors({ nome: 'Nome é obrigatório' });
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  const servicos: LeadServico[] = ['Avaliação', 'Clareamento', 'Implante', 'Ortodontia', 'Facetas', 'Limpeza', 'Canal', 'Prótese', 'Outro'];
  const fontes: LeadFonte[] = ['Meta Ads', 'Google', 'Indicação', 'Instagram Orgânico', 'Caminhada', 'Outro'];
  const procedimentos: ProcedimentoInteresse[] = ['Implante', 'Facetas', 'Clareamento', 'Avaliação', 'Ortodontia', 'Outro'];
  const angulos: AnguloOferta[] = ['Direto', 'Dor-Desejo', 'Autoridade', 'Indicação'];
  const jornadas: EtapaJornada[] = ['Descoberta', 'Atração', 'Curiosidade', 'Ação', 'Apologia'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Criar Lead do WhatsApp">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Contact Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white flex-shrink-0">
            <MessageCircle size={18} />
          </div>
          <div className="text-sm">
            <p className="text-emerald-400 font-semibold">Contato do WhatsApp</p>
            <p className="text-text-tertiary text-xs">Confirme os dados abaixo antes de criar a lead</p>
          </div>
        </motion.div>

        {/* Nome + Telefone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <User size={12} /> Nome Completo <span className="text-danger">*</span>
            </label>
            <input
              autoFocus
              required
              type="text"
              value={formData.nome}
              onChange={e => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Ana Silva"
              className={cn(
                "w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-3 transition-all input-focus text-sm",
                errors.nome && "border-danger input-focus-error"
              )}
            />
            {errors.nome && (
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
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <Phone size={12} /> Telefone
            </label>
            <input
              type="tel"
              value={formData.telefone}
              onChange={e => setFormData({ ...formData, telefone: formatTelefone(e.target.value) })}
              placeholder="(11) 99999-9999"
              className="w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-3 transition-all input-focus text-sm"
            />
          </div>
        </motion.div>

        {/* Serviço + Fonte */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Serviço de Interesse
            </label>
            <select
              value={formData.servico}
              onChange={e => setFormData({ ...formData, servico: e.target.value as LeadServico })}
              className="w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-3 transition-all input-focus cursor-pointer text-sm"
            >
              {servicos.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Procedimento
            </label>
            <select
              value={formData.procedimento_interesse}
              onChange={e => setFormData({ ...formData, procedimento_interesse: e.target.value as ProcedimentoInteresse })}
              className="w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-3 transition-all input-focus cursor-pointer text-sm"
            >
              {procedimentos.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </motion.div>

        {/* Temperatura */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Temperatura
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
                <div className="p-2.5 text-center">
                  <span className="text-xl mb-0.5 block">{t.icon}</span>
                  <span className="text-xs font-bold block">{t.label}</span>
                  <span className="text-[10px] opacity-70">{t.sublabel}</span>
                </div>
              </label>
            ))}
          </div>
        </motion.div>

        {/* Etapa + Fonte + Ângulo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Etapa
            </label>
            <select
              value={formData.etapa}
              onChange={e => setFormData({ ...formData, etapa: e.target.value as LeadEtapa })}
              className="w-full bg-background-sidebar border border-border-card rounded-xl px-3 py-3 transition-all input-focus cursor-pointer text-sm"
            >
              <option value="novo_lead">🎯 Novo Lead</option>
              <option value="contato_feito">📞 Contato Feito</option>
              <option value="consulta_agendada">📅 Consulta Agendada</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Fonte
            </label>
            <select
              value={formData.fonte}
              onChange={e => setFormData({ ...formData, fonte: e.target.value as LeadFonte })}
              className="w-full bg-background-sidebar border border-border-card rounded-xl px-3 py-3 transition-all input-focus cursor-pointer text-sm"
            >
              {fontes.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Ângulo
            </label>
            <select
              value={formData.angulo_oferta}
              onChange={e => setFormData({ ...formData, angulo_oferta: e.target.value as AnguloOferta })}
              className="w-full bg-background-sidebar border border-border-card rounded-xl px-3 py-3 transition-all input-focus cursor-pointer text-sm"
            >
              {angulos.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </motion.div>

        {/* Data da Consulta - shows when consulta_agendada */}
        {formData.etapa === 'consulta_agendada' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              📅 Data e Horário da Consulta <span className="text-danger">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={formData.data_consulta}
              onChange={e => setFormData({ ...formData, data_consulta: e.target.value })}
              className="w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-3 transition-all input-focus text-sm cursor-pointer"
            />
          </motion.div>
        )}

        {/* Anotações */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Anotações</label>
          <textarea
            rows={2}
            value={formData.anotacoes}
            onChange={e => setFormData({ ...formData, anotacoes: e.target.value })}
            placeholder="Ex: Perguntou sobre clareamento, quer agendar..."
            className="w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-3 transition-all input-focus resize-none text-sm"
          />
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex gap-3 pt-2"
        >
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl border border-border-card font-bold text-text-secondary hover:bg-border-card transition-all disabled:opacity-50 text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
