import React from 'react';
import { motion } from 'motion/react';
import { useCountUp } from '../../hooks/useCountUp';

interface CountUpProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

export const CountUp: React.FC<CountUpProps> = ({ value, prefix = '', suffix = '', duration = 1200 }) => {
  const count = useCountUp(value, duration);
  
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {prefix}{count.toLocaleString('pt-BR')}{suffix}
    </motion.span>
  );
};
