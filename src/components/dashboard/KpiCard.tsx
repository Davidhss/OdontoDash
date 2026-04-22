import React from 'react';
import { motion, useAnimation } from 'motion/react';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { CountUp } from '../ui/CountUp';
import { ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { cn } from '../../lib/utils';

interface KpiCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  delta: string;
  isPositive: boolean;
  sparklineData: any[];
  subValue?: string;
  badge?: string;
  icon?: React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title, value, prefix, suffix, delta, isPositive, sparklineData, subValue, badge, icon
}) => {
  const controls = useAnimation();

  React.useEffect(() => {
    controls.start({
      scale: [1, 1.02, 1],
      opacity: [0.5, 1],
      transition: {
        duration: 0.6,
        times: [0, 0.5, 1],
      }
    });
  }, [value, controls]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={controls}
      whileHover={{
        scale: 1.03,
        y: -8,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "glass-card rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden group",
        isPositive ? "hover:border-accent-primary/30" : "hover:border-danger/30"
      )}
    >
      {/* Animated background glow */}
      <motion.div
        className={cn(
          "absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
          isPositive ? "bg-accent-primary" : "bg-danger"
        )}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  isPositive ? "bg-accent-primary/10 text-accent-primary" : "bg-danger/10 text-danger"
                )}
              >
                {icon}
              </motion.div>
            )}
            <span className="text-sm font-bold text-text-secondary uppercase tracking-wider">{title}</span>
          </div>
          {badge && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "bg-gradient-to-r text-white text-[10px] px-2.5 py-1 rounded-full font-bold border border-white/20 shadow-lg flex items-center gap-1",
                isPositive ? "from-accent-primary to-accent-secondary" : "from-danger-500 to-red-600"
              )}
            >
              <Sparkles size={10} />
              {badge}
            </motion.span>
          )}
        </div>

        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <motion.div
              key={value}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-3xl font-bold text-text-primary tracking-tight"
            >
              <CountUp value={value} prefix={prefix} suffix={suffix} />
            </motion.div>
            {subValue && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-text-tertiary font-medium"
              >
                {subValue}
              </motion.div>
            )}
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={cn(
                "flex items-center gap-1 text-xs font-bold mt-3 px-2.5 py-1 rounded-lg w-fit",
                isPositive
                  ? "bg-accent-primary/10 text-accent-primary"
                  : "bg-danger/10 text-danger"
              )}
            >
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {delta}
            </motion.div>
          </div>

          <div className="w-28 h-14 relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id={`gradient-${isPositive ? 'positive' : 'negative'}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? "#3B82F6" : "#EF4444"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={isPositive ? "#3B82F6" : "#EF4444"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="val"
                  stroke={isPositive ? "#3B82F6" : "#EF4444"}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#gradient-${isPositive ? 'positive' : 'negative'})`}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hover effect border */}
      <motion.div
        className={cn(
          "absolute bottom-0 left-0 h-1 bg-gradient-to-r transition-all duration-300",
          isPositive ? "from-accent-primary to-accent-secondary" : "from-danger-500 to-red-600"
        )}
        initial={{ width: 0 }}
        whileHover={{ width: '100%' }}
      />
    </motion.div>
  );
};
