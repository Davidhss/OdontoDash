import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Shield, Bell, Palette, Save, Camera, Mail, Phone, Building2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'perfil' | 'seguranca' | 'notificacoes' | 'aparencia'>('perfil');
  
  const [profileData, setProfileData] = useState({
    nome: user?.displayName || '',
    email: user?.email || '',
    telefone: '(11) 99999-9999',
    clinica: 'Blent Odontologia',
    cargo: 'Administrador'
  });

  const handleSave = () => {
    toast.success('Configurações salvas com sucesso!');
  };

  const tabs = [
    { id: 'perfil', label: 'Meu Perfil', icon: User },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'aparencia', label: 'Aparência', icon: Palette },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Configurações</h1>
        <p className="text-sm text-text-secondary">Gerencie sua conta e preferências do sistema</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar de Tabs */}
        <div className="w-full md:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === tab.id
                  ? "bg-accent-primary text-background-app shadow-lg shadow-accent-primary/20"
                  : "text-text-secondary hover:bg-background-card hover:text-text-primary"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo da Tab */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-8 rounded-3xl space-y-8"
          >
            {activeTab === 'perfil' && (
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-24 h-24 rounded-3xl shadow-xl border-4 border-background-card" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-24 h-24 rounded-3xl bg-accent-secondary flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-background-card">
                        {profileData.nome.charAt(0)}
                      </div>
                    )}
                    <button className="absolute -bottom-2 -right-2 p-2 bg-accent-primary text-background-app rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={16} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">{profileData.nome}</h3>
                    <p className="text-sm text-text-secondary">{profileData.cargo}</p>
                    <Badge variant="success" className="mt-2">Conta Verificada</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                      <input
                        type="text"
                        value={profileData.nome}
                        onChange={(e) => setProfileData({ ...profileData, nome: e.target.value })}
                        className="w-full bg-background-app border border-border-card rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full bg-background-app/50 border border-border-card rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-text-tertiary outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Telefone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                      <input
                        type="text"
                        value={profileData.telefone}
                        onChange={(e) => setProfileData({ ...profileData, telefone: e.target.value })}
                        className="w-full bg-background-app border border-border-card rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Clínica / Empresa</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                      <input
                        type="text"
                        value={profileData.clinica}
                        onChange={(e) => setProfileData({ ...profileData, clinica: e.target.value })}
                        className="w-full bg-background-app border border-border-card rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent-primary transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'aparencia' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">Tema do Sistema</h3>
                  <p className="text-sm text-text-secondary mb-6">Escolha como o dashboard deve aparecer para você</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 rounded-2xl border-2 border-accent-primary bg-background-app flex flex-col gap-3">
                      <div className="w-full h-20 bg-white rounded-lg border border-gray-200" />
                      <span className="text-sm font-bold text-text-primary">Claro</span>
                    </button>
                    <button className="p-4 rounded-2xl border-2 border-border-card bg-background-app flex flex-col gap-3 opacity-50">
                      <div className="w-full h-20 bg-gray-900 rounded-lg border border-gray-800" />
                      <span className="text-sm font-bold text-text-primary">Escuro</span>
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-border-card">
                  <h3 className="text-lg font-bold text-text-primary mb-2">Cor de Destaque</h3>
                  <p className="text-sm text-text-secondary mb-6">Personalize a cor principal da interface</p>
                  
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#3B82F6] border-4 border-white shadow-lg cursor-pointer" />
                    <div className="w-10 h-10 rounded-full bg-[#00D4AA] opacity-30 cursor-not-allowed" />
                    <div className="w-10 h-10 rounded-full bg-[#6366F1] opacity-30 cursor-not-allowed" />
                    <div className="w-10 h-10 rounded-full bg-[#EF4444] opacity-30 cursor-not-allowed" />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-8 border-t border-border-card flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-accent-primary text-background-app px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-accent-primary/20"
              >
                <Save size={18} />
                Salvar Alterações
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'primary'; className?: string }> = ({ children, variant = 'primary', className }) => (
  <span className={cn(
    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
    variant === 'success' ? "bg-emerald-500/10 text-emerald-500" : "bg-accent-primary/10 text-accent-primary",
    className
  )}>
    {children}
  </span>
);

export default Settings;
