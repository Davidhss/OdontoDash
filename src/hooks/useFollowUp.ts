import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FollowUp } from '../types';
import { useBusiness } from './useBusiness';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export function useFollowUp() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeBusiness } = useBusiness();
  const { isDemo } = useAuth();

  const fetchFollowUps = async () => {
    if (!activeBusiness) {
      setFollowUps([]);
      setLoading(false);
      return;
    }

    if (isDemo) {
      const mockFollowUps: FollowUp[] = Array.from({ length: 10 }).map((_, i) => ({
        id: `demo-follow-${i}`,
        lead_id: `demo-lead-${i}`,
        business_id: activeBusiness.id,
        data_prevista: format(new Date(Date.now() + (i - 2) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        mensagem_template: 'Olá, tudo bem? Vimos que você se interessou por [Procedimento]. Vamos agendar sua avaliação?',
        realizado: i > 5,
        resultado: i > 5 ? 'Agendou' : null,
        created_at: new Date().toISOString()
      }));
      setFollowUps(mockFollowUps);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('follow_up')
        .select('*')
        .eq('business_id', activeBusiness.id)
        .order('data_prevista', { ascending: true });

      if (error) throw error;
      setFollowUps(data as FollowUp[]);
    } catch (err) {
      console.error('Erro ao buscar follow-ups:', err);
      toast.error('Erro ao carregar follow-ups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [activeBusiness?.id, isDemo]);

  const createFollowUp = async (data: Omit<FollowUp, 'id' | 'created_at' | 'realizado'>) => {
    if (isDemo) {
      const newFollow: FollowUp = {
        ...data,
        id: `demo-follow-${Date.now()}`,
        realizado: false,
        created_at: new Date().toISOString()
      };
      setFollowUps(prev => [...prev, newFollow]);
      return newFollow;
    }

    try {
      const { data: result, error } = await supabase
        .from('follow_up')
        .insert({ ...data, realizado: false })
        .select()
        .single();

      if (error) throw error;
      return result as FollowUp;
    } catch (err) {
      console.error('Erro ao criar follow-up:', err);
      toast.error('Erro ao agendar follow-up');
      return null;
    }
  };

  const markAsRealizado = async (id: string, resultado: string) => {
    if (isDemo) {
      setFollowUps(prev => prev.map(f => f.id === id ? { ...f, realizado: true, resultado } : f));
      return true;
    }

    try {
      const { error } = await supabase
        .from('follow_up')
        .update({ realizado: true, resultado })
        .eq('id', id);

      if (error) throw error;
      fetchFollowUps();
      return true;
    } catch (err) {
      console.error('Erro ao concluir follow-up:', err);
      toast.error('Erro ao concluir follow-up');
      return false;
    }
  };

  return { followUps, loading, fetchFollowUps, createFollowUp, markAsRealizado };
}
