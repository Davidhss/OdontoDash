import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Lead, LeadEtapa, LeadFonte, LeadServico, LeadTemperature, ProcedimentoInteresse, AnguloOferta, EtapaJornada } from '../types';
import { logAtividade } from '../lib/activities';
import { toast } from 'react-hot-toast';
import { useBusiness } from './useBusiness';
import { useAuth } from './useAuth';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeBusiness } = useBusiness();
  const { isDemo } = useAuth();

  const fetchLeads = async () => {
    if (!activeBusiness) {
      setLeads([]);
      setLoading(false);
      return;
    }

    if (isDemo) {
      const stages: LeadEtapa[] = ['novo_lead', 'contato_feito', 'consulta_agendada', 'consulta_realizada', 'cliente_fechado', 'perdido'];
      const sources: LeadFonte[] = ['Meta Ads', 'Google', 'Indicação', 'Instagram Orgânico'];
      const services: LeadServico[] = ['Implante', 'Ortodontia', 'Clareamento', 'Facetas', 'Avaliação'];
      const temperatures: LeadTemperature[] = ['quente', 'morno', 'frio'];
      const procedimentos: ProcedimentoInteresse[] = ['Implante', 'Facetas', 'Clareamento', 'Avaliação', 'Ortodontia', 'Outro'];
      const angulos: AnguloOferta[] = ['Direto', 'Dor-Desejo', 'Autoridade', 'Indicação'];
      const jornadas: EtapaJornada[] = ['Descoberta', 'Atração', 'Curiosidade', 'Ação', 'Apologia'];

      const mockLeads = Array.from({ length: 45 }).map((_, i) => ({
        id: `demo-lead-${i}`,
        business_id: activeBusiness.id,
        nome: `Paciente Exemplo ${i + 1}`,
        telefone: `(11) 9${Math.floor(Math.random() * 90000000 + 10000000)}`,
        etapa: stages[Math.floor(Math.random() * stages.length)],
        fonte: sources[Math.floor(Math.random() * sources.length)],
        servico: services[Math.floor(Math.random() * services.length)],
        temperatura: temperatures[Math.floor(Math.random() * temperatures.length)],
        procedimento_interesse: procedimentos[Math.floor(Math.random() * procedimentos.length)],
        angulo_oferta: angulos[Math.floor(Math.random() * angulos.length)],
        etapa_jornada: jornadas[Math.floor(Math.random() * jornadas.length)],
        valor_fechado: Math.random() > 0.8 ? Math.floor(Math.random() * 5000) + 1500 : 0,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        ultima_atualizacao: new Date().toISOString(),
        anotacoes: 'Paciente interessado em tratamento estético.',
        data_consulta: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
        data_retorno_previsto: null,
        reativacao: Math.random() > 0.9
      }));

      setLeads(mockLeads as Lead[]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('business_id', activeBusiness.id)
        .order('ultima_atualizacao', { ascending: false });

      if (error) throw error;
      setLeads(data as Lead[]);
    } catch (err) {
      console.error('Erro ao buscar leads:', err);
      toast.error('Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();

    if (!activeBusiness || isDemo) return;

    const channel = supabase
      .channel(`leads_changes_${activeBusiness.id}_${Math.random().toString(36).substring(7)}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'leads',
        filter: `business_id=eq.${activeBusiness.id}`
      }, () => {
        fetchLeads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeBusiness?.id, isDemo]);

  const createLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'ultima_atualizacao' | 'business_id'>) => {
    if (!activeBusiness) return null;

    if (isDemo) {
      const newLead: Lead = {
        ...leadData,
        id: `demo-lead-${Date.now()}`,
        business_id: activeBusiness.id,
        created_at: new Date().toISOString(),
        ultima_atualizacao: new Date().toISOString()
      };
      setLeads(prev => [newLead, ...prev]);
      toast.success(`Lead ${leadData.nome} criado (Modo Demo)!`);
      return newLead;
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({ ...leadData, business_id: activeBusiness.id })
        .select()
        .single();

      if (error) throw error;

      await logAtividade(
        'lead_criado',
        `Lead ${leadData.nome} adicionado via ${leadData.fonte}`,
        data.id,
        data.nome,
        activeBusiness.id
      );

      toast.success(`Lead ${leadData.nome} criado! Registre o primeiro contato.`);
      return data as Lead;
    } catch (err) {
      console.error('Erro ao criar lead:', err);
      toast.error('Erro ao criar lead');
      return null;
    }
  };

  const updateLead = async (id: string, leadData: Partial<Lead>) => {
    if (isDemo) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...leadData, ultima_atualizacao: new Date().toISOString() } : l));
      return { id, ...leadData } as Lead;
    }

    try {
      const { data: oldLead } = await supabase
        .from('leads')
        .select('etapa, nome, etapa_jornada')
        .eq('id', id)
        .single();

      // Mapping pipeline stage to journey stage
      let novaEtapaJornada = leadData.etapa_jornada;
      if (leadData.etapa && !novaEtapaJornada) {
        if (leadData.etapa === 'novo_lead') novaEtapaJornada = 'Descoberta';
        else if (leadData.etapa === 'contato_feito') novaEtapaJornada = 'Atração';
        else if (leadData.etapa === 'consulta_agendada') novaEtapaJornada = 'Curiosidade';
        else if (leadData.etapa === 'consulta_realizada') novaEtapaJornada = 'Ação';
        else if (leadData.etapa === 'cliente_fechado') novaEtapaJornada = 'Apologia';
      }

      const { data, error } = await supabase
        .from('leads')
        .update({ 
          ...leadData, 
          etapa_jornada: novaEtapaJornada,
          ultima_atualizacao: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (leadData.etapa && oldLead && leadData.etapa !== oldLead.etapa) {
        let tipo: any = 'etapa_mudada';
        let desc = `Lead ${oldLead.nome} movido para ${leadData.etapa.replace('_', ' ')}`;

        if (leadData.etapa === 'consulta_agendada') tipo = 'consulta_agendada';
        if (leadData.etapa === 'cliente_fechado') tipo = 'cliente_fechado';

        await logAtividade(tipo, desc, id, oldLead.nome, activeBusiness?.id);
      }

      toast.success('Lead atualizado com sucesso');
      return data as Lead;
    } catch (err) {
      console.error('Erro ao atualizar lead:', err);
      toast.error('Erro ao atualizar lead');
      return null;
    }
  };

  const moveLeadEtapa = async (id: string, novaEtapa: LeadEtapa) => {
    // Optimistic update
    const oldLeads = [...leads];
    setLeads(prev => prev.map(l => l.id === id ? { ...l, etapa: novaEtapa, ultima_atualizacao: new Date().toISOString() } : l));

    const result = await updateLead(id, { etapa: novaEtapa });
    
    if (!result) {
      // Rollback if failed
      setLeads(oldLeads);
      return null;
    }
    return result;
  };

  const deleteLead = async (id: string, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o lead "${nome}"? Esta ação não pode ser desfeita.`)) {
      return false;
    }

    const confirmText = window.prompt(`Para confirmar, digite "EXCLUIR" para o lead ${nome}:`);
    if (confirmText !== 'EXCLUIR') {
      toast.error('Confirmação inválida');
      return false;
    }

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Lead excluído com sucesso');
      return true;
    } catch (err) {
      console.error('Erro ao excluir lead:', err);
      toast.error('Erro ao excluir lead');
      return false;
    }
  };

  return { leads, loading, fetchLeads, createLead, updateLead, moveLeadEtapa, deleteLead };
}
