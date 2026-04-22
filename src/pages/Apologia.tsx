import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApologia } from '../hooks/useApologia';
import { useLeads } from '../hooks/useLeads';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Video, 
  Star, 
  Plus, 
  CheckCircle2, 
  Users, 
  Target,
  Search,
  MessageSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Badge } from '../components/ui/Badge';

const Apologia: React.FC = () => {
  const { apologias, loading, createApologia } = useApologia();
  const { leads } = useLeads();
  const [showForm, setShowForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState('');
  const [tipo, setTipo] = useState('Vídeo');
  const [texto, setTexto] = useState('');

  const candidates = leads.filter(l => l.etapa === 'cliente_fechado');
  const collectedCount = apologias.filter(a => a.coletado).length;
  const goal = 10; // Monthly goal
  const progress = (collectedCount / goal) * 100;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    const lead = leads.find(l => l.id === selectedLead);
    if (!lead) return;

    const success = await createApologia({
      lead_id: selectedLead,
      business_id: lead.business_id || '',
      tipo,
      data: new Date().toISOString(),
      coletado: true,
      texto_depoimento: texto
    });

    if (success) {
      toast.success('Depoimento registrado com sucesso!');
      setShowForm(false);
      setSelectedLead('');
      setTexto('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Meta */}
      <div className="bg-accent-primary rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Meta de Depoimentos</h1>
            <p className="text-white/80 font-medium">Transformando pacientes em advogados da marca</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md">
                <Target size={20} />
                <span className="font-bold">{collectedCount} / {goal}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md">
                <Star size={20} className="text-yellow-400 fill-yellow-400" />
                <span className="font-bold">Foco: Qualidade</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-64 space-y-2">
            <div className="flex justify-between text-sm font-bold">
              <span>Progresso Mensal</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
              />
            </div>
          </div>
        </div>
        <div className="absolute right-[-20px] top-[-20px] opacity-10">
          <Video size={200} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Candidates List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Users className="text-accent-primary" size={24} />
              Candidatos a Depoimento
            </h2>
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-accent-primary text-white px-4 py-2 rounded-xl font-bold hover:opacity-90 transition-all"
            >
              <Plus size={20} />
              Registrar Novo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.length === 0 ? (
              <div className="col-span-2 bg-background-card border border-border-card rounded-3xl p-12 text-center">
                <Users size={48} className="text-text-tertiary mx-auto mb-4 opacity-20" />
                <p className="text-text-secondary">Nenhum paciente fechado recentemente para solicitar depoimento.</p>
              </div>
            ) : (
              candidates.map((lead) => (
                <div key={lead.id} className="bg-background-card border border-border-card p-5 rounded-3xl hover:border-accent-primary/50 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 flex items-center justify-center text-accent-primary font-bold text-xl">
                      {lead.nome.charAt(0)}
                    </div>
                    <Badge variant="secondary">Fechado</Badge>
                  </div>
                  <h3 className="font-bold text-text-primary mb-1">{lead.nome}</h3>
                  <p className="text-xs text-text-tertiary font-bold uppercase tracking-wider mb-4">{lead.procedimento_interesse || lead.servico}</p>
                  <button 
                    onClick={() => {
                      setSelectedLead(lead.id);
                      setShowForm(true);
                    }}
                    className="w-full py-2.5 rounded-xl border border-border-card text-sm font-bold text-text-secondary hover:bg-accent-primary hover:text-white hover:border-accent-primary transition-all"
                  >
                    Solicitar Depoimento
                  </button>
                </div>
              ))
            )}
          </div>

          {/* History */}
          <div className="pt-8">
            <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={24} />
              Depoimentos Coletados
            </h2>
            <div className="space-y-4">
              {apologias.filter(a => a.coletado).map((apologia) => {
                const lead = leads.find(l => l.id === apologia.lead_id);
                return (
                  <div key={apologia.id} className="bg-background-card border border-border-card p-6 rounded-3xl flex items-start gap-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      {apologia.tipo === 'Vídeo' ? <Video size={20} /> : <Star size={20} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-text-primary">{lead?.nome || 'Paciente'}</h4>
                        <span className="text-xs text-text-tertiary">{format(new Date(apologia.data), "dd/MM/yyyy")}</span>
                      </div>
                      <p className="text-sm text-text-secondary italic">"{apologia.texto_depoimento}"</p>
                      <div className="mt-3">
                        <Badge variant="outline">{apologia.tipo}</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-background-card border border-border-card p-6 rounded-3xl">
            <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
              <MessageSquare size={18} className="text-accent-primary" />
              Por que coletar?
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                  <CheckCircle2 size={12} />
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  <strong>Prova Social:</strong> 92% dos pacientes leem avaliações antes de escolher um dentista.
                </p>
              </li>
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                  <CheckCircle2 size={12} />
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  <strong>SEO Local:</strong> Avaliações no Google melhoram seu ranking nas buscas da região.
                </p>
              </li>
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                  <CheckCircle2 size={12} />
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  <strong>Anúncios:</strong> Depoimentos em vídeo convertem 3x mais que imagens estáticas.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Register Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background-card border border-border-card rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <h2 className="text-xl font-bold text-text-primary mb-6">Registrar Depoimento</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-tertiary uppercase mb-1.5">Paciente</label>
                <select 
                  value={selectedLead}
                  onChange={(e) => setSelectedLead(e.target.value)}
                  className="w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-2.5 text-sm focus:border-accent-primary outline-none"
                  required
                >
                  <option value="">Selecione um paciente...</option>
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-tertiary uppercase mb-1.5">Tipo de Depoimento</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Vídeo', 'Google Review'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTipo(t)}
                      className={cn(
                        "py-2.5 rounded-xl border text-sm font-bold transition-all",
                        tipo === t 
                          ? "bg-accent-primary text-white border-accent-primary shadow-lg" 
                          : "bg-background-sidebar border-border-card text-text-secondary hover:bg-border-card"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-tertiary uppercase mb-1.5">Texto do Depoimento (Opcional)</label>
                <textarea 
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  rows={4}
                  className="w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-2.5 text-sm focus:border-accent-primary outline-none resize-none"
                  placeholder="Cole aqui o texto do depoimento ou observações..."
                />
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border-card text-text-secondary font-bold hover:bg-background-sidebar transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-accent-primary text-white font-bold hover:opacity-90 transition-all shadow-lg"
                >
                  Salvar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Apologia;

import { cn } from '../lib/utils';
