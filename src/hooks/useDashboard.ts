import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Lead, MetricaAds, MetaMes, Atividade } from '../types';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';
import { useBusiness } from './useBusiness';
import { useAuth } from './useAuth';

export function useDashboard(mesAno?: Date) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { activeBusiness } = useBusiness();
  const { isDemo } = useAuth();
  const channelsRef = useRef<any[]>([]);

  const [kpis, setKpis] = useState({
    totalLeads: 0,
    totalConsultas: 0,
    totalConsultasRealizadas: 0,
    totalClientes: 0,
    investimentoTotal: 0,
    totalFaturamento: 0,
    cplMedio: 0,
    roasEstimado: 0,
    comissaoBlent: 0,
    taxaConversao: 0,
    leadsPerdidos: 0,
    leadsPorDia: [] as { date: string; leads: number }[],
    funnelData: [] as { stage: string; count: number }[],
    jornadaData: [] as { stage: string; count: number }[],
    angulacaoData: [] as { label: string; value: number }[],
    fonteData: [] as { label: string; value: number; conversao: number }[],
    procedimentoData: [] as { label: string; value: number }[],
    monthlyComparison: [] as { month: string; leads: number; clientes: number; faturamento: number }[],
    followUpAtrasado: false,
    atividadesRecentes: [] as Atividade[],
    metaAtual: null as MetaMes | null,
    hasData: false,
  });

  const fetchDashboardData = async () => {
    // Guard: wait for activeBusiness
    if (!activeBusiness?.id) {
      setLoading(false);
      return;
    }

    if (isDemo) {
      setLoading(true);
      const totalLeads = 124;
      const totalConsultas = 48;
      const totalConsultasRealizadas = 32;
      const totalClientes = 18;
      const investimentoTotal = 3500;
      const totalFaturamento = 42000;
      const cplMedio = investimentoTotal / totalLeads;
      const roasEstimado = totalFaturamento / investimentoTotal;
      const comissaoBlent = totalFaturamento * 0.10;
      const taxaConversao = Math.round((totalClientes / totalLeads) * 100);

      const funnelData = [
        { stage: 'Novos Leads', count: 124 },
        { stage: 'Contatos', count: 86 },
        { stage: 'Agendados', count: 48 },
        { stage: 'Consultas', count: 32 },
        { stage: 'Fechados', count: 18 }
      ];

      const jornadaData = [
        { stage: 'Descoberta', count: 45 },
        { stage: 'Atração', count: 32 },
        { stage: 'Curiosidade', count: 24 },
        { stage: 'Ação', count: 15 },
        { stage: 'Apologia', count: 8 }
      ];

      const angulacaoData = [
        { label: 'Direto', value: 40 },
        { label: 'Dor-Desejo', value: 35 },
        { label: 'Autoridade', value: 25 },
        { label: 'Indicação', value: 24 }
      ];

      const fonteData = [
        { label: 'Meta Ads', value: 56, conversao: 18 },
        { label: 'Google', value: 32, conversao: 22 },
        { label: 'Indicação', value: 24, conversao: 35 },
        { label: 'Orgânico', value: 12, conversao: 12 }
      ];

      const procedimentoData = [
        { label: 'Implante', value: 38 },
        { label: 'Facetas', value: 28 },
        { label: 'Ortodontia', value: 22 },
        { label: 'Clareamento', value: 18 },
        { label: 'Avaliação', value: 18 }
      ];

      const monthlyComparison = Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(new Date(), 5 - i);
        return {
          month: format(d, 'MMM/yy'),
          leads: Math.floor(Math.random() * 80) + 60,
          clientes: Math.floor(Math.random() * 20) + 10,
          faturamento: Math.floor(Math.random() * 30000) + 20000
        };
      });

      const leadsPorDia = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return {
          date: format(d, 'dd/MM'),
          leads: Math.floor(Math.random() * 10) + 2
        };
      });

      const atividadesRecentes: Atividade[] = [
        { id: '1', tipo: 'cliente_fechado', descricao: 'Lead João Silva fechou tratamento de Facetas', created_at: new Date().toISOString(), business_id: activeBusiness.id, lead_nome: 'João Silva', lead_id: 'demo-lead-1' },
        { id: '2', tipo: 'consulta_agendada', descricao: 'Consulta agendada para Maria Oliveira (Implante)', created_at: new Date(Date.now() - 3600000).toISOString(), business_id: activeBusiness.id, lead_nome: 'Maria Oliveira', lead_id: 'demo-lead-2' },
        { id: '3', tipo: 'lead_criado', descricao: 'Novo lead captado via Meta Ads: Pedro Santos', created_at: new Date(Date.now() - 7200000).toISOString(), business_id: activeBusiness.id, lead_nome: 'Pedro Santos', lead_id: 'demo-lead-3' },
      ];

      setKpis({
        totalLeads, totalConsultas, totalConsultasRealizadas, totalClientes, investimentoTotal,
        totalFaturamento, cplMedio, roasEstimado, comissaoBlent,
        taxaConversao, leadsPerdidos: 8,
        leadsPorDia, funnelData, jornadaData, angulacaoData,
        fonteData, procedimentoData, monthlyComparison,
        followUpAtrasado: true, atividadesRecentes,
        metaAtual: null, hasData: true
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const baseDate = mesAno || new Date();
      const start = format(startOfMonth(baseDate), 'yyyy-MM-dd');
      const end = format(endOfMonth(baseDate), 'yyyy-MM-dd');

      // Parallel fetching for performance
      const [leadsRes, metricsRes, activitiesRes, followUpsRes, metaRes, allLeadsRes] = await Promise.all([
        supabase.from('leads').select('*').eq('business_id', activeBusiness.id)
          .gte('created_at', start + 'T00:00:00').lte('created_at', end + 'T23:59:59'),
        supabase.from('metricas_ads').select('*').eq('business_id', activeBusiness.id)
          .gte('data_lancamento', start).lte('data_lancamento', end),
        supabase.from('atividades').select('*').eq('business_id', activeBusiness.id)
          .order('created_at', { ascending: false }).limit(15),
        supabase.from('follow_up').select('id').eq('business_id', activeBusiness.id)
          .eq('realizado', false).lt('data_prevista', new Date().toISOString()),
        supabase.from('metas').select('*').eq('business_id', activeBusiness.id)
          .eq('mes_ano', format(baseDate, 'yyyy-MM')).single(),
        // Fetch last 6 months for comparison chart
        supabase.from('leads').select('etapa, valor_fechado, created_at')
          .eq('business_id', activeBusiness.id)
          .gte('created_at', format(subMonths(startOfMonth(baseDate), 5), 'yyyy-MM-dd') + 'T00:00:00')
      ]);

      const leads = leadsRes.data || [];
      const metrics = metricsRes.data || [];
      const activities = activitiesRes.data || [];
      const followUps = followUpsRes.data || [];
      const meta = metaRes.data;
      const allLeads = allLeadsRes.data || [];

      // KPI calculations
      const totalLeads = leads.length;
      const totalConsultas = leads.filter(l => ['consulta_agendada', 'consulta_realizada', 'cliente_fechado'].includes(l.etapa)).length;
      const totalConsultasRealizadas = leads.filter(l => ['consulta_realizada', 'cliente_fechado'].includes(l.etapa)).length;
      const totalClientes = leads.filter(l => l.etapa === 'cliente_fechado').length;
      const leadsPerdidos = leads.filter(l => l.etapa === 'perdido').length;
      const investimentoTotal = metrics.reduce((acc, m) => acc + (Number(m.investimento) || 0), 0);
      const totalFaturamento = leads.filter(l => l.etapa === 'cliente_fechado').reduce((acc, l) => acc + (Number(l.valor_fechado) || 0), 0);

      const cplMedio = totalLeads > 0 ? investimentoTotal / totalLeads : 0;
      const roasEstimado = investimentoTotal > 0 ? totalFaturamento / investimentoTotal : 0;
      const comissaoBlent = totalFaturamento * 0.10;
      const taxaConversao = totalLeads > 0 ? Math.round((totalClientes / totalLeads) * 100) : 0;

      // Funnel data
      const stages = [
        { key: 'novo_lead', label: 'Novos Leads' },
        { key: 'contato_feito', label: 'Contatos' },
        { key: 'consulta_agendada', label: 'Agendados' },
        { key: 'consulta_realizada', label: 'Consultas' },
        { key: 'cliente_fechado', label: 'Fechados' }
      ];
      const funnelData = stages.map(s => ({
        stage: s.label,
        count: leads.filter(l => l.etapa === s.key).length
      }));

      // Journey data
      const journeyStages = ['Descoberta', 'Atração', 'Curiosidade', 'Ação', 'Apologia'];
      const jornadaData = journeyStages.map(s => ({
        stage: s,
        count: leads.filter(l => l.etapa_jornada === s).length
      }));

      // Angulation data
      const angulos = ['Direto', 'Dor-Desejo', 'Autoridade', 'Indicação'];
      const angulacaoData = angulos.map(a => ({
        label: a,
        value: leads.filter(l => l.angulo_oferta === a).length
      }));

      // Source conversion data
      const fontes = ['Meta Ads', 'Google', 'Indicação', 'Instagram Orgânico', 'Caminhada', 'Outro'];
      const fonteData = fontes.map(f => {
        const fonteLeads = leads.filter(l => l.fonte === f);
        const fonteClientes = fonteLeads.filter(l => l.etapa === 'cliente_fechado').length;
        return {
          label: f,
          value: fonteLeads.length,
          conversao: fonteLeads.length > 0 ? Math.round((fonteClientes / fonteLeads.length) * 100) : 0
        };
      }).filter(f => f.value > 0);

      // Procedure data
      const procedimentos = ['Implante', 'Facetas', 'Clareamento', 'Ortodontia', 'Prótese', 'Canal', 'Limpeza', 'Avaliação', 'Outro'];
      const procedimentoData = procedimentos.map(p => ({
        label: p,
        value: leads.filter(l => l.servico === p || l.procedimento_interesse === p).length
      })).filter(p => p.value > 0);

      // Leads per day (current month)
      const leadsPorDia = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(baseDate);
        d.setDate(d.getDate() - (29 - i));
        const dateStr = format(d, 'yyyy-MM-dd');
        const count = leads.filter(l => l.created_at?.startsWith(dateStr)).length;
        return { date: format(d, 'dd/MM'), leads: count };
      });

      // Monthly comparison (last 6 months)
      const monthlyComparison = Array.from({ length: 6 }, (_, i) => {
        const monthDate = subMonths(baseDate, 5 - i);
        const monthStr = format(monthDate, 'yyyy-MM');
        const monthLeads = allLeads.filter(l => l.created_at?.startsWith(monthStr));
        return {
          month: format(monthDate, 'MMM/yy'),
          leads: monthLeads.length,
          clientes: monthLeads.filter(l => l.etapa === 'cliente_fechado').length,
          faturamento: monthLeads.filter(l => l.etapa === 'cliente_fechado')
            .reduce((acc, l) => acc + (Number(l.valor_fechado) || 0), 0)
        };
      });

      setKpis({
        totalLeads, totalConsultas, totalConsultasRealizadas, totalClientes, investimentoTotal,
        totalFaturamento, cplMedio, roasEstimado, comissaoBlent,
        taxaConversao, leadsPerdidos,
        leadsPorDia, funnelData, jornadaData, angulacaoData,
        fonteData, procedimentoData, monthlyComparison,
        followUpAtrasado: followUps.length > 0,
        atividadesRecentes: activities as Atividade[],
        metaAtual: meta || null,
        hasData: totalLeads > 0 || metrics.length > 0
      });
      setError(null);

    } catch (err: any) {
      console.error('Erro ao buscar dados do dashboard:', err);
      setError(err?.message || 'Erro ao carregar dados. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeBusiness?.id) {
      setLoading(false);
      return;
    }

    fetchDashboardData();

    if (isDemo) return;

    // Clean up previous channels
    channelsRef.current.forEach(ch => supabase.removeChannel(ch));
    channelsRef.current = [];

    const suffix = `${activeBusiness.id}_${Date.now()}`;

    const leadsChannel = supabase
      .channel(`dash_leads_${suffix}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads', filter: `business_id=eq.${activeBusiness.id}` }, fetchDashboardData)
      .subscribe();

    const metricsChannel = supabase
      .channel(`dash_metrics_${suffix}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'metricas_ads', filter: `business_id=eq.${activeBusiness.id}` }, fetchDashboardData)
      .subscribe();

    const activitiesChannel = supabase
      .channel(`dash_activities_${suffix}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'atividades', filter: `business_id=eq.${activeBusiness.id}` }, fetchDashboardData)
      .subscribe();

    channelsRef.current = [leadsChannel, metricsChannel, activitiesChannel];

    return () => {
      channelsRef.current.forEach(ch => supabase.removeChannel(ch));
      channelsRef.current = [];
    };
  }, [activeBusiness?.id, mesAno, isDemo]);

  return { kpis, loading, error, refresh: fetchDashboardData };
}
