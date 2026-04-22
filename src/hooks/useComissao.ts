import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ComissaoMensal } from '../types';
import { useBusiness } from './useBusiness';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export function useComissao(mesAno: Date) {
  const [comissao, setComissao] = useState<ComissaoMensal | null>(null);
  const [loading, setLoading] = useState(true);
  const { activeBusiness } = useBusiness();
  const { isDemo } = useAuth();

  const fetchComissao = async () => {
    if (!activeBusiness) {
      setComissao(null);
      setLoading(false);
      return;
    }

    const mesAnoStr = format(mesAno, 'MM/yyyy');

    if (isDemo) {
      const mockComissao: ComissaoMensal = {
        id: `demo-comissao-${mesAnoStr}`,
        business_id: activeBusiness.id,
        mes_ano: mesAnoStr,
        total_novos_pacientes: 18,
        faturamento_incremental: 42000,
        comissao_calculada: 4200,
        fixo_mes: 1000,
        total_blent: 5200,
        status: 'Pendente',
        created_at: new Date().toISOString()
      };
      setComissao(mockComissao);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // First try to find existing record
      const { data, error } = await supabase
        .from('comissao_mensal')
        .select('*')
        .eq('business_id', activeBusiness.id)
        .eq('mes_ano', mesAnoStr)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setComissao(data as ComissaoMensal);
      } else {
        // Calculate on the fly if not exists
        const start = format(startOfMonth(mesAno), 'yyyy-MM-dd');
        const end = format(endOfMonth(mesAno), 'yyyy-MM-dd');

        const { data: leads, error: leadsErr } = await supabase
          .from('leads')
          .select('valor_fechado')
          .eq('business_id', activeBusiness.id)
          .eq('etapa', 'cliente_fechado')
          .gte('ultima_atualizacao', start)
          .lte('ultima_atualizacao', end);

        if (leadsErr) throw leadsErr;

        const totalNovosPacientes = leads?.length || 0;
        const faturamentoIncremental = leads?.reduce((acc, l) => acc + (Number(l.valor_fechado) || 0), 0) || 0;
        const comissaoCalculada = faturamentoIncremental * 0.10;
        const fixoMes = 1000; // Default as per project description
        const totalBlent = comissaoCalculada + fixoMes;

        const calculated: ComissaoMensal = {
          id: 'temp',
          business_id: activeBusiness.id,
          mes_ano: mesAnoStr,
          total_novos_pacientes: totalNovosPacientes,
          faturamento_incremental: faturamentoIncremental,
          comissao_calculada: comissaoCalculada,
          fixo_mes: fixoMes,
          total_blent: totalBlent,
          status: 'Rascunho',
          created_at: new Date().toISOString()
        };
        setComissao(calculated);
      }
    } catch (err) {
      console.error('Erro ao buscar comissão:', err);
      toast.error('Erro ao carregar dados de comissão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComissao();
  }, [activeBusiness?.id, mesAno, isDemo]);

  const salvarComissao = async () => {
    if (!comissao || !activeBusiness || isDemo) return;

    try {
      const { data, error } = await supabase
        .from('comissao_mensal')
        .upsert({
          ...comissao,
          id: comissao.id === 'temp' ? undefined : comissao.id,
          status: 'Fechado'
        })
        .select()
        .single();

      if (error) throw error;
      setComissao(data as ComissaoMensal);
      toast.success('Comissão fechada com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar comissão:', err);
      toast.error('Erro ao salvar comissão');
    }
  };

  return { comissao, loading, refresh: fetchComissao, salvarComissao };
}
