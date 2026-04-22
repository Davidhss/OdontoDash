import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Kanban,
  MessageSquare,
  BarChart3,
  Target,
  Settings,
  ChevronLeft,
  Stethoscope,
  RefreshCw,
  Video,
  DollarSign,
  Building2,
  CalendarDays,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useBusiness } from '../../hooks/useBusiness';

export const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();
  const { userRole, businesses } = useBusiness();

  const isOwner = userRole === 'owner' || userRole === 'admin';
  const hasMultipleBusinesses = businesses.length > 1 || isOwner;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', color: 'from-accent-primary to-accent-secondary' },
    { icon: Kanban, label: 'Pipeline', path: '/pipeline', color: 'from-accent-primary to-accent-secondary' },
    { icon: CalendarDays, label: 'Agendamentos', path: '/agendamentos', color: 'from-blue-500 to-indigo-600' },
    { icon: MessageSquare, label: 'Contatos', path: '/contatos', color: 'from-accent-primary to-accent-secondary' },
    { icon: RefreshCw, label: 'Follow-up', path: '/follow-up', color: 'from-accent-primary to-accent-secondary' },
    { icon: Video, label: 'Apologia', path: '/apologia', color: 'from-emerald-500 to-emerald-600' },
    { icon: BarChart3, label: 'Anúncios', path: '/ads', color: 'from-accent-alert to-orange-500' },
    { icon: Target, label: 'Metas', path: '/metas', color: 'from-accent-primary to-accent-secondary' },
    { icon: DollarSign, label: 'Comissão', path: '/comissao', color: 'from-emerald-500 to-emerald-600' },
    { icon: Settings, label: 'Configurações', path: '/settings', color: 'from-gray-500 to-gray-600' },
  ];

  // Agency item — only for owners/admins
  const agencyItem = { icon: Building2, label: 'Agência', path: '/agency', color: 'from-indigo-500 to-purple-600' };

  const allItems = isOwner
    ? [...menuItems.slice(0, menuItems.length - 1), agencyItem, menuItems[menuItems.length - 1]]
    : menuItems;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 240 : 80 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="fixed left-0 top-0 h-screen glass-sidebar border-r border-border-card z-40 flex flex-col"
    >
      <motion.div className="p-6 flex items-center justify-between" layout>
        <div className="flex items-center gap-3 overflow-hidden">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white shadow-[0_0_20px_rgba(10,126,106,0.5)] flex-shrink-0"
          >
            <Stethoscope size={22} />
          </motion.div>
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <span className="font-black text-base tracking-tight whitespace-nowrap gradient-text block">Odonto Prime</span>
                <span className="text-[9px] text-text-tertiary font-bold uppercase tracking-widest">Blent Growth</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto scrollbar-hide">
        {allItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const isAgencyItem = item.path === '/agency';

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="group relative block"
            >
              {isAgencyItem && isExpanded && (
                <div className="h-px bg-border-card mx-2 mb-1" />
              )}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04, duration: 0.3 }}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden",
                  isActive
                    ? "text-white shadow-lg"
                    : "text-text-secondary hover:text-text-primary hover:bg-border-card/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className={cn(
                      "absolute inset-0 bg-gradient-to-r rounded-xl",
                      isAgencyItem ? "from-indigo-600 to-purple-600" : "from-accent-primary to-accent-secondary"
                    )}
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl bg-gradient-to-r from-accent-primary/5 to-transparent" />

                <item.icon
                  size={20}
                  className={cn(
                    "relative z-10 transition-all duration-200 flex-shrink-0",
                    isActive && "drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]",
                    !isActive && "group-hover:scale-110"
                  )}
                />

                <AnimatePresence mode="wait">
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "font-semibold relative z-10 whitespace-nowrap text-sm",
                        isActive ? "text-white font-bold" : "group-hover:text-text-primary"
                      )}
                    >
                      {item.label}
                      {isAgencyItem && (
                        <motion.span
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="ml-2 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 uppercase tracking-wider"
                        >
                          PRO
                        </motion.span>
                      )}
                    </motion.span>
                  )}
                </AnimatePresence>

                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/80 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Tooltip when collapsed */}
                {!isExpanded && (
                  <motion.div className="absolute left-16 bg-background-card border border-border-card px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl text-text-primary">
                    {item.label}
                  </motion.div>
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse button */}
      <motion.div className="p-4" layout>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 rounded-xl bg-border-card/20 text-text-secondary hover:text-text-primary hover:bg-border-card/40 transition-all flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 0 : 180 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <ChevronLeft size={18} />
          </motion.div>
        </motion.button>
      </motion.div>
    </motion.aside>
  );
};
