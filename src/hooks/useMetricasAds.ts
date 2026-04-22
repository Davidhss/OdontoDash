import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MetricaAds } from '../types';
import { toast } from 'react-hot-toast';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { useBusiness } from './useBusiness';
import { useAuth } from './useAuth';

export function useMetricasAds(mesAno?: string) {
  const [metricas, setMetricas] = useState<MetricaAds[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeBusiness } = useBusiness();
  const { isDemo } = useAuth();

  const fetchMetricas = async (mes?: string) => {
    if (!activeBusiness) {
      setMetricas([]);
      setLoading(false);
      return;
    }

    if (isDemo) {
      setLoading(true);
      const angulos = ['Direto', 'Dor-Desejo', 'Autoridade', 'Indicação'];
      const procedimentos = ['Implante', 'Facetas', 'Clareamento', 'Avaliação', 'Ortodontia'];
      
      const mockMetrics = Array.from({ length: 10 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i * 3);
        const investimento = Math.floor(Math.random() * 200) + 50;
        const cliques = Math.floor(investimento * (Math.random() * 2 + 1));
        const leads = Math.floor(cliques * (Math.random() * 0.1 + 0.05));

        return {
          id: `demo-metric-${i}`,
          business_id: activeBusiness.id,
          campanha: i % 2 === 0 ? 'Implantes - Google Search' : 'Ortodontia - Meta Ads',
          investimento,
          cliques,
          impressoes: cliques * 10,
          leads_gerados: leads,
          consultas_geradas: Math.floor(leads * 0.3),
          data_lancamento: format(date, 'yyyy-MM-dd'),
          angulo_oferta: angulos[Math.floor(Math.random() * angulos.length)],
          procedimento_foco: procedimentos[Math.floor(Math.random() * procedimentos.length)],
          created_at: date.toISOString()
        };
      });
      setMetricas(mockMetrics as MetricaAds[]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let query = supabase
        .from('metricas_ads')
        .select('*')
        .eq('business_id', activeBusiness.id)
        .order('data_lancamento', { ascending: false });

      if (mes) {
        const start = format(startOfMonth(new Date(`${mes}-01`)), 'yyyy-MM-dd');
        const end = format(endOfMonth(new Date(`${mes}-01`)), 'yyyy-MM-dd');
        query = query.gte('data_lancamento', start).lte('data_lancamento', end);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMetricas(data as MetricaAds[]);
    } catch (err) {
      console.error('Erro ao buscar métricas:', err);
      toast.error('Erro ao carregar métricas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricas(mesAno);

    if (!activeBusiness || isDemo) return;

    const channel = supabase
      .channel(`metricas_changes_${activeBusiness.id}_${Math.random().toString(36).substring(7)}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'metricas_ads',
        filter: `business_id=eq.${activeBusiness.id}`
      }, () => {
        fetchMetricas(mesAno);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mesAno, activeBusiness?.id, isDemo]);

  const createMetrica = async (metricaData: Omit<MetricaAds, 'id' | 'created_at' | 'business_id'>) => {
    if (!activeBusiness) return null;

    if (isDemo) {
      const newMetrica: MetricaAds = {
        ...metricaData,
        id: `demo-metric-${Date.now()}`,
        business_id: activeBusiness.id,
        created_at: new Date().toISOString()
      };
      setMetricas(prev => [newMetrica, ...prev]);
      toast.success('Métricas salvas (Modo Demo)');
      return newMetrica;
    }

    try {
      const { data, error } = await supabase
        .from('metricas_ads')
        .insert({ ...metricaData, business_id: activeBusiness.id })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Métricas salvas! CPL de R$ ${(metricaData.investimento / (metricaData.leads_gerados || 1)).toFixed(2)} nesta campanha.`);
      return data as MetricaAds;
    } catch (err) {
      console.error('Erro ao criar métrica:', err);
      toast.error('Erro ao salvar métricas');
      return null;
    }
  };

  const updateMetrica = async (id: string, metricaData: Partial<MetricaAds>) => {
    try {
      const { data, error } = await supabase
        .from('metricas_ads')
        .update(metricaData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Métricas atualizadas com sucesso');
      return data as MetricaAds;
    } catch (err) {
      console.error('Erro ao atualizar métrica:', err);
      toast.error('Erro ao atualizar métricas');
      return null;
    }
  };

  const deleteMetrica = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('metricas_ads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Lançamento excluído com sucesso');
      return true;
    } catch (err) {
      console.error('Erro ao excluir métrica:', err);
      toast.error('Erro ao excluir métricas');
      return false;
    }
  };

  const getTotaisMes = (mes: string) => {
    const mesMetricas = metricas.filter(m => m.data_lancamento.startsWith(mes));
    return {
      investimento: mesMetricas.reduce((acc, m) => acc + (m.investimento || 0), 0),
      impressoes: mesMetricas.reduce((acc, m) => acc + (m.impressoes || 0), 0),
      cliques: mesMetricas.reduce((acc, m) => acc + (m.cliques || 0), 0),
      leads: mesMetricas.reduce((acc, m) => acc + (m.leads_gerados || 0), 0),
      consultas: mesMetricas.reduce((acc, m) => acc + (m.consultas_geradas || 0), 0),
    };
  };

  return { metricas, loading, fetchMetricas, createMetrica, updateMetrica, deleteMetrica, getTotaisMes };
}
