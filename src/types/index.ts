import { Database } from '../lib/database.types';

export type LeadRow = Database['public']['Tables']['leads']['Row'];
export type ContatoRow = Database['public']['Tables']['contatos']['Row'];
export type MetricaAdsRow = Database['public']['Tables']['metricas_ads']['Row'];
export type MetaRow = Database['public']['Tables']['metas']['Row'];
export type AtividadeRow = Database['public']['Tables']['atividades']['Row'];
export type BusinessRow = Database['public']['Tables']['businesses']['Row'];
export type FollowUpRow = Database['public']['Tables']['follow_up']['Row'];
export type ApologiaRow = Database['public']['Tables']['apologia']['Row'];
export type ComissaoMensalRow = Database['public']['Tables']['comissao_mensal']['Row'];
export type TesteCriativoRow = Database['public']['Tables']['testes_criativos']['Row'];

export type LeadTemperature = 'quente' | 'morno' | 'frio';
export type LeadEtapa = 'novo_lead' | 'contato_feito' | 'consulta_agendada' | 'consulta_realizada' | 'cliente_fechado' | 'perdido' | 'desqualificado';
export type LeadFonte = 'Meta Ads' | 'Google' | 'Indicação' | 'Instagram Orgânico' | 'Caminhada' | 'Outro';
export type LeadServico = 'Clareamento' | 'Implante' | 'Ortodontia' | 'Limpeza' | 'Canal' | 'Prótese' | 'Facetas' | 'Avaliação' | 'Outro';

export type ProcedimentoInteresse = 'Implante' | 'Facetas' | 'Clareamento' | 'Avaliação' | 'Ortodontia' | 'Outro';
export type AnguloOferta = 'Direto' | 'Dor-Desejo' | 'Autoridade' | 'Indicação';
export type EtapaJornada = 'Descoberta' | 'Atração' | 'Curiosidade' | 'Ação' | 'Apologia';

export interface Business extends BusinessRow {}

export interface Lead extends Omit<LeadRow, 'temperatura' | 'etapa' | 'fonte' | 'servico' | 'procedimento_interesse' | 'angulo_oferta' | 'etapa_jornada'> {
  temperatura: LeadTemperature;
  etapa: LeadEtapa;
  fonte: LeadFonte;
  servico: LeadServico;
  procedimento_interesse: ProcedimentoInteresse;
  angulo_oferta: AnguloOferta;
  etapa_jornada: EtapaJornada;
}

export interface Contato extends ContatoRow {}
export interface MetricaAds extends MetricaAdsRow {}
export interface MetaMes extends MetaRow {}
export interface Atividade extends AtividadeRow {}
export interface FollowUp extends FollowUpRow {}
export interface Apologia extends ApologiaRow {}
export interface ComissaoMensal extends ComissaoMensalRow {}

export type FormatoCriativo = 'Estático' | 'Carrossel' | 'Vídeo';
export type StatusCriativo = 'Ativo' | 'Pausado' | 'Concluído';

export interface TesteCriativo extends Omit<TesteCriativoRow, 'formato' | 'status'> {
  formato: FormatoCriativo;
  status: StatusCriativo;
}

export interface Meta {
  atual: number;
  meta: number;
}

export interface MetasMesDashboard {
  leads: Meta;
  consultas: Meta;
  clientes: Meta;
  faturamento: Meta;
  investimento: Meta;
}
