import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Shield, Bell, Palette, Save, Camera, Mail, Phone, Building2, KeyRound, EyeOff, Eye, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useBusiness } from '../hooks/useBusiness';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';
import { useTheme } from '../hooks/useTheme';

const Settings: React.FC = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { activeBusiness, userRole } = useBusiness();
  const [activeTab, setActiveTab] = useState<'perfil' | 'seguranca' | 'notificacoes' | 'aparencia'>('perfil');
  
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Perfil State
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    avatar_url: ''
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || '',
        avatar_url: user.user_metadata?.avatar_url || ''
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await updateProfile(profileData);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar o perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      setIsSaving(true);
      await updatePassword(passwordData.newPassword);
      toast.success('Senha atualizada com sucesso!');
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Erro ao atualizar a senha.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'perfil', label: 'Meu Perfil', icon: User, description: 'Dados pessoais e informações de contato' },
    { id: 'seguranca', label: 'Segurança', icon: Shield, description: 'Troca de senha e proteção da conta' },
    { id: 'aparencia', label: 'Aparência', icon: Palette, description: 'Personalize o visual do sistema' },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Configurações</h1>
        <p className="text-sm text-text-secondary mt-1">Gerencie sua conta e personalize sua experiência no sistema</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de Tabs */}
        <div className="w-full lg:w-72 flex-shrink-0 space-y-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-full text-left flex items-start gap-4 p-4 rounded-2xl transition-all border",
                activeTab === tab.id
                  ? "bg-accent-primary/10 border-accent-primary/30 shadow-[0_0_20px_rgba(10,126,106,0.1)]"
                  : "bg-background-card border-transparent hover:bg-background-sidebar hover:border-border-card"
              )}
            >
              <div className={cn(
                "p-2.5 rounded-xl transition-colors",
                activeTab === tab.id ? "bg-accent-primary text-white shadow-lg shadow-accent-primary/20" : "bg-background-app text-text-tertiary group-hover:text-text-primary"
              )}>
                <tab.icon size={20} />
              </div>
              <div>
                <span className={cn(
                  "block text-sm font-bold transition-colors",
                  activeTab === tab.id ? "text-accent-primary" : "text-text-primary"
                )}>
                  {tab.label}
                </span>
                <span className="block text-xs text-text-tertiary mt-0.5 leading-snug">
                  {tab.description}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Conteúdo da Tab */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-background-card border border-border-card p-8 rounded-3xl shadow-xl"
            >
              {activeTab === 'perfil' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-6 pb-8 border-b border-border-card/50">
                    <div className="relative group">
                      {profileData.avatar_url ? (
                        <img src={profileData.avatar_url} alt="Avatar" className="w-24 h-24 rounded-3xl shadow-xl border-4 border-background-sidebar object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-background-sidebar">
                          {profileData.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                         <Camera className="text-white" size={24} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-text-primary">{profileData.full_name || 'Usuário Não Identificado'}</h3>
                      <p className="text-sm text-text-secondary mt-1 flex items-center gap-2">
                        <Building2 size={14} className="text-text-tertiary" />
                        {activeBusiness?.name || 'Nenhuma clínica vinculada'}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Badge variant="primary">{userRole === 'owner' ? '👑 Owner' : userRole === 'dentist' ? 'Dentista' : 'Admin'}</Badge>
                        <Badge variant="success">E-mail Confirmado</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest">Nome Completo</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                        <input
                          type="text"
                          value={profileData.full_name}
                          onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                          className="w-full bg-background-sidebar border border-border-card rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-text-primary outline-none focus:border-accent-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest">E-mail (Login)</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full bg-background-app/50 border border-border-card rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-text-tertiary outline-none cursor-not-allowed opacity-70"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest">Telefone / WhatsApp</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                        <input
                          type="text"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          placeholder="(11) 99999-9999"
                          className="w-full bg-background-sidebar border border-border-card rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-text-primary outline-none focus:border-accent-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest">URL da Foto de Perfil</label>
                      <div className="relative">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                        <input
                          type="url"
                          value={profileData.avatar_url}
                          onChange={(e) => setProfileData({ ...profileData, avatar_url: e.target.value })}
                          placeholder="https://suafoto.com/imagem.png"
                          className="w-full bg-background-sidebar border border-border-card rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium text-text-primary outline-none focus:border-accent-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border-card flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex items-center gap-2 bg-accent-primary text-white px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-accent-primary/90 transition-all shadow-lg shadow-accent-primary/20 disabled:opacity-50"
                    >
                      {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'seguranca' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                      <KeyRound className="text-accent-primary" size={20} />
                      Alterar Senha
                    </h3>
                    <p className="text-sm text-text-tertiary mt-1">
                      Mantenha sua conta segura atualizando sua senha periodicamente.
                    </p>
                  </div>

                  <div className="max-w-md space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest">Nova Senha</label>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Mínimo de 6 caracteres"
                          className="w-full bg-background-sidebar border border-border-card rounded-xl pl-12 pr-12 py-3.5 text-sm font-bold text-text-primary outline-none focus:border-accent-primary transition-all"
                        />
                        <button 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest">Confirme a Nova Senha</label>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="Digite a senha novamente"
                          className="w-full bg-background-sidebar border border-border-card rounded-xl pl-12 pr-12 py-3.5 text-sm font-bold text-text-primary outline-none focus:border-accent-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border-card flex justify-start">
                    <button
                      onClick={handleSavePassword}
                      disabled={isSaving || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                      className="flex items-center gap-2 bg-accent-primary text-white px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-accent-primary/90 transition-all shadow-lg shadow-accent-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Shield size={18} />}
                      Atualizar Senha
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'aparencia' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary mb-1">Tema do Sistema</h3>
                    <p className="text-sm text-text-tertiary mb-6">Escolha como o dashboard deve aparecer para você</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <button 
                        onClick={() => theme === 'dark' && toggleTheme()}
                        className={cn(
                          "p-4 rounded-2xl border-2 flex flex-col gap-3 transition-all",
                          theme === 'light' ? "border-accent-primary bg-accent-primary/5" : "border-border-card bg-background-sidebar hover:border-text-tertiary/30"
                        )}
                      >
                        <div className="w-full h-24 bg-gray-50 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-4 bg-white border-b border-gray-200" />
                          <div className="absolute top-4 left-0 w-8 h-full bg-white border-r border-gray-200" />
                        </div>
                        <span className="text-sm font-bold text-text-primary flex items-center justify-center w-full">Claro</span>
                      </button>
                      <button 
                        onClick={() => theme === 'light' && toggleTheme()}
                        className={cn(
                          "p-4 rounded-2xl border-2 flex flex-col gap-3 transition-all",
                          theme === 'dark' ? "border-accent-primary bg-accent-primary/5" : "border-border-card bg-background-sidebar hover:border-text-tertiary/30"
                        )}
                      >
                        <div className="w-full h-24 bg-gray-950 rounded-lg border border-gray-800 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-4 bg-gray-900 border-b border-gray-800" />
                          <div className="absolute top-4 left-0 w-8 h-full bg-gray-900 border-r border-gray-800" />
                        </div>
                        <span className="text-sm font-bold text-text-primary flex items-center justify-center w-full">Escuro</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'primary'; className?: string }> = ({ children, variant = 'primary', className }) => (
  <span className={cn(
    "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
    variant === 'success' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-accent-primary/10 text-accent-primary border border-accent-primary/20",
    className
  )}>
    {children}
  </span>
);

export default Settings;
