import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Atividade } from '../types';
import { useBusiness } from './useBusiness';
import { useAuth } from './useAuth';

export function useAtividades(limit = 20) {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeBusiness } = useBusiness();
  const { isDemo } = useAuth();

  const fetchAtividades = async () => {
    if (!activeBusiness) {
      setAtividades([]);
      setLoading(false);
      return;
    }

    if (isDemo) {
      setLoading(true);
      const mockActivities: Atividade[] = [
        { id: '1', tipo: 'cliente_fechado', descricao: 'Lead João Silva fechou tratamento de Facetas', created_at: new Date().toISOString(), business_id: activeBusiness.id, lead_nome: 'João Silva', lead_id: 'demo-lead-1' },
        { id: '2', tipo: 'consulta_agendada', descricao: 'Consulta agendada para Maria Oliveira (Implante)', created_at: new Date(Date.now() - 3600000).toISOString(), business_id: activeBusiness.id, lead_nome: 'Maria Oliveira', lead_id: 'demo-lead-2' },
        { id: '3', tipo: 'lead_criado', descricao: 'Novo lead captado via Meta Ads: Pedro Santos', created_at: new Date(Date.now() - 7200000).toISOString(), business_id: activeBusiness.id, lead_nome: 'Pedro Santos', lead_id: 'demo-lead-3' },
        { id: '4', tipo: 'etapa_mudada', descricao: 'Lead Ana Costa movido para Contato Feito', created_at: new Date(Date.now() - 14400000).toISOString(), business_id: activeBusiness.id, lead_nome: 'Ana Costa', lead_id: 'demo-lead-4' },
      ];
      setAtividades(mockActivities);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('atividades')
        .select('*')
        .eq('business_id', activeBusiness.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setAtividades(data as Atividade[]);
    } catch (err) {
      console.error('Erro ao buscar atividades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAtividades();

    if (!activeBusiness || isDemo) return;

    // Real-time subscription
    const channel = supabase
      .channel(`atividades_changes_${activeBusiness.id}_${Math.random().toString(36).substring(7)}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'atividades',
        filter: `business_id=eq.${activeBusiness.id}`
      }, () => {
        fetchAtividades();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit, activeBusiness?.id, isDemo]);

  return { atividades, loading, fetchAtividades };
}
