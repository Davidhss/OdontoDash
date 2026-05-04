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
          nome: 'Sorriso Perfeito [Imagem 1]',
          servico_foco: 'Implante',
          verba_diaria: 50,
          investimento_total: 150,
          leads_gerados: 10,
          mqls_gerados: 3,
          formato: 'Estático',
          status: 'Ativo',
          imagem_url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
          tags: ['Teste A', 'Público Quente'],
          created_at: new Date().toISOString()
        },
        {
          id: 'demo-2',
          business_id: activeBusiness.id,
          nome: 'Clareamento Promocional',
          servico_foco: 'Clareamento',
          verba_diaria: 30,
          investimento_total: 300,
          leads_gerados: 25,
          mqls_gerados: 12,
          formato: 'Vídeo',
          status: 'Ativo',
          imagem_url: '',
          tags: ['Oferta', 'Frio'],
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
