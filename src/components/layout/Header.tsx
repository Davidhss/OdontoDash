import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, Plus, Sun, Moon, Calendar, LogOut, User, ChevronDown, Sparkles } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useBusiness } from '../../hooks/useBusiness';
import { BusinessSelector } from '../ui/BusinessSelector';
import { cn } from '../../lib/utils';

interface HeaderProps {
  onAddLead: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddLead }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { userRole } = useBusiness();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-20 border-b border-border-card bg-background-app/80 backdrop-blur-xl sticky top-0 z-30 px-8 flex items-center justify-between transition-all"
    >
      <div className="flex items-center gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex flex-col"
        >
          <motion.span
            className="text-sm font-bold gradient-text"
            whileHover={{ scale: 1.05 }}
          >
            Odonto Prime
          </motion.span>
          <span className="text-[10px] text-text-tertiary font-medium">Dr. Tarik Mohamed & Nassel Mohamed</span>
        </motion.div>

        <motion.div
          className="h-8 w-[1px] bg-border-card hidden md:block"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.3 }}
        />

        <BusinessSelector />

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="hidden md:flex items-center gap-2 bg-background-sidebar border border-border-card rounded-xl px-3 py-1.5 transition-all hover:border-accent-primary/30"
        >
          <Calendar size={16} className="text-text-secondary" />
          <select
            defaultValue="Este mês"
            className="bg-transparent border-none text-sm font-medium text-text-secondary focus:ring-0 cursor-pointer"
          >
            <option>Hoje</option>
            <option>Esta semana</option>
            <option>Este mês</option>
            <option>Personalizado</option>
          </select>
        </motion.div>
      </div>

      <div className="flex items-center gap-4">
        <motion.div
          className="relative hidden lg:block"
          animate={{ width: isSearchFocused ? 320 : 256 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <Search className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 transition-colors",
            isSearchFocused ? "text-accent-primary" : "text-text-tertiary"
          )} size={18} />
          <input
            type="text"
            placeholder="Buscar lead ou conversa..."
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={cn(
              "bg-background-sidebar border border-border-card rounded-xl pl-10 pr-4 py-2 text-sm transition-all w-full",
              isSearchFocused ? "border-accent-primary ring-4 ring-accent-primary/10" : ""
            )}
          />
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className={cn(
            "p-2.5 rounded-xl bg-background-sidebar border border-border-card transition-all relative overflow-hidden",
            theme === 'dark' ? "text-yellow-400" : "text-accent-secondary"
          )}
        >
          <motion.div
            animate={theme === 'dark' ? { rotate: 0 } : { rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </motion.div>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
          />
        </motion.button>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="relative">
          <button className="p-2.5 rounded-xl bg-background-sidebar border border-border-card text-text-secondary hover:text-text-primary transition-all relative">
            <Bell size={20} />
            <motion.span
              className="absolute top-2 right-2 w-2.5 h-2.5 bg-danger rounded-full border-2 border-background-sidebar"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </button>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddLead}
          className="flex items-center gap-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(10,126,106,0.4)] hover:shadow-[0_0_30px_rgba(10,126,106,0.6)]"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Novo Lead</span>
        </motion.button>

        <div className="relative">
          <div className="flex items-center gap-3 pl-4 border-l border-border-card ml-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex flex-col items-end hidden sm:flex cursor-pointer"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <span className="text-sm font-bold text-text-primary truncate max-w-[140px]">
                {user?.user_metadata?.full_name || user?.email || 'Usuário'}
              </span>
              <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-bold">
                {userRole === 'owner' ? '👑 Owner' : userRole === 'dentist' ? '🦷 Dentista' : userRole === 'admin' ? '⚙️ Admin' : 'Membro'}
              </span>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="relative group"
            >
              {user?.user_metadata?.avatar_url ? (
                <motion.img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  className="w-10 h-10 rounded-xl shadow-lg cursor-pointer border-2 border-background-card"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white font-bold shadow-lg cursor-pointer border-2 border-background-card"
                >
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </motion.div>
              )}
              <motion.div
                animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={16} className="text-text-tertiary absolute -right-6 top-1/2 -translate-y-1/2" />
              </motion.div>
            </motion.button>
          </div>

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
                  className="absolute top-full right-0 mt-3 w-56 glass-modal bg-background-card border border-border-card rounded-2xl shadow-2xl z-50 p-2"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 border-b border-border-card/50 mb-2"
                  >
                    <div className="flex items-center gap-3">
                      {user?.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt="Avatar"
                          className="w-12 h-12 rounded-xl border-2 border-border-card"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white font-bold text-xl">
                          {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-text-primary truncate">
                          {user?.user_metadata?.full_name || 'Usuário'}
                        </p>
                        <p className="text-xs text-text-tertiary truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-border-card/50 rounded-xl transition-all"
                  >
                    <User size={18} />
                    Meu Perfil
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={signOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-danger hover:bg-danger/10 rounded-xl transition-all"
                  >
                    <LogOut size={18} />
                    Sair do Dashboard
                  </motion.button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
};
