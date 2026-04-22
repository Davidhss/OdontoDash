import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MetaMes } from '../types';
import { logAtividade } from '../lib/activities';
import { toast } from 'react-hot-toast';
import { useBusiness } from './useBusiness';
import { useAuth } from './useAuth';

export function useMetas(mesAno?: string) {
  const [meta, setMeta] = useState<MetaMes | null>(null);
  const [loading, setLoading] = useState(true);
  const { activeBusiness } = useBusiness();
  const { isDemo } = useAuth();

  const fetchMetaMes = async (mes: string) => {
    if (!activeBusiness) {
      setMeta(null);
      setLoading(false);
      return;
    }

    if (isDemo) {
      setLoading(true);
      setMeta({
        id: 'demo-meta-1',
        mes_ano: mes,
        business_id: activeBusiness.id,
        meta_leads: 100,
        meta_consultas: 40,
        meta_clientes: 15,
        meta_faturamento: 50000,
        meta_investimento: 5000,
        criado_em: new Date().toISOString()
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('metas')
        .select('*')
        .eq('mes_ano', mes)
        .eq('business_id', activeBusiness.id)
        .maybeSingle();

      if (error) throw error;
      setMeta(data as MetaMes | null);
    } catch (err) {
      console.error('Erro ao buscar metas:', err);
      toast.error('Erro ao carregar metas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mesAno && activeBusiness) {
      fetchMetaMes(mesAno);

      if (isDemo) return;

      const channel = supabase
        .channel(`metas_changes_${mesAno}_${activeBusiness.id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'metas', 
          filter: `business_id=eq.${activeBusiness.id}` 
        }, () => {
          fetchMetaMes(mesAno);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [mesAno, activeBusiness?.id, isDemo]);

  const upsertMeta = async (mes: string, metaData: Omit<MetaMes, 'id' | 'criado_em' | 'mes_ano' | 'business_id'>) => {
    if (!activeBusiness) return null;

    if (isDemo) {
      const newMeta: MetaMes = {
        ...metaData,
        id: 'demo-meta-1',
        mes_ano: mes,
        business_id: activeBusiness.id,
        criado_em: new Date().toISOString()
      };
      setMeta(newMeta);
      toast.success('Metas salvas (Modo Demo)');
      return newMeta;
    }

    try {
      const { data, error } = await supabase
        .from('metas')
        .upsert(
          { ...metaData, mes_ano: mes, business_id: activeBusiness.id }, 
          { onConflict: 'mes_ano,business_id' }
        )
        .select()
        .single();

      if (error) throw error;

      await logAtividade(
        'meta_atualizada',
        `Metas de ${mes} atualizadas`,
        undefined,
        undefined,
        activeBusiness.id
      );

      toast.success('Metas salvas com sucesso');
      setMeta(data as MetaMes);
      return data as MetaMes;
    } catch (err) {
      console.error('Erro ao salvar metas:', err);
      toast.error('Erro ao salvar metas');
      return null;
    }
  };

  return { meta, loading, fetchMetaMes, upsertMeta };
}
