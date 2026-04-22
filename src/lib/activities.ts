import { supabase } from './supabase';

export type AtividadeTipo = 'lead_criado' | 'etapa_mudada' | 'contato_registrado' | 'consulta_agendada' | 'cliente_fechado' | 'meta_atualizada';

export async function logAtividade(
  tipo: AtividadeTipo,
  descricao: string,
  lead_id?: string,
  lead_nome?: string,
  business_id?: string
) {
  try {
    const { error } = await supabase
      .from('atividades')
      .insert({
        tipo,
        descricao,
        lead_id,
        lead_nome,
        business_id
      });
    
    if (error) console.error('Erro ao logar atividade:', error);
  } catch (err) {
    console.error('Erro ao logar atividade:', err);
  }
}
