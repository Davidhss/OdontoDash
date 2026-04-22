import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Plus, Share2, Zap, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { useBusiness } from '../../hooks/useBusiness';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

export const WelcomeScreen: React.FC = () => {
  const { createBusiness, joinBusiness } = useBusiness();
  
  // Check for pending invite from URL
  const pendingInviteStr = sessionStorage.getItem('pending_invite');
  const pendingInvite = pendingInviteStr ? JSON.parse(pendingInviteStr) : null;
  
  const [mode, setMode] = useState<'selection' | 'create' | 'join'>(pendingInvite ? 'join' : 'selection');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    nome: '', 
    regiao: '', 
    code: pendingInvite?.code || '' 
  });
  const [errors, setErrors] = useState({ nome: '', regiao: '', code: '' });

  const validateForm = () => {
    const newErrors = { nome: '', regiao: '', code: '' };

    if (mode === 'create') {
      if (!formData.nome.trim()) newErrors.nome = 'Nome da clínica é obrigatório';
      else if (formData.nome.length < 3) newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
      if (!formData.regiao.trim()) newErrors.regiao = 'Região é obrigatória';
    } else if (mode === 'join') {
      if (!formData.code.trim()) newErrors.code = 'Código de convite é obrigatório';
      else if (formData.code.length < 4) newErrors.code = 'Código inválido';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(e => !e);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);
    const result = await createBusiness(formData.nome, formData.regiao);

    if (!result) {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);
    const result = await joinBusiness(formData.code);

    if (!result) {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-app flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Glows */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-primary blur-[120px] rounded-full"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-secondary blur-[120px] rounded-full"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-xl bg-background-sidebar border border-border-card rounded-[32px] p-8 md:p-12 shadow-2xl relative z-10 backdrop-blur-xl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center text-center mb-12"
        >
          <motion.div
            initial={{ rotate: -180 }}
            animate={{ rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
            className="w-20 h-20 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(10,126,106,0.3)]"
          >
            <Zap className="text-accent-primary" size={40} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-black tracking-tight mb-4 bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent"
          >
            Bem-vindo ao Blent
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-text-secondary text-lg max-w-md"
          >
            Para começar, você precisa criar um novo negócio ou entrar em um já existente.
          </motion.p>
        </motion.div>

        <AnimatePresence mode="wait">
          {mode === 'selection' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('create')}
                className="group flex flex-col items-center text-center p-8 bg-background-app border border-border-card rounded-3xl hover:border-accent-primary transition-all hover:shadow-[0_0_40px_rgba(10,126,106,0.15)]"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-14 h-14 bg-accent-primary/10 rounded-2xl flex items-center justify-center text-accent-primary mb-6"
                >
                  <Plus size={28} />
                </motion.div>
                <h3 className="text-xl font-bold mb-2 text-text-primary">Criar Negócio</h3>
                <p className="text-sm text-text-tertiary">Inicie uma nova clínica e gere um código de convite.</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('join')}
                className="group flex flex-col items-center text-center p-8 bg-background-app border border-border-card rounded-3xl hover:border-accent-secondary transition-all hover:shadow-[0_0_40px_rgba(13,148,136,0.15)]"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-14 h-14 bg-accent-secondary/10 rounded-2xl flex items-center justify-center text-accent-secondary mb-6"
                >
                  <Share2 size={28} />
                </motion.div>
                <h3 className="text-xl font-bold mb-2 text-text-primary">Entrar com Código</h3>
                <p className="text-sm text-text-tertiary">Acesse os dados de uma clínica já existente.</p>
              </motion.button>
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.form
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleCreate}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest ml-1">Nome da Clínica</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-accent-primary transition-colors" size={20} />
                  <input
                    required
                    type="text"
                    placeholder="Ex: Blent Odonto - Unidade Sul"
                    value={formData.nome}
                    onChange={(e) => {
                      setFormData({ ...formData, nome: e.target.value });
                      setErrors({ ...errors, nome: '' });
                    }}
                    className={cn(
                      "w-full bg-background-app border border-border-card rounded-2xl pl-12 pr-4 py-4 text-base font-bold text-text-primary outline-none transition-all",
                      errors.nome ? "border-danger focus:border-danger" : "focus:border-accent-primary"
                    )}
                  />
                  {errors.nome && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-danger text-xs mt-1 flex items-center gap-1"
                    >
                      <AlertCircle size={12} />
                      {errors.nome}
                    </motion.p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest ml-1">Região</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-accent-primary transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Ex: São Paulo - SP"
                    value={formData.regiao}
                    onChange={(e) => {
                      setFormData({ ...formData, regiao: e.target.value });
                      setErrors({ ...errors, regiao: '' });
                    }}
                    className={cn(
                      "w-full bg-background-app border border-border-card rounded-2xl pl-12 pr-4 py-4 text-base font-bold text-text-primary outline-none transition-all",
                      errors.regiao ? "border-danger focus:border-danger" : "focus:border-accent-primary"
                    )}
                  />
                  {errors.regiao && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-danger text-xs mt-1 flex items-center gap-1"
                    >
                      <AlertCircle size={12} />
                      {errors.regiao}
                    </motion.p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setMode('selection');
                    setErrors({ nome: '', regiao: '', code: '' });
                  }}
                  className="flex-1 px-6 py-4 rounded-2xl border border-border-card text-base font-bold text-text-secondary hover:bg-background-app transition-all"
                >
                  Voltar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-accent-primary to-accent-secondary text-background-app font-black text-lg hover:opacity-90 transition-all shadow-lg shadow-accent-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-background-app border-t-transparent rounded-full animate-spin" />
                      <span>Criando...</span>
                    </div>
                  ) : (
                    <>
                      Criar Agora
                      <ArrowRight size={20} />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.form>
          )}

          {mode === 'join' && (
            <motion.form
              key="join"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleJoin}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest ml-1">Código de Convite</label>
                <div className="relative group">
                  <Share2 className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-accent-primary transition-colors" size={20} />
                  <input
                    required
                    type="text"
                    placeholder="Digite o código (ex: AB12CD)"
                    value={formData.code}
                    onChange={(e) => {
                      setFormData({ ...formData, code: e.target.value.toUpperCase() });
                      setErrors({ ...errors, code: '' });
                    }}
                    className={cn(
                      "w-full bg-background-app border border-border-card rounded-2xl pl-12 pr-4 py-4 text-xl font-mono font-bold text-text-primary outline-none transition-all uppercase tracking-widest",
                      errors.code ? "border-danger focus:border-danger" : "focus:border-accent-primary"
                    )}
                  />
                  {errors.code && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-danger text-xs mt-1 flex items-center gap-1"
                    >
                      <AlertCircle size={12} />
                      {errors.code}
                    </motion.p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setMode('selection');
                    setErrors({ nome: '', regiao: '', code: '' });
                  }}
                  className="flex-1 px-6 py-4 rounded-2xl border border-border-card text-base font-bold text-text-secondary hover:bg-background-app transition-all"
                >
                  Voltar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-accent-secondary to-accent-primary text-background-app font-black text-lg hover:opacity-90 transition-all shadow-lg shadow-accent-secondary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-background-app border-t-transparent rounded-full animate-spin" />
                      <span>Entrando...</span>
                    </div>
                  ) : (
                    <>
                      Entrar no Negócio
                      <ArrowRight size={20} />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const MapPin = ({ size, className }: { size: number, className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
