import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, ShieldCheck, Zap, BarChart3, UserPlus, Mail, Lock, User, TrendingUp, Target, Building2, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

const FEATURES = [
  { icon: BarChart3, title: 'Analytics em Tempo Real', desc: 'Acompanhe leads, metas e faturamento ao vivo', color: 'from-emerald-500 to-teal-600' },
  { icon: TrendingUp, title: 'Funil Completo', desc: 'Da captação ao fechamento em um só lugar', color: 'from-blue-500 to-indigo-600' },
  { icon: Target, title: 'Gestão de Metas', desc: 'Defina e monitore seus objetivos mensais', color: 'from-purple-500 to-pink-600' },
  { icon: Building2, title: 'Multi-Clínica', desc: 'Gerencie várias unidades como agência', color: 'from-orange-500 to-amber-600' },
];

const STATS = [
  { value: '4.8×', label: 'ROI médio' },
  { value: '+320', label: 'Clínicas' },
  { value: '98%', label: 'Retenção' },
];

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  angle: number;
}

function ParticleField() {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.4 + 0.1,
      speed: Math.random() * 20 + 15,
      angle: Math.random() * 360,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-accent-primary"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.opacity }}
          animate={{
            x: [0, Math.cos(p.angle) * 60, 0],
            y: [0, Math.sin(p.angle) * 60, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
          }}
          transition={{ duration: p.speed, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 5 }}
        />
      ))}
    </div>
  );
}

