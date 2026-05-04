import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, LogOut, User, ChevronDown } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useBusiness } from '../../hooks/useBusiness';

interface HeaderProps {
  onAddLead: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddLead }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { userRole } = useBusiness();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 border-b border-border-card bg-background-app/80 backdrop-blur-xl sticky top-0 z-30 px-8 flex items-center justify-end gap-3 transition-all"
    >
      {/* Theme Toggle */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 15 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleTheme}
        className="p-2 rounded-xl bg-background-sidebar border border-border-card transition-all text-text-secondary hover:text-text-primary"
      >
        {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
      </motion.button>

      {/* User Menu */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="flex items-center gap-2.5 pl-3 border-l border-border-card ml-1 cursor-pointer"
        >
          {user?.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              className="w-9 h-9 rounded-xl shadow-md border-2 border-background-card"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white font-bold shadow-md border-2 border-background-card text-sm">
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
          )}
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-xs font-bold text-text-primary truncate max-w-[120px]">
              {user?.user_metadata?.full_name || 'Usuário'}
            </span>
            <span className="text-[9px] text-text-tertiary uppercase tracking-wider font-bold">
              {userRole === 'owner' ? '👑 Owner' : userRole === 'dentist' ? '🦷 Dentista' : userRole === 'admin' ? '⚙️ Admin' : 'Membro'}
            </span>
          </div>
          <ChevronDown size={14} className={`text-text-tertiary transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
        </motion.button>

        <AnimatePresence>
          {isUserMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsUserMenuOpen(false)}
                className="fixed inset-0 z-40"
              />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute top-full right-0 mt-2 w-52 bg-background-card border border-border-card rounded-2xl shadow-2xl z-50 p-2"
              >
                <div className="p-3 border-b border-border-card/50 mb-1">
                  <p className="text-sm font-bold text-text-primary truncate">
                    {user?.user_metadata?.full_name || 'Usuário'}
                  </p>
                  <p className="text-xs text-text-tertiary truncate">{user?.email}</p>
                </div>

                <button
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-border-card/50 rounded-xl transition-all"
                >
                  <User size={16} />
                  Meu Perfil
                </button>

                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-danger hover:bg-danger/10 rounded-xl transition-all"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};
