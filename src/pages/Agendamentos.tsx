import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  Stethoscope,
  X,
  CalendarDays,
  LayoutGrid,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Circle,
  Tag,
  FileText,
  Thermometer,
} from 'lucide-react';
import { useBusiness } from '../hooks/useBusiness';
import { supabase } from '../lib/supabase';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isToday,
  parseISO,
  getHours,
  getMinutes,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../lib/utils';

// Types
interface Agendamento {
  id: string;
  nome: string;
  telefone: string | null;
  servico: string | null;
  etapa: string | null;
  data_consulta: string;
  anotacoes: string | null;
  temperatura: string | null;
  procedimento_interesse: string | null;
  valor_fechado: number | null;
}

// Color maps
const SERVICO_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  'Implante':       { bg: 'bg-blue-500/15',   text: 'text-blue-600 dark:text-blue-400',   border: 'border-blue-500/30',   dot: 'bg-blue-500' },
  'Protocolo':      { bg: 'bg-purple-500/15',  text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/30', dot: 'bg-purple-500' },
  'Estética':       { bg: 'bg-pink-500/15',    text: 'text-pink-600 dark:text-pink-400',   border: 'border-pink-500/30',   dot: 'bg-pink-500' },
  'Clareamento':    { bg: 'bg-yellow-500/15',  text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-500' },
  'Cirurgia':       { bg: 'bg-red-500/15',     text: 'text-red-600 dark:text-red-400',     border: 'border-red-500/30',    dot: 'bg-red-500' },
  'Periodontia':    { bg: 'bg-green-500/15',   text: 'text-green-600 dark:text-green-400', border: 'border-green-500/30',  dot: 'bg-green-500' },
  'Ortodontia':     { bg: 'bg-indigo-500/15',  text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/30', dot: 'bg-indigo-500' },
};
const DEFAULT_COLOR = { bg: 'bg-accent-primary/10', text: 'text-accent-primary', border: 'border-accent-primary/20', dot: 'bg-accent-primary' };

const TEMPERATURA_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  quente: { label: 'Quente 🔥', color: 'text-red-500', icon: Thermometer },
  morno:  { label: 'Morno',     color: 'text-amber-500', icon: Thermometer },
  frio:   { label: 'Frio 🧊',   color: 'text-blue-400', icon: Thermometer },
};

const ETAPA_MAP: Record<string, { label: string; color: string }> = {
  novo_lead:         { label: 'Novo Lead',        color: 'text-text-tertiary' },
  contato_feito:     { label: 'Contato Feito',    color: 'text-blue-500' },
  consulta_agendada: { label: 'Consulta Agendada', color: 'text-amber-500' },
  consulta_realizada:{ label: 'Realizada',        color: 'text-emerald-500' },
  cliente_fechado:   { label: 'Fechado ✅',       color: 'text-emerald-600' },
  perdido:           { label: 'Perdido',          color: 'text-red-500' },
};

const WORK_HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7h to 18h

function getServiceColor(servico: string | null) {
  if (!servico) return DEFAULT_COLOR;
  const key = Object.keys(SERVICO_COLORS).find(k => servico.toLowerCase().includes(k.toLowerCase()));
  return key ? SERVICO_COLORS[key] : DEFAULT_COLOR;
}

// ─── AppointmentDrawer ────────────────────────────────────────────────────────
interface DrawerProps {
  agendamento: Agendamento | null;
  onClose: () => void;
}

function AppointmentDrawer({ agendamento: ag, onClose }: DrawerProps) {
  if (!ag) return null;
  const colors = getServiceColor(ag.servico);
  const temp = ag.temperatura ? TEMPERATURA_MAP[ag.temperatura] : null;
  const etapa = ag.etapa ? ETAPA_MAP[ag.etapa] : null;
  const hora = format(parseISO(ag.data_consulta), 'HH:mm', { locale: ptBR });
  const dataFull = format(parseISO(ag.data_consulta), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex justify-end"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-md h-full bg-background-card border-l border-border-card shadow-2xl flex flex-col overflow-y-auto"
        >
          {/* Header */}
          <div className={cn('p-6 border-b border-border-card relative overflow-hidden', colors.bg)}>
            <div className={cn('absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-30', colors.dot)} style={{ filter: 'blur(24px)' }} />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <div className={cn('inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border mb-3', colors.bg, colors.text, colors.border)}>
                  <Stethoscope size={11} />
                  {ag.servico || 'Consulta'}
                </div>
                <h2 className="text-xl font-black text-text-primary leading-tight">{ag.nome}</h2>
                <p className="text-sm text-text-secondary mt-1 capitalize">{dataFull} · {hora}</p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-background-app border border-border-card flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5 flex-1">
            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              <InfoCard icon={Clock} label="Horário" value={hora} />
              {ag.telefone && <InfoCard icon={Phone} label="Telefone" value={ag.telefone} />}
              {etapa && (
                <div className="bg-background-app rounded-xl p-3 border border-border-card">
                  <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider mb-1">Etapa</p>
                  <p className={cn('text-sm font-bold', etapa.color)}>{etapa.label}</p>
                </div>
              )}
              {temp && (
                <div className="bg-background-app rounded-xl p-3 border border-border-card">
                  <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider mb-1">Temperatura</p>
                  <p className={cn('text-sm font-bold', temp.color)}>{temp.label}</p>
                </div>
              )}
            </div>

            {/* Procedimento */}
            {ag.procedimento_interesse && (
              <div className="bg-background-app rounded-xl p-4 border border-border-card">
                <div className="flex items-center gap-2 mb-1">
                  <Tag size={13} className="text-accent-primary" />
                  <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider">Procedimento de Interesse</p>
                </div>
                <p className="text-sm text-text-primary font-semibold">{ag.procedimento_interesse}</p>
              </div>
            )}

            {/* Valor fechado */}
            {ag.valor_fechado && ag.valor_fechado > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1">Valor Fechado</p>
                <p className="text-xl font-black text-emerald-600">
                  {ag.valor_fechado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            )}

            {/* Anotações */}
            {ag.anotacoes && (
              <div className="bg-background-app rounded-xl p-4 border border-border-card">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={13} className="text-accent-primary" />
                  <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider">Anotações</p>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{ag.anotacoes}</p>
              </div>
            )}

            {/* WhatsApp CTA */}
            {ag.telefone && (
              <motion.a
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                href={`https://wa.me/55${ag.telefone.replace(/\D/g, '')}?text=Olá, ${ag.nome}! Confirmando sua consulta de ${ag.servico || 'Consulta'} agendada para ${hora}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 8px 20px rgba(34,197,94,0.3)' }}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Confirmar via WhatsApp
              </motion.a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="bg-background-app rounded-xl p-3 border border-border-card">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} className="text-accent-primary" />
        <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-sm font-bold text-text-primary">{value}</p>
    </div>
  );
}

// ─── MonthView ────────────────────────────────────────────────────────────────
interface MonthViewProps {
  currentDate: Date;
  agendamentos: Agendamento[];
  onSelectDay: (day: Date) => void;
  selectedDay: Date | null;
  onSelectAgendamento: (ag: Agendamento) => void;
}

function MonthView({ currentDate, agendamentos, onSelectDay, selectedDay, onSelectAgendamento }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { locale: ptBR });
  const calEnd = endOfWeek(monthEnd, { locale: ptBR });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const agendamentosByDay = useMemo(() => {
    const map: Record<string, Agendamento[]> = {};
    agendamentos.forEach(ag => {
      const key = format(parseISO(ag.data_consulta), 'yyyy-MM-dd');
      if (!map[key]) map[key] = [];
      map[key].push(ag);
    });
    return map;
  }, [agendamentos]);

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-border-card">
        {dayNames.map(d => (
          <div key={d} className="py-3 text-center text-[11px] font-black text-text-tertiary uppercase tracking-widest">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 divide-x divide-border-card">
        {days.map((day, idx) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayAgs = agendamentosByDay[key] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
          const todayFlag = isToday(day);

          return (
            <motion.div
              key={idx}
              whileHover={{ backgroundColor: 'rgba(10,126,106,0.04)' }}
              onClick={() => onSelectDay(day)}
              className={cn(
                'min-h-[100px] p-2 cursor-pointer transition-colors border-b border-border-card relative',
                !isCurrentMonth && 'opacity-30',
                isSelected && 'ring-2 ring-inset ring-accent-primary/50 bg-accent-primary/5',
              )}
            >
              {/* Day number */}
              <div className="flex items-center justify-end mb-1">
                <span
                  className={cn(
                    'w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold',
                    todayFlag
                      ? 'bg-accent-primary text-white shadow-md shadow-accent-primary/40'
                      : 'text-text-secondary',
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Appointment dots */}
              <div className="space-y-1">
                {dayAgs.slice(0, 3).map((ag, i) => {
                  const colors = getServiceColor(ag.servico);
                  return (
                    <motion.div
                      key={ag.id}
                      whileHover={{ scale: 1.03 }}
                      onClick={e => { e.stopPropagation(); onSelectAgendamento(ag); }}
                      className={cn(
                        'w-full px-1.5 py-0.5 rounded-md text-[10px] font-bold truncate flex items-center gap-1 cursor-pointer border',
                        colors.bg, colors.text, colors.border
                      )}
                    >
                      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', colors.dot)} />
                      <span className="truncate">
                        {format(parseISO(ag.data_consulta), 'HH:mm')} {ag.nome.split(' ')[0]}
                      </span>
                    </motion.div>
                  );
                })}
                {dayAgs.length > 3 && (
                  <div className="text-[10px] text-accent-primary font-bold pl-1">
                    +{dayAgs.length - 3} mais
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── WeekView ─────────────────────────────────────────────────────────────────
interface WeekViewProps {
  currentDate: Date;
  agendamentos: Agendamento[];
  onSelectAgendamento: (ag: Agendamento) => void;
}

function WeekView({ currentDate, agendamentos, onSelectAgendamento }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { locale: ptBR });
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const agendamentosByDay = useMemo(() => {
    const map: Record<string, Agendamento[]> = {};
    agendamentos.forEach(ag => {
      const key = format(parseISO(ag.data_consulta), 'yyyy-MM-dd');
      if (!map[key]) map[key] = [];
      map[key].push(ag);
    });
    return map;
  }, [agendamentos]);

  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      {/* Header row with day names */}
      <div className="grid border-b border-border-card" style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}>
        <div className="p-3" />
        {weekDays.map(d => (
          <div
            key={d.toISOString()}
            className={cn(
              'p-3 text-center border-l border-border-card',
              isToday(d) && 'bg-accent-primary/5',
            )}
          >
            <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-wide">
              {format(d, 'EEE', { locale: ptBR })}
            </p>
            <p
              className={cn(
                'text-lg font-black mt-0.5',
                isToday(d) ? 'gradient-text' : 'text-text-primary',
              )}
            >
              {format(d, 'd')}
            </p>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="overflow-y-auto max-h-[600px]">
        {WORK_HOURS.map(hour => (
          <div
            key={hour}
            className="grid border-b border-border-card/50"
            style={{ gridTemplateColumns: '64px repeat(7, 1fr)', minHeight: '80px' }}
          >
            {/* Hour label */}
            <div className="p-2 text-right pr-3 flex items-start justify-end pt-2">
              <span className="text-[11px] text-text-tertiary font-bold">{String(hour).padStart(2, '0')}:00</span>
            </div>

            {/* Day columns */}
            {weekDays.map(d => {
              const key = format(d, 'yyyy-MM-dd');
              const dayAgs = (agendamentosByDay[key] || []).filter(ag => {
                const h = getHours(parseISO(ag.data_consulta));
                return h === hour;
              });

              return (
                <div
                  key={d.toISOString()}
                  className={cn(
                    'border-l border-border-card/50 p-1 relative',
                    isToday(d) && 'bg-accent-primary/3',
                  )}
                >
                  {dayAgs.map(ag => {
                    const colors = getServiceColor(ag.servico);
                    const mins = getMinutes(parseISO(ag.data_consulta));
                    return (
                      <motion.div
                        key={ag.id}
                        whileHover={{ scale: 1.03, zIndex: 10 }}
                        onClick={() => onSelectAgendamento(ag)}
                        className={cn(
                          'rounded-lg p-2 mb-1 cursor-pointer border text-left w-full relative',
                          colors.bg, colors.border,
                        )}
                        style={{ marginTop: `${(mins / 60) * 100}%` }}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', colors.dot)} />
                          <span className={cn('text-[10px] font-black', colors.text)}>
                            {format(parseISO(ag.data_consulta), 'HH:mm')}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-text-primary truncate">{ag.nome.split(' ')[0]}</p>
                        {ag.servico && (
                          <p className={cn('text-[9px] truncate font-semibold', colors.text)}>{ag.servico}</p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DayPanel (when a day is selected in month view) ────────────────────────
interface DayPanelProps {
  day: Date;
  agendamentos: Agendamento[];
  onClose: () => void;
  onSelect: (ag: Agendamento) => void;
}
function DayPanel({ day, agendamentos, onClose, onSelect }: DayPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="glass-card rounded-3xl p-5 w-80 flex-shrink-0 self-start sticky top-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-text-tertiary font-bold uppercase tracking-wider">
            {format(day, 'EEEE', { locale: ptBR })}
          </p>
          <p className="text-xl font-black text-text-primary">
            {format(day, "d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-border-card transition-colors text-text-tertiary">
          <X size={16} />
        </button>
      </div>

      {agendamentos.length === 0 ? (
        <div className="text-center py-8">
          <CalendarDays size={32} className="text-text-tertiary mx-auto mb-2 opacity-40" />
          <p className="text-sm text-text-tertiary font-medium">Nenhum agendamento neste dia</p>
        </div>
      ) : (
        <div className="space-y-2">
          {agendamentos
            .sort((a, b) => a.data_consulta.localeCompare(b.data_consulta))
            .map(ag => {
              const colors = getServiceColor(ag.servico);
              return (
                <motion.button
                  key={ag.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(ag)}
                  className={cn(
                    'w-full text-left p-3 rounded-2xl border transition-all',
                    colors.bg, colors.border,
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('w-2 h-2 rounded-full flex-shrink-0', colors.dot)} />
                    <span className="text-xs font-black text-text-tertiary">
                      {format(parseISO(ag.data_consulta), 'HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-text-primary">{ag.nome}</p>
                  {ag.servico && (
                    <p className={cn('text-xs font-semibold mt-0.5', colors.text)}>{ag.servico}</p>
                  )}
                </motion.button>
              );
            })}
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type ViewMode = 'month' | 'week';

export default function Agendamentos() {
  const { activeBusiness } = useBusiness();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedAg, setSelectedAg] = useState<Agendamento | null>(null);

  // Fetch agendamentos
  useEffect(() => {
    if (!activeBusiness?.id) return;
    const fetchData = async () => {
      setLoading(true);
      let start: Date, end: Date;
      if (viewMode === 'month') {
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
      } else {
        start = startOfWeek(currentDate, { locale: ptBR });
        end = endOfWeek(currentDate, { locale: ptBR });
      }

      try {
        const { data, error } = await supabase
          .from('leads')
          .select('id, nome, telefone, servico, etapa, data_consulta, anotacoes, temperatura, procedimento_interesse, valor_fechado')
          .eq('business_id', activeBusiness.id)
          .not('data_consulta', 'is', null)
          .gte('data_consulta', start.toISOString())
          .lte('data_consulta', end.toISOString())
          .order('data_consulta', { ascending: true });

        if (error) throw error;
        setAgendamentos((data || []) as Agendamento[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeBusiness?.id, currentDate, viewMode]);

  const navigatePrev = () => {
    if (viewMode === 'month') setCurrentDate(prev => subMonths(prev, 1));
    else setCurrentDate(prev => subWeeks(prev, 1));
    setSelectedDay(null);
  };
  const navigateNext = () => {
    if (viewMode === 'month') setCurrentDate(prev => addMonths(prev, 1));
    else setCurrentDate(prev => addWeeks(prev, 1));
    setSelectedDay(null);
  };

  const selectedDayAgendamentos = useMemo(() => {
    if (!selectedDay) return [];
    return agendamentos.filter(ag => isSameDay(parseISO(ag.data_consulta), selectedDay));
  }, [selectedDay, agendamentos]);

  // KPIs
  const totalConsultas = agendamentos.length;
  const realizadas = agendamentos.filter(a => a.etapa === 'consulta_realizada' || a.etapa === 'cliente_fechado').length;
  const topServico = useMemo(() => {
    const map: Record<string, number> = {};
    agendamentos.forEach(a => { if (a.servico) map[a.servico] = (map[a.servico] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0];
  }, [agendamentos]);

  const periodLabel = viewMode === 'month'
    ? format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })
    : `${format(startOfWeek(currentDate, { locale: ptBR }), "d MMM", { locale: ptBR })} – ${format(endOfWeek(currentDate, { locale: ptBR }), "d MMM", { locale: ptBR })}`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white shadow-lg shadow-accent-primary/30">
              <Calendar size={18} />
            </div>
            Agendamentos
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Gerencie consultas e acompanhe sua agenda
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2">
          <div className="flex bg-background-sidebar border border-border-card rounded-xl p-1">
            {([['month', 'Mês', LayoutGrid], ['week', 'Semana', CalendarDays]] as [ViewMode, string, React.ElementType][]).map(([mode, label, Icon]) => (
              <button
                key={mode}
                onClick={() => { setViewMode(mode); setSelectedDay(null); }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all',
                  viewMode === mode
                    ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-md'
                    : 'text-text-secondary hover:text-text-primary',
                )}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* KPI cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Calendar,
            label: 'Consultas no período',
            value: loading ? '—' : totalConsultas,
            color: 'text-accent-primary',
            bg: 'bg-accent-primary/10',
          },
          {
            icon: CheckCircle2,
            label: 'Realizadas / Fechadas',
            value: loading ? '—' : realizadas,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
          },
          {
            icon: TrendingUp,
            label: 'Procedimento top',
            value: loading || !topServico ? '—' : topServico[0],
            sub: topServico ? `${topServico[1]}× agendamentos` : '',
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
          },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className="glass-card rounded-2xl p-5 flex items-center gap-4"
          >
            <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', kpi.bg, kpi.color)}>
              <kpi.icon size={20} />
            </div>
            <div>
              <div className={cn('text-2xl font-black', kpi.color)}>{kpi.value}</div>
              {(kpi as any).sub && <div className="text-[10px] text-text-tertiary font-semibold">{(kpi as any).sub}</div>}
              <div className="text-xs font-bold text-text-tertiary uppercase tracking-wide">{kpi.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Calendar navigation bar */}
      <motion.div variants={itemVariants} className="glass-card rounded-2xl px-5 py-3.5 flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={navigatePrev}
          className="w-9 h-9 rounded-xl bg-background-app border border-border-card flex items-center justify-center text-text-secondary hover:text-accent-primary hover:border-accent-primary/30 transition-all"
        >
          <ChevronLeft size={18} />
        </motion.button>

        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={periodLabel}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="text-base font-black text-text-primary capitalize"
            >
              {periodLabel}
            </motion.p>
          </AnimatePresence>
          {!loading && (
            <p className="text-xs text-text-tertiary font-semibold">
              {totalConsultas} consulta{totalConsultas !== 1 ? 's' : ''} agendada{totalConsultas !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setCurrentDate(new Date()); setSelectedDay(null); }}
            className="px-3 py-1.5 rounded-lg bg-accent-primary/10 text-accent-primary text-xs font-bold hover:bg-accent-primary/20 transition-colors"
          >
            Hoje
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={navigateNext}
            className="w-9 h-9 rounded-xl bg-background-app border border-border-card flex items-center justify-center text-text-secondary hover:text-accent-primary hover:border-accent-primary/30 transition-all"
          >
            <ChevronRight size={18} />
          </motion.button>
        </div>
      </motion.div>

      {/* Loading state */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-16"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin" />
              <p className="text-sm text-text-tertiary font-medium">Carregando agendamentos...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar */}
      {!loading && (
        <motion.div variants={itemVariants} className="flex gap-5 items-start">
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${viewMode}-${format(currentDate, 'yyyy-MM')}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                {viewMode === 'month' ? (
                  <MonthView
                    currentDate={currentDate}
                    agendamentos={agendamentos}
                    onSelectDay={(d) => setSelectedDay(prev => prev && isSameDay(prev, d) ? null : d)}
                    selectedDay={selectedDay}
                    onSelectAgendamento={setSelectedAg}
                  />
                ) : (
                  <WeekView
                    currentDate={currentDate}
                    agendamentos={agendamentos}
                    onSelectAgendamento={setSelectedAg}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Day detail panel (month view only) */}
          <AnimatePresence>
            {viewMode === 'month' && selectedDay && (
              <DayPanel
                day={selectedDay}
                agendamentos={selectedDayAgendamentos}
                onClose={() => setSelectedDay(null)}
                onSelect={setSelectedAg}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Legend */}
      {!loading && (
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-4 flex flex-wrap gap-3 items-center">
          <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider mr-1">Legenda:</span>
          {Object.entries(SERVICO_COLORS).map(([name, c]) => (
            <div key={name} className="flex items-center gap-1.5">
              <span className={cn('w-2.5 h-2.5 rounded-full', c.dot)} />
              <span className="text-xs text-text-secondary font-medium">{name}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Appointment detail drawer */}
      <AnimatePresence>
        {selectedAg && (
          <AppointmentDrawer agendamento={selectedAg} onClose={() => setSelectedAg(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
