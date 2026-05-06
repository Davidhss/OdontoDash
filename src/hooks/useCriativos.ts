import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TesteCriativo } from '../types';
import { useAuth } from './useAuth';
import { useBusiness } from './useBusiness';
import { toast } from 'react-hot-toast';

export function useCriativos() {
  const [criativos, setCriativos] = useState<TesteCriativo[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDemo } = useAuth();
  const { activeBusiness } = useBusiness();

  const fetchCriativos = async () => {
    if (!activeBusiness) return;

    if (isDemo) {
      // Mock data for demo
      setCriativos([
        {
          id: 'demo-1',
          business_id: activeBusiness.id,
          nome: 'Campanha Implante - Captação',
          servico_foco: 'Implante',
          verba_diaria: 50,
          investimento_total: 750,
          leads_gerados: 32,
          mqls_gerados: 12,
          formato: 'Estático',
          status: 'Ativo',
          objetivo: 'Captação de Leads',
          imagem_url: '',
          tags: ['Público Quente', 'Mulheres 35+'],
          impressoes: 18500,
          alcance: 12000,
          engajamentos: 0,
          cliques: 420,
          resultados_dia: 4,
          gasto_hoje: 48.50,
          conversoes: 0,
          faturamento_gerado: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'demo-2',
          business_id: activeBusiness.id,
          nome: 'Autoridade Clínica - Depoimentos',
          servico_foco: 'Geral',
          verba_diaria: 30,
          investimento_total: 450,
          leads_gerados: 0,
          mqls_gerados: 0,
          formato: 'Vídeo',
          status: 'Ativo',
          objetivo: 'Branding / Posicionamento',
          imagem_url: '',
          tags: ['Branding', 'Depoimento'],
          impressoes: 42000,
          alcance: 28000,
          engajamentos: 1850,
          cliques: 680,
          resultados_dia: 12,
          gasto_hoje: 29.00,
          conversoes: 0,
          faturamento_gerado: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'demo-3',
          business_id: activeBusiness.id,
          nome: 'Promoção Clareamento -30%',
          servico_foco: 'Clareamento',
          verba_diaria: 40,
          investimento_total: 520,
          leads_gerados: 45,
          mqls_gerados: 18,
          formato: 'Carrossel',
          status: 'Ativo',
          objetivo: 'Oferta / Desconto',
          imagem_url: '',
          tags: ['Oferta', 'Maio'],
          impressoes: 25000,
          alcance: 15000,
          engajamentos: 890,
          cliques: 520,
          resultados_dia: 6,
          gasto_hoje: 38.00,
          conversoes: 8,
          faturamento_gerado: 4800,
          created_at: new Date().toISOString()
        },
        {
          id: 'demo-4',
          business_id: activeBusiness.id,
          nome: 'Engajamento Instagram - Reels',
          servico_foco: 'Geral',
          verba_diaria: 20,
          investimento_total: 180,
          leads_gerados: 0,
          mqls_gerados: 0,
          formato: 'Vídeo',
          status: 'Pausado',
          objetivo: 'Engajamento / Seguidores',
          imagem_url: '',
          tags: ['Instagram', 'Reels'],
          impressoes: 35000,
          alcance: 22000,
          engajamentos: 3200,
          cliques: 450,
          resultados_dia: 0,
          gasto_hoje: 0,
          conversoes: 0,
          faturamento_gerado: 0,
          created_at: new Date().toISOString()
        }
      ]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('testes_criativos')
        .select('*')
        .eq('business_id', activeBusiness.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCriativos(data as TesteCriativo[]);
    } catch (err) {
      console.error('Erro ao buscar criativos:', err);
      toast.error('Erro ao carregar testes de criativos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCriativos();

    if (!isDemo && activeBusiness) {
      const channel = supabase
        .channel('testes_criativos_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'testes_criativos',
            filter: `business_id=eq.${activeBusiness.id}`
          }, 
          () => fetchCriativos()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeBusiness?.id, isDemo]);

  const createCriativo = async (criativoData: Omit<TesteCriativo, 'id' | 'business_id' | 'created_at'>) => {
    if (!activeBusiness) return null;

    if (isDemo) {
      const novo: TesteCriativo = {
        ...criativoData,
        id: `demo-${Date.now()}`,
        business_id: activeBusiness.id,
        created_at: new Date().toISOString()
      };
      setCriativos(prev => [novo, ...prev]);
      toast.success('Criativo adicionado com sucesso!');
      return novo;
    }

    try {
      const { data, error } = await supabase
        .from('testes_criativos')
        .insert({ ...criativoData, business_id: activeBusiness.id })
        .select()
        .single();

      if (error) throw error;
      toast.success('Criativo adicionado com sucesso!');
      return data as TesteCriativo;
    } catch (err) {
      console.error('Erro ao adicionar criativo:', err);
      toast.error('Erro ao adicionar teste de criativo');
      return null;
    }
  };

  const updateCriativo = async (id: string, updates: Partial<TesteCriativo>) => {
    if (isDemo) {
      setCriativos(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      toast.success('Criativo atualizado!');
      return true;
    }

    try {
      const { error } = await supabase
        .from('testes_criativos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Criativo atualizado!');
      return true;
    } catch (err) {
      console.error('Erro ao atualizar criativo:', err);
      toast.error('Erro ao atualizar criativo');
      return false;
    }
  };

  const deleteCriativo = async (id: string) => {
    if (isDemo) {
      setCriativos(prev => prev.filter(c => c.id !== id));
      toast.success('Criativo excluído!');
      return true;
    }

    try {
      const { error } = await supabase
        .from('testes_criativos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Criativo excluído!');
      return true;
    } catch (err) {
      console.error('Erro ao excluir criativo:', err);
      toast.error('Erro ao excluir criativo');
      return false;
    }
  };

  return {
    criativos,
    loading,
    createCriativo,
    updateCriativo,
    deleteCriativo,
    refresh: fetchCriativos
  };
}
