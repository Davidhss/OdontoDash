import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Contato } from '../types';
import { logAtividade } from '../lib/activities';
import { toast } from 'react-hot-toast';
import { useBusiness } from './useBusiness';
import { useAuth } from './useAuth';

export function useContatos(leadId?: string) {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeBusiness } = useBusiness();
  const { isDemo } = useAuth();

  const fetchContatosByLead = async (id: string) => {
    if (isDemo) {
      setLoading(true);
      const mockContatos: Contato[] = [
        { id: '1', lead_id: id, business_id: activeBusiness?.id || 'demo', tipo: 'WhatsApp', direcao: 'Saída', resumo: 'Enviado orçamento de implantes', resultado: 'Aguardando resposta', autor: 'Admin', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '2', lead_id: id, business_id: activeBusiness?.id || 'demo', tipo: 'Ligação', direcao: 'Entrada', resumo: 'Tirou dúvidas sobre prazos', resultado: 'Interessado', autor: 'Admin', created_at: new Date(Date.now() - 172800000).toISOString() },
      ];
      setContatos(mockContatos);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contatos')
        .select('*')
        .eq('lead_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContatos(data as Contato[]);
    } catch (err) {
      console.error('Erro ao buscar contatos:', err);
      toast.error('Erro ao carregar contatos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadId) {
      fetchContatosByLead(leadId);

      if (isDemo) return;

      const channelId = Math.random().toString(36).substring(7);
      const channel = supabase
        .channel(`contatos_changes_${leadId}_${channelId}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'contatos', 
          filter: `lead_id=eq.${leadId}` 
        }, () => {
          fetchContatosByLead(leadId);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [leadId, isDemo]);

  const createContato = async (contatoData: Omit<Contato, 'id' | 'created_at' | 'business_id'>, leadNome?: string) => {
    if (!activeBusiness) return null;

    if (isDemo) {
      const newContato: Contato = {
        ...contatoData,
        id: `demo-contato-${Date.now()}`,
        business_id: activeBusiness.id,
        created_at: new Date().toISOString()
      };
      setContatos(prev => [newContato, ...prev]);
      toast.success('Contato registrado (Modo Demo)');
      return newContato;
    }

    const oldContatos = [...contatos];

    try {
      const { data, error } = await supabase
        .from('contatos')
        .insert({ ...contatoData, business_id: activeBusiness.id })
        .select()
        .single();

      if (error) throw error;

      await logAtividade(
        'contato_registrado',
        `Contato via ${contatoData.tipo} registrado para ${leadNome || 'Lead'}`,
        contatoData.lead_id || undefined,
        leadNome,
        activeBusiness.id
      );

      // Update lead's last contact timestamp
      if (contatoData.lead_id) {
        await supabase
          .from('leads')
          .update({ ultima_atualizacao: new Date().toISOString() })
          .eq('id', contatoData.lead_id);
      }

      toast.success('Contato registrado com sucesso');
      return data as Contato;
    } catch (err) {
      console.error('Erro ao criar contato:', err);
      toast.error('Erro ao registrar contato');
      // Rollback
      setContatos(oldContatos);
      return null;
    }
  };

  const deleteContato = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este contato?')) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('contatos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Contato excluído com sucesso');
      return true;
    } catch (err) {
      console.error('Erro ao excluir contato:', err);
      toast.error('Erro ao excluir contato');
      return false;
    }
  };

  return { contatos, loading, fetchContatosByLead, createContato, deleteContato };
}
