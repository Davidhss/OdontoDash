import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Apologia } from '../types';
import { useBusiness } from './useBusiness';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';

export function useApologia() {
  const [apologias, setApologias] = useState<Apologia[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeBusiness } = useBusiness();
  const { isDemo } = useAuth();

  const fetchApologias = async () => {
    if (!activeBusiness) {
      setApologias([]);
      setLoading(false);
      return;
    }

    if (isDemo) {
      const mockApologias: Apologia[] = Array.from({ length: 5 }).map((_, i) => ({
        id: `demo-apologia-${i}`,
        lead_id: `demo-lead-${i}`,
        business_id: activeBusiness.id,
        tipo: i % 2 === 0 ? 'Vídeo' : 'Google Review',
        data: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        coletado: i < 3,
        texto_depoimento: i < 3 ? 'Excelente atendimento, Dr. Tarik é muito atencioso!' : null,
        created_at: new Date().toISOString()
      }));
      setApologias(mockApologias);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('apologia')
        .select('*')
        .eq('business_id', activeBusiness.id)
        .order('data', { ascending: false });

      if (error) throw error;
      setApologias(data as Apologia[]);
    } catch (err) {
      console.error('Erro ao buscar apologias:', err);
      toast.error('Erro ao carregar depoimentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApologias();
  }, [activeBusiness?.id, isDemo]);

  const createApologia = async (data: Omit<Apologia, 'id' | 'created_at'>) => {
    if (isDemo) {
      const newApologia: Apologia = {
        ...data,
        id: `demo-apologia-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      setApologias(prev => [newApologia, ...prev]);
      return newApologia;
    }

    try {
      const { data: result, error } = await supabase
        .from('apologia')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      fetchApologias();
      return result as Apologia;
    } catch (err) {
      console.error('Erro ao registrar apologia:', err);
      toast.error('Erro ao registrar depoimento');
      return null;
    }
  };

  return { apologias, loading, fetchApologias, createApologia };
}
