import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Phone, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

interface CompleteProfileModalProps {
  onComplete: () => void;
}

export const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({ onComplete }) => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user?.user_metadata?.full_name || '',
    phone: user?.user_metadata?.phone || '',
  });
  const [loading, setLoading] = useState(false);

  // If both full_name and phone are present, don't show the modal
  const needsProfileCompletion = !user?.user_metadata?.full_name || !user?.user_metadata?.phone;

  if (!needsProfileCompletion) {
    // Just an extra safety net, though Layout should handle this
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setLoading(true);
      await updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
      });
      toast.success('Perfil atualizado com sucesso!');
      onComplete();
    } catch (error) {
      toast.error('Erro ao atualizar o perfil. Tente novamente.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-background-app/90 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative w-full max-w-md bg-background-card border border-border-card rounded-3xl shadow-2xl overflow-hidden p-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-accent-primary/30">
              <span className="text-3xl">👋</span>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Bem-vindo(a)!
            </h2>
            <p className="text-text-secondary text-sm">
              Para começar a usar a plataforma, por favor, conclua seu cadastro com as informações abaixo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Seu nome completo"
                  className="w-full bg-background-app border border-border-card rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Telefone / WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-background-app border border-border-card rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-white px-6 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-accent-primary/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Concluir Cadastro
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
