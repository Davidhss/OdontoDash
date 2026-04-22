import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, ChevronDown, Plus, MapPin, Check, UserPlus, Copy, Share2 } from 'lucide-react';
import { useBusiness } from '../../hooks/useBusiness';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

export const BusinessSelector: React.FC = () => {
  const { activeBusiness, setActiveBusiness, businesses, createBusiness, joinBusiness } = useBusiness();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'create' | 'join'>('create');
  const [newBusiness, setNewBusiness] = useState({ nome: '', regiao: '' });
  const [inviteCode, setInviteCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    const result = await createBusiness(newBusiness.nome, newBusiness.regiao);
    if (result) {
      setIsModalOpen(false);
      setNewBusiness({ nome: '', regiao: '' });
      toast.success('Negócio criado com sucesso!');
    }
    setIsProcessing(false);
  };

  const handleJoinBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    const result = await joinBusiness(inviteCode);
    if (result) {
      setIsModalOpen(false);
      setInviteCode('');
    }
    setIsProcessing(false);
  };

  const copyInviteCode = () => {
    if (activeBusiness?.invite_code) {
      navigator.clipboard.writeText(activeBusiness.invite_code);
      toast.success('Código copiado!');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-background-sidebar border border-border-card rounded-xl px-4 py-2 hover:border-accent-primary transition-all group"
      >
        <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary">
          <Building2 size={18} />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest leading-none mb-1">Negócio Ativo</p>
          <h4 className="text-sm font-bold text-text-primary leading-none truncate max-w-[120px]">
            {activeBusiness?.nome || 'Selecionar...'}
          </h4>
        </div>
        <ChevronDown size={16} className={cn("text-text-tertiary transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 w-72 bg-background-card border border-border-card rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {activeBusiness && (
                <div className="p-4 border-b border-border-card bg-background-sidebar/50">
                  <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-2">Código de Convite</p>
                  <div className="flex items-center justify-between bg-background-app rounded-lg px-3 py-2 border border-border-card">
                    <span className="font-mono font-bold text-accent-primary">{activeBusiness.invite_code}</span>
                    <button onClick={copyInviteCode} className="text-text-tertiary hover:text-accent-primary transition-colors">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              )}

              <div className="p-2 max-h-64 overflow-y-auto scrollbar-hide">
                {businesses.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setActiveBusiness(b);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl transition-all group",
                      activeBusiness?.id === b.id 
                        ? "bg-accent-primary/10 text-accent-primary" 
                        : "hover:bg-background-sidebar text-text-secondary hover:text-text-primary"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        activeBusiness?.id === b.id ? "bg-accent-primary text-background-app" : "bg-background-sidebar"
                      )}>
                        <Building2 size={16} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold truncate">{b.nome}</p>
                        <p className="text-[10px] opacity-70">{b.regiao || 'Sem região'}</p>
                      </div>
                    </div>
                    {activeBusiness?.id === b.id && <Check size={16} />}
                  </button>
                ))}
              </div>
              <div className="p-2 border-t border-border-card bg-background-sidebar/30">
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-accent-primary hover:bg-accent-primary/10 transition-all font-bold text-sm"
                >
                  <Plus size={18} />
                  Gerenciar Negócios
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de Gerenciamento */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-background-card border border-border-card rounded-3xl shadow-2xl p-8"
            >
              <div className="flex gap-4 mb-8">
                <button 
                  onClick={() => setModalTab('create')}
                  className={cn(
                    "flex-1 py-2 rounded-xl font-bold text-sm transition-all",
                    modalTab === 'create' ? "bg-accent-primary text-background-app" : "text-text-secondary hover:bg-background-sidebar"
                  )}
                >
                  Criar Novo
                </button>
                <button 
                  onClick={() => setModalTab('join')}
                  className={cn(
                    "flex-1 py-2 rounded-xl font-bold text-sm transition-all",
                    modalTab === 'join' ? "bg-accent-primary text-background-app" : "text-text-secondary hover:bg-background-sidebar"
                  )}
                >
                  Entrar com Código
                </button>
              </div>

              {modalTab === 'create' ? (
                <form onSubmit={handleCreateBusiness} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Nome da Unidade</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                      <input
                        required
                        type="text"
                        placeholder="Ex: Blent Odonto - Unidade Sul"
                        value={newBusiness.nome}
                        onChange={(e) => setNewBusiness({ ...newBusiness, nome: e.target.value })}
                        className="w-full bg-background-sidebar border border-border-card rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Região / Localização</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                      <input
                        type="text"
                        placeholder="Ex: São Paulo - SP"
                        value={newBusiness.regiao}
                        onChange={(e) => setNewBusiness({ ...newBusiness, regiao: e.target.value })}
                        className="w-full bg-background-sidebar border border-border-card rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent-primary transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full px-6 py-4 rounded-xl bg-accent-primary text-background-app font-black hover:opacity-90 transition-all shadow-lg shadow-accent-primary/20 disabled:opacity-50"
                  >
                    {isProcessing ? 'Criando...' : 'Criar Negócio'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleJoinBusiness} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Código de Convite</label>
                    <div className="relative">
                      <Share2 className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                      <input
                        required
                        type="text"
                        placeholder="Digite o código (ex: AB12CD)"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        className="w-full bg-background-sidebar border border-border-card rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent-primary transition-all uppercase"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full px-6 py-4 rounded-xl bg-accent-primary text-background-app font-black hover:opacity-90 transition-all shadow-lg shadow-accent-primary/20 disabled:opacity-50"
                  >
                    {isProcessing ? 'Entrando...' : 'Entrar no Negócio'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