export default function Login() {
  const { signIn, signUp, signInDemo } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [activeFeature, setActiveFeature] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const pendingInvite = sessionStorage.getItem('pending_invite');
  const inviteData = pendingInvite ? JSON.parse(pendingInvite) : null;

  useEffect(() => {
    if (inviteData?.email) {
      setFormData(prev => ({ ...prev, email: inviteData.email, name: inviteData.name || '' }));
      setIsLogin(false);
    }
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % FEATURES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
        toast.success('Bem-vindo de volta!');
      } else {
        if (!formData.name) throw new Error('Nome é obrigatório');
        await signUp(formData.email, formData.password, formData.name);
        toast.success('Conta criada! Bem-vindo ao Blent.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-app flex relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.4, 1], x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-15%] left-[-5%] w-[55%] h-[55%] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(10,126,106,0.12) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute bottom-[-15%] right-[-5%] w-[50%] h-[50%] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.10) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          className="absolute top-[40%] left-[40%] w-[25%] h-[25%] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }}
        />
        <ParticleField />
      </div>

      {/* ─── LEFT PANEL ─────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between flex-1 p-14 relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-[0_0_35px_rgba(10,126,106,0.5)]"
          >
            <Zap className="text-white" size={22} />
          </motion.div>
          <div>
            <span className="font-black text-lg tracking-tight gradient-text block">Blent Growth</span>
            <span className="text-[9px] text-text-tertiary font-bold uppercase tracking-[0.2em]">Plataforma Odontológica</span>
          </div>
        </motion.div>

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-8"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 bg-accent-primary/10 border border-accent-primary/20 rounded-full px-3 py-1.5 mb-6"
            >
              <Sparkles size={12} className="text-accent-primary" />
              <span className="text-xs font-bold text-accent-primary">Plataforma líder em crescimento odontológico</span>
            </motion.div>

            <h1 className="text-5xl font-black text-text-primary leading-[1.1] tracking-tight">
              Transforme sua{' '}
              <span className="gradient-text">clínica</span>{' '}
              em uma máquina de{' '}
              <span className="gradient-text">crescimento</span>.
            </h1>
            <p className="mt-5 text-lg text-text-secondary leading-relaxed max-w-lg">
              Acompanhe cada lead, otimize seus anúncios e feche mais pacientes com análises em tempo real.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-8">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <div className="text-3xl font-black gradient-text">{s.value}</div>
                <div className="text-xs text-text-tertiary font-bold uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Feature carousel */}
          <div className="space-y-2.5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                animate={{
                  opacity: activeFeature === i ? 1 : 0.4,
                  x: activeFeature === i ? 0 : -4,
                  scale: activeFeature === i ? 1 : 0.98,
                }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-default"
                style={{
                  background: activeFeature === i ? 'rgba(10,126,106,0.06)' : 'transparent',
                  borderColor: activeFeature === i ? 'rgba(10,126,106,0.25)' : 'var(--border-card)',
                }}
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center flex-shrink-0`}>
                  <f.icon size={17} className="text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary">{f.title}</h4>
                  <p className="text-xs text-text-tertiary">{f.desc}</p>
                </div>
                {activeFeature === i && (
                  <motion.div
                    layoutId="feature-dot"
                    className="ml-auto w-2 h-2 rounded-full bg-accent-primary"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom caption */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xs text-text-tertiary"
        >
          © 2025 Blent Growth · Todos os direitos reservados
        </motion.p>
      </div>

      {/* ─── DIVIDER ────────────────────────────────────── */}
      <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-border-card to-transparent my-12" />

      {/* ─── RIGHT PANEL (Form) ──────────────────────────── */}
      <div className="flex items-center justify-center w-full lg:w-[480px] lg:flex-shrink-0 p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
              <Zap className="text-white" size={18} />
            </div>
            <span className="font-black text-base gradient-text">Blent Growth</span>
          </div>

          {/* Card */}
          <div
            className="rounded-[28px] p-8 shadow-2xl"
            style={{
              background: 'var(--background-card)',
              border: '1px solid var(--border-card)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.08), 0 0 0 1px var(--border-card)',
            }}
          >
            {/* Invite banner */}
            <AnimatePresence>
              {inviteData && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-accent-primary/10 border border-accent-primary/20 rounded-2xl p-4"
                >
                  <p className="text-xs font-bold text-accent-primary">🎉 Convite de: {inviteData.business}</p>
                  <p className="text-xs text-text-secondary mt-1">Crie sua conta para acessar os dados analíticos</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tab toggle */}
            <div className="flex bg-background-app rounded-2xl p-1 mb-7 relative">
              <motion.div
                layout
                className="absolute top-1 bottom-1 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary shadow-lg shadow-accent-primary/25"
                style={{ left: isLogin ? '4px' : '50%', right: isLogin ? '50%' : '4px' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
              {[{ label: 'Entrar', active: isLogin }, { label: 'Cadastrar', active: !isLogin }].map((tab, i) => (
                <button
                  key={tab.label}
                  onClick={() => { setIsLogin(i === 0); setFormData({ email: '', password: '', name: '' }); }}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl relative z-10 transition-colors duration-300 ${
                    tab.active ? 'text-white' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Heading */}
            <div className="mb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? 'login' : 'signup'}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-2xl font-black text-text-primary tracking-tight">
                    {isLogin ? 'Bem-vindo de volta 👋' : 'Crie sua conta'}
                  </h2>
                  <p className="text-sm text-text-secondary mt-1">
                    {isLogin ? 'Acesse seu dashboard agora mesmo.' : 'Comece gratuitamente. Sem cartão de crédito.'}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <InputField
                      label="Nome Completo"
                      icon={<User size={15} />}
                      type="text"
                      placeholder="Dr. João Silva"
                      value={formData.name}
                      onChange={v => setFormData({ ...formData, name: v })}
                      focused={focusedField === 'name'}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <InputField
                label="E-mail"
                icon={<Mail size={15} />}
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={v => setFormData({ ...formData, email: v })}
                focused={focusedField === 'email'}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />

              <InputField
                label="Senha"
                icon={<Lock size={15} />}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={v => setFormData({ ...formData, password: v })}
                focused={focusedField === 'password'}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                suffix={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-text-tertiary hover:text-text-secondary transition-colors p-1">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />

              {/* Submit button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2.5 mt-2 relative overflow-hidden group disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #0A7E6A, #0D9488)',
                  boxShadow: '0 8px 30px rgba(10,126,106,0.35)',
                }}
              >
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-white/10 translate-x-[-110%] skew-x-[-20deg]"
                  animate={loading ? {} : { x: ['−110%', '110%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? <LogIn size={17} /> : <UserPlus size={17} />}
                    {isLogin ? 'Entrar no Dashboard' : 'Criar Conta Grátis'}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Demo access */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-px bg-border-card flex-1" />
                <span className="text-[11px] text-text-tertiary font-bold uppercase tracking-wider">ou acesse sem conta</span>
                <div className="h-px bg-border-card flex-1" />
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={signInDemo}
                className="w-full border border-border-card rounded-2xl py-3.5 text-sm font-bold text-text-secondary hover:border-accent-primary/40 hover:text-text-primary hover:bg-accent-primary/5 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck size={16} className="text-accent-primary" />
                Modo Demonstração
              </motion.button>
            </div>

            <p className="mt-5 text-center text-[11px] text-text-tertiary leading-relaxed">
              Ao continuar, você concorda com os{' '}
              <span className="text-accent-primary cursor-pointer hover:underline font-bold">Termos de Uso</span>
              {' '}e{' '}
              <span className="text-accent-primary cursor-pointer hover:underline font-bold">Privacidade</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  suffix?: React.ReactNode;
}

function InputField({ label, icon, type, placeholder, value, onChange, focused, onFocus, onBlur, suffix }: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-text-tertiary uppercase tracking-[0.15em] ml-1 flex items-center gap-1.5">
        {label}
      </label>
      <div
        className="relative flex items-center rounded-xl overflow-hidden transition-all duration-200"
        style={{
          background: 'var(--background-app)',
          border: `1.5px solid ${focused ? 'var(--color-accent-primary)' : 'var(--border-card)'}`,
          boxShadow: focused ? '0 0 0 4px rgba(10,126,106,0.08)' : 'none',
        }}
      >
        <div className={`absolute left-4 transition-colors duration-200 ${focused ? 'text-accent-primary' : 'text-text-tertiary'}`}>
          {icon}
        </div>
        <input
          type={type}
          required
          placeholder={placeholder}
          className="w-full bg-transparent pl-10 pr-4 py-3.5 text-sm font-medium text-text-primary placeholder:text-text-tertiary outline-none"
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {suffix && <div className="pr-3">{suffix}</div>}
      </div>
    </div>
  );
}
