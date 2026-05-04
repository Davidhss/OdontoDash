import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Kanban,
  MessageCircle,
  BarChart3,
  Settings,
  ChevronLeft,
  Stethoscope,
  CalendarDays,
  MessageSquare,
  RefreshCw,
  Video,
  Target,
  DollarSign,
  Building2,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useBusiness } from '../../hooks/useBusiness';

export const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();
  const { userRole, businesses } = useBusiness();

  const isOwner = userRole === 'owner' || userRole === 'admin';

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', emoji: '📊' },
    { icon: Kanban, label: 'Pipeline', path: '/pipeline', emoji: '🎯' },
    { icon: MessageCircle, label: 'WhatsApp', path: '/whatsapp', emoji: '💬' },
    { icon: CalendarDays, label: 'Agendamentos', path: '/agendamentos', emoji: '📅' },
    { icon: MessageSquare, label: 'Contatos', path: '/contatos', emoji: '📞' },
    { icon: RefreshCw, label: 'Follow-up', path: '/follow-up', emoji: '🔄' },
    { icon: Video, label: 'Apologia', path: '/apologia', emoji: '🎥' },
    { icon: BarChart3, label: 'Anúncios', path: '/ads', emoji: '📈' },
    { icon: Target, label: 'Metas', path: '/metas', emoji: '🏆' },
    { icon: DollarSign, label: 'Comissão', path: '/comissao', emoji: '💰' },
    { icon: Settings, label: 'Configurações', path: '/settings', emoji: '⚙️' },
  ];

  const agencyItem = { icon: Building2, label: 'Agência', path: '/agency', emoji: '🏢' };

  const allItems = isOwner
    ? [...menuItems.slice(0, menuItems.length - 1), agencyItem, menuItems[menuItems.length - 1]]
    : menuItems;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 220 : 72 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="fixed left-0 top-0 h-screen bg-background-card border-r border-border-card z-40 flex flex-col"
    >
      {/* Logo */}
      <motion.div className="px-5 py-5 flex items-center gap-3" layout>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 flex-shrink-0"
        >
          <Stethoscope size={20} />
        </motion.div>
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <span className="font-black text-sm tracking-tight whitespace-nowrap text-text-primary block">Odonto Prime</span>
              <span className="text-[9px] text-text-tertiary font-bold uppercase tracking-widest">Dashboard</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Divider */}
      <div className="mx-4 h-px bg-border-card/60" />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto scrollbar-hide">
        {allItems.map((item, index) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);
          const isAgencyItem = item.path === '/agency';

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="group relative block"
            >
              {isAgencyItem && isExpanded && (
                <div className="h-px bg-border-card mx-2 mb-2 mt-1" />
              )}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden",
                  isActive
                    ? "text-white shadow-md"
                    : "text-text-secondary hover:text-text-primary hover:bg-border-card/40"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}

                <item.icon
                  size={18}
                  className={cn(
                    "relative z-10 transition-transform duration-200 flex-shrink-0",
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
                        "font-semibold relative z-10 whitespace-nowrap text-[13px]",
                        isActive && "font-bold"
                      )}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip when collapsed */}
                {!isExpanded && (
                  <div className="absolute left-14 bg-background-card border border-border-card px-2.5 py-1 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl text-text-primary">
                    {item.label}
                  </div>
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse button */}
      <motion.div className="p-3" layout>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-2.5 rounded-xl bg-border-card/15 text-text-tertiary hover:text-text-primary hover:bg-border-card/30 transition-all flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 0 : 180 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <ChevronLeft size={16} />
          </motion.div>
        </motion.button>
      </motion.div>
    </motion.aside>
  );
};
