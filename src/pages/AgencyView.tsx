import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, Users, TrendingUp, DollarSign, BarChart3, 
  Plus, ArrowRight, Settings, ExternalLink, Copy, CheckCircle,
  UserPlus, Mail, MapPin, Link
} from 'lucide-react';
import { useBusiness } from '../hooks/useBusiness';
import { supabase } from '../lib/supabase';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';
import { motion as m } from 'motion/react';

interface BusinessKPI {
  id: string;
  nome: string;
  regiao: string;
  invite_code: string;
  totalLeads: number;
  totalClientes: number;
  totalFaturamento: number;
  taxaConversao: number;
  role: string;
}

interface DentistInviteModalProps {
  business: BusinessKPI;
  onClose: () => void;
  onGenerate: (name: string, email: string) => Promise<string | null>;
}

const DentistInviteModal: React.FC<DentistInviteModalProps> = ({ business, onClose, onGenerate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!name.trim()) { toast.error('Informe o nome do dentista'); return; }
    setLoading(true);
    const link = await onGenerate(name, email);
    if (link) setGeneratedLink(link);
    setLoading(false);
  };

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copiado!');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-background-card border border-border-card rounded-3xl shadow-2xl p-8 z-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
            <UserPlus size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">Convidar Dentista</h3>
            <p className="text-xs text-text-tertiary">{business.nome}</p>
          </div>
        </div>

        {!generatedLink ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Nome do Dentista *</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
                <input
                  type="text"
                  placeholder="Dr. João Silva"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-background-sidebar border border-border-card rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-text-primary outline-none focus:border-accent-primary transition-all"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">E-mail (opcional)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
                <input
                  type="email"
                  placeholder="dentista@clinica.com.br"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-background-sidebar border border-border-card rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-text-primary outline-none focus:border-accent-primary transition-all"
                />
              </div>
            </div>

            <div className="bg-background-sidebar rounded-2xl p-4 border border-border-card">
              <p className="text-xs text-text-tertiary leading-relaxed">
                <span className="font-bold text-text-secondary">Como funciona:</span> Será gerado um link de convite. O dentista acessa o link, cria uma conta e terá acesso à visão analítica da clínica <span className="font-bold text-accent-primary">{business.nome}</span>.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-border-card text-sm font-bold text-text-secondary hover:bg-background-sidebar transition-all">
                Cancelar
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/20 disabled:opacity-50"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Link size={16} /> Gerar Link</>}
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-500 mb-2">
              <CheckCircle size={18} />
              <span className="text-sm font-bold">Link gerado com sucesso!</span>
            </div>
            
            <div className="bg-background-sidebar rounded-2xl p-4 border border-border-card">
              <p className="text-xs text-text-tertiary mb-2 font-bold uppercase tracking-wide">Link de Convite</p>
              <p className="text-xs text-text-secondary break-all font-mono leading-relaxed">{generatedLink}</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCopy}
              className={cn(
                "w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
                copied
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-accent-primary text-white shadow-lg shadow-accent-primary/20"
              )}
            >
              {copied ? <><CheckCircle size={16} /> Copiado!</> : <><Copy size={16} /> Copiar Link</>}
            </motion.button>

            <p className="text-xs text-text-tertiary text-center">
              Envie este link para <span className="font-bold text-text-secondary">{name}</span> via WhatsApp ou e-mail
            </p>

            <button onClick={onClose} className="w-full py-2 text-xs text-text-tertiary hover:text-text-secondary transition-colors">
              Fechar
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const AgencyView: React.FC = () => {
  const { businesses, activeBusiness, setActiveBusiness, createDentistInvite, getBusinessRole } = useBusiness();
  const [businessKPIs, setBusinessKPIs] = useState<Record<string, Partial<BusinessKPI>>>({});
  const [loadingKPIs, setLoadingKPIs] = useState(false);
  const [inviteModal, setInviteModal] = useState<BusinessKPI | null>(null);

  const ownedBusinesses = businesses.filter(b => {
    const role = getBusinessRole(b.id);
    return role === 'owner' || role === 'admin';
  });

  useEffect(() => {
    const fetchAllKPIs = async () => {
      if (ownedBusinesses.length === 0) return;
      setLoadingKPIs(true);

      const start = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const end = format(endOfMonth(new Date()), 'yyyy-MM-dd');

      const results: Record<string, Partial<BusinessKPI>> = {};

      await Promise.all(ownedBusinesses.map(async (biz) => {
        try {
          const { data: leads } = await supabase
            .from('leads')
            .select('etapa, valor_fechado')
            .eq('business_id', biz.id)
            .gte('created_at', start + 'T00:00:00')
            .lte('created_at', end + 'T23:59:59');

          const totalLeads = leads?.length || 0;
          const totalClientes = leads?.filter(l => l.etapa === 'cliente_fechado').length || 0;
          const totalFaturamento = leads?.filter(l => l.etapa === 'cliente_fechado')
            .reduce((acc, l) => acc + (Number(l.valor_fechado) || 0), 0) || 0;
          const taxaConversao = totalLeads > 0 ? Math.round((totalClientes / totalLeads) * 100) : 0;

          results[biz.id] = { totalLeads, totalClientes, totalFaturamento, taxaConversao };
        } catch (e) {
          results[biz.id] = { totalLeads: 0, totalClientes: 0, totalFaturamento: 0, taxaConversao: 0 };
        }
      }));

      setBusinessKPIs(results);
      setLoadingKPIs(false);
    };

    fetchAllKPIs();
  }, [businesses.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const totalLeadsAll = ownedBusinesses.reduce((acc, b) => acc + (businessKPIs[b.id]?.totalLeads || 0), 0);
  const totalClientesAll = ownedBusinesses.reduce((acc, b) => acc + (businessKPIs[b.id]?.totalClientes || 0), 0);
  const totalFaturamentoAll = ownedBusinesses.reduce((acc, b) => acc + (businessKPIs[b.id]?.totalFaturamento || 0), 0);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-black text-text-primary tracking-tight">Visão de Agência</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Gerenciando <span className="font-bold text-accent-primary">{ownedBusinesses.length}</span> {ownedBusinesses.length === 1 ? 'negócio' : 'negócios'} este mês
        </p>
      </motion.div>

      {/* Agency Summary KPIs */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total de Leads', value: totalLeadsAll, icon: Users, color: 'text-accent-primary', bg: 'bg-accent-primary/10' },
          { label: 'Total de Fechados', value: totalClientesAll, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { 
            label: 'Faturamento Total', 
            value: `R$ ${totalFaturamentoAll.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`,
            icon: DollarSign, 
            color: 'text-amber-500', 
            bg: 'bg-amber-500/10' 
          },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className="glass-card rounded-2xl p-5 flex items-center gap-4"
          >
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', kpi.bg, kpi.color)}>
              <kpi.icon size={22} />
            </div>
            <div>
              <div className={cn('text-2xl font-black', kpi.color)}>{kpi.value}</div>
              <div className="text-xs font-bold text-text-tertiary uppercase tracking-wide">{kpi.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Business Cards Grid */}
      <motion.div variants={itemVariants}>
        <h2 className="text-base font-bold text-text-primary mb-4">Suas Clínicas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {ownedBusinesses.map((biz, i) => {
            const kpi = businessKPIs[biz.id] || {};
            const isActive = activeBusiness?.id === biz.id;
            const kpiForModal: BusinessKPI = {
              id: biz.id,
              nome: biz.nome,
              regiao: biz.regiao || '',
              invite_code: biz.invite_code || '',
              totalLeads: kpi.totalLeads || 0,
              totalClientes: kpi.totalClientes || 0,
              totalFaturamento: kpi.totalFaturamento || 0,
              taxaConversao: kpi.taxaConversao || 0,
              role: getBusinessRole(biz.id) || 'member',
            };

            return (
              <motion.div
                key={biz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className={cn(
                  "glass-card rounded-3xl p-6 relative overflow-hidden group transition-all duration-300",
                  isActive ? "border-accent-primary/50 shadow-[0_0_30px_rgba(10,126,106,0.15)]" : ""
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-4 right-4">
                    <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-accent-primary text-white uppercase tracking-wider">
                      Ativo
                    </span>
                  </div>
                )}

                {/* Background gradient */}
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-accent-primary/5 rounded-full blur-2xl group-hover:bg-accent-primary/10 transition-all" />

                <div className="flex items-start gap-3 mb-5">
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white shadow-lg flex-shrink-0"
                  >
                    <Building2 size={22} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-text-primary leading-tight truncate">{biz.nome}</h3>
                    {biz.regiao && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size={11} className="text-text-tertiary" />
                        <span className="text-xs text-text-tertiary">{biz.regiao}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* KPIs mini */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { label: 'Leads', value: loadingKPIs ? '—' : kpi.totalLeads || 0, color: 'text-accent-primary' },
                    { label: 'Fechados', value: loadingKPIs ? '—' : kpi.totalClientes || 0, color: 'text-emerald-500' },
                    { label: 'Conversão', value: loadingKPIs ? '—' : `${kpi.taxaConversao || 0}%`, color: 'text-blue-500' },
                    { label: 'Faturamento', value: loadingKPIs ? '—' : `R$ ${((kpi.totalFaturamento || 0) / 1000).toFixed(1)}k`, color: 'text-amber-500' },
                  ].map(m => (
                    <div key={m.label} className="bg-background-sidebar rounded-xl p-3">
                      <div className={cn('text-lg font-black', m.color)}>{m.value}</div>
                      <div className="text-[10px] text-text-tertiary font-bold uppercase tracking-wide">{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Invite code */}
                <div className="bg-background-sidebar rounded-xl px-3 py-2 flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] text-text-tertiary font-bold uppercase">Código</p>
                    <p className="text-sm font-mono font-black text-accent-primary">{biz.invite_code}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(biz.invite_code || '');
                      toast.success('Código copiado!');
                    }}
                    className="p-1.5 rounded-lg hover:bg-border-card transition-colors text-text-tertiary hover:text-accent-primary"
                  >
                    <Copy size={14} />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveBusiness(biz)}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all",
                      isActive
                        ? "bg-accent-primary/10 text-accent-primary"
                        : "bg-accent-primary text-white shadow-md shadow-accent-primary/20"
                    )}
                  >
                    {isActive ? <><BarChart3 size={14} /> Ver Dashboard</> : <><ExternalLink size={14} /> Acessar</>}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setInviteModal(kpiForModal)}
                    className="px-3 py-2.5 rounded-xl bg-background-sidebar border border-border-card text-text-secondary hover:text-accent-primary hover:border-accent-primary/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <UserPlus size={14} />
                    Dentista
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* How dentist access works */}
      <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6">
        <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
          <UserPlus size={18} className="text-accent-primary" />
          Como funciona o acesso do dentista
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '01', title: 'Gerar convite', desc: 'Clique em "Dentista" em qualquer clínica e informe o nome do profissional', color: 'bg-accent-primary' },
            { step: '02', title: 'Enviar link', desc: 'Copie o link gerado e envie via WhatsApp, e-mail ou qualquer canal', color: 'bg-accent-secondary' },
            { step: '03', title: 'Dentista acessa', desc: 'O dentista cria uma conta, acessa o link e vê os dados analíticos em tempo real', color: 'bg-emerald-500' },
          ].map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className={cn("w-8 h-8 rounded-xl text-white flex items-center justify-center text-xs font-black flex-shrink-0", s.color)}>
                {s.step}
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">{s.title}</h4>
                <p className="text-xs text-text-tertiary mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Dentist invite modal */}
      {inviteModal && (
        <DentistInviteModal
          business={inviteModal}
          onClose={() => setInviteModal(null)}
          onGenerate={(name, email) => createDentistInvite(inviteModal.id, name, email)}
        />
      )}
    </motion.div>
  );
};

export default AgencyView;
