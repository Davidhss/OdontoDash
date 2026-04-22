import { supabase } from '../lib/supabase';
import { LeadEtapa, LeadFonte, LeadServico, LeadTemperature } from '../types';
import { subDays, format, startOfMonth } from 'date-fns';

export async function seedMockData(businessId: string, userId: string) {
  console.log('Seeding mock data for business:', businessId);

  // 1. Create some leads
  const leadsCount = 45;
  const stages: LeadEtapa[] = ['novo_lead', 'contato_feito', 'consulta_agendada', 'consulta_realizada', 'cliente_fechado'];
  const sources: LeadFonte[] = ['Meta Ads', 'Google', 'Indicação', 'Instagram Orgânico'];
  const services: LeadServico[] = ['Implante', 'Ortodontia', 'Clareamento', 'Facetas', 'Avaliação'];
  const temperatures: LeadTemperature[] = ['quente', 'morno', 'frio'];

  const leadsToInsert = Array.from({ length: leadsCount }).map((_, i) => {
    const date = subDays(new Date(), Math.floor(Math.random() * 30));
    const etapa = stages[Math.floor(Math.random() * stages.length)];
    const valor_fechado = etapa === 'cliente_fechado' ? Math.floor(Math.random() * 5000) + 1500 : 0;

    return {
      business_id: businessId,
      nome: `Paciente Exemplo ${i + 1}`,
      telefone: `(11) 9${Math.floor(Math.random() * 90000000 + 10000000)}`,
      etapa,
      fonte: sources[Math.floor(Math.random() * sources.length)],
      servico: services[Math.floor(Math.random() * services.length)],
      temperatura: temperatures[Math.floor(Math.random() * temperatures.length)],
      valor_fechado,
      created_at: date.toISOString(),
      ultima_atualizacao: date.toISOString()
    };
  });

  const { data: insertedLeads, error: leadsError } = await supabase
    .from('leads')
    .insert(leadsToInsert)
    .select();

  if (leadsError) {
    console.error('Error seeding leads:', leadsError);
    return;
  }

  // 2. Create some ad metrics
  const metricsToInsert = Array.from({ length: 10 }).map((_, i) => {
    const date = subDays(new Date(), i * 3);
    const investimento = Math.floor(Math.random() * 200) + 50;
    const cliques = Math.floor(investimento * (Math.random() * 2 + 1));
    const leads = Math.floor(cliques * (Math.random() * 0.1 + 0.05));

    return {
      business_id: businessId,
      campanha: i % 2 === 0 ? 'Implantes - Google Search' : 'Ortodontia - Meta Ads',
      investimento,
      cliques,
      leads_gerados: leads,
      data_lancamento: format(date, 'yyyy-MM-dd'),
      created_at: date.toISOString()
    };
  });

  await supabase.from('metricas_ads').insert(metricsToInsert);

  // 3. Create some activities
  if (insertedLeads) {
    const activitiesToInsert = insertedLeads.slice(0, 15).map(lead => ({
      business_id: businessId,
      lead_id: lead.id,
      lead_nome: lead.nome,
      tipo: 'lead_criado',
      descricao: `Lead ${lead.nome} captado via ${lead.fonte}`,
      created_at: lead.created_at
    }));

    await supabase.from('atividades').insert(activitiesToInsert);
  }

  // 4. Create metas for current month
  const currentMonth = format(startOfMonth(new Date()), 'yyyy-MM');
  await supabase.from('metas').insert({
    business_id: businessId,
    mes_ano: currentMonth,
    meta_leads: 100,
    meta_consultas: 40,
    meta_clientes: 15,
    meta_faturamento: 50000,
    meta_investimento: 5000
  });

  console.log('Mock data seeded successfully');
}
