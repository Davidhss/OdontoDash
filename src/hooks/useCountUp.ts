import { useState, useEffect } from 'react';

export function useCountUp(end: number, duration: number = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Se for um número inteiro, usa Math.floor, senão mantém decimais para formatação
      const currentCount = Number.isInteger(end) 
        ? Math.floor(progress * end) 
        : Number((progress * end).toFixed(2));
        
      setCount(currentCount);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
}
