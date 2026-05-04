export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          created_at: string | null
          nome: string
          regiao: string | null
          user_id: string
          invite_code: string | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          nome: string
          regiao?: string | null
          user_id: string
          invite_code?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          nome?: string
          regiao?: string | null
          user_id?: string
          invite_code?: string | null
        }
        Relationships: []
      }
      business_members: {
        Row: {
          id: string
          business_id: string
          user_id: string
          role: string | null
          joined_at: string | null
        }
        Insert: {
          id?: string
          business_id: string
          user_id: string
          role?: string | null
          joined_at?: string | null
        }
        Update: {
          id?: string
          business_id?: string
          user_id?: string
          role?: string | null
          joined_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      atividades: {
        Row: {
          created_at: string | null
          descricao: string
          id: string
          lead_id: string | null
          lead_nome: string | null
          tipo: string | null
          business_id: string | null
        }
        Insert: {
          created_at?: string | null
          descricao: string
          id?: string
          lead_id?: string | null
          lead_nome?: string | null
          tipo?: string | null
          business_id?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string
          id?: string
          lead_id?: string | null
          lead_nome?: string | null
          tipo?: string | null
          business_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atividades_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      contatos: {
        Row: {
          autor: string | null
          created_at: string | null
          direcao: string | null
          id: string
          lead_id: string | null
          resultado: string | null
          resumo: string
          tipo: string | null
          business_id: string | null
        }
        Insert: {
          autor?: string | null
          created_at?: string | null
          direcao?: string | null
          id?: string
          lead_id?: string | null
          resultado?: string | null
          resumo: string
          tipo?: string | null
          business_id?: string | null
        }
        Update: {
          autor?: string | null
          created_at?: string | null
          direcao?: string | null
          id?: string
          lead_id?: string | null
          resultado?: string | null
          resumo?: string
          tipo?: string | null
          business_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contatos_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contatos_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      leads: {
        Row: {
          anotacoes: string | null
          created_at: string | null
          data_consulta: string | null
          etapa: string | null
          fonte: string | null
          id: string
          nome: string
          servico: string | null
          telefone: string | null
          temperatura: string | null
          ultima_atualizacao: string | null
          valor_fechado: number | null
          business_id: string | null
          procedimento_interesse: string | null
          angulo_oferta: string | null
          etapa_jornada: string | null
          data_retorno_previsto: string | null
          reativacao: boolean | null
        }
        Insert: {
          anotacoes?: string | null
          created_at?: string | null
          data_consulta?: string | null
          etapa?: string | null
          fonte?: string | null
          id?: string
          nome: string
          servico?: string | null
          telefone?: string | null
          temperatura?: string | null
          ultima_atualizacao?: string | null
          valor_fechado?: number | null
          business_id?: string | null
          procedimento_interesse?: string | null
          angulo_oferta?: string | null
          etapa_jornada?: string | null
          data_retorno_previsto?: string | null
          reativacao?: boolean | null
        }
        Update: {
          anotacoes?: string | null
          created_at?: string | null
          data_consulta?: string | null
          etapa?: string | null
          fonte?: string | null
          id?: string
          nome?: string
          servico?: string | null
          telefone?: string | null
          temperatura?: string | null
          ultima_atualizacao?: string | null
          valor_fechado?: number | null
          business_id?: string | null
          procedimento_interesse?: string | null
          angulo_oferta?: string | null
          etapa_jornada?: string | null
          data_retorno_previsto?: string | null
          reativacao?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      follow_up: {
        Row: {
          id: string
          lead_id: string
          business_id: string
          data_prevista: string
          mensagem_template: string
          realizado: boolean
          resultado: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          lead_id: string
          business_id: string
          data_prevista: string
          mensagem_template: string
          realizado?: boolean
          resultado?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          lead_id?: string
          business_id?: string
          data_prevista?: string
          mensagem_template?: string
          realizado?: boolean
          resultado?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_up_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      apologia: {
        Row: {
          id: string
          lead_id: string
          business_id: string
          tipo: string
          data: string
          coletado: boolean
          texto_depoimento: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          lead_id: string
          business_id: string
          tipo: string
          data: string
          coletado?: boolean
          texto_depoimento?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          lead_id?: string
          business_id?: string
          tipo?: string
          data?: string
          coletado?: boolean
          texto_depoimento?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apologia_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apologia_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      comissao_mensal: {
        Row: {
          id: string
          business_id: string
          mes_ano: string
          total_novos_pacientes: number
          faturamento_incremental: number
          comissao_calculada: number
          fixo_mes: number
          total_blent: number
          status: string
          created_at: string | null
        }
        Insert: {
          id?: string
          business_id: string
          mes_ano: string
          total_novos_pacientes?: number
          faturamento_incremental?: number
          comissao_calculada?: number
          fixo_mes?: number
          total_blent?: number
          status?: string
          created_at?: string | null
        }
        Update: {
          id?: string
          business_id?: string
          mes_ano?: string
          total_novos_pacientes?: number
          faturamento_incremental?: number
          comissao_calculada?: number
          fixo_mes?: number
          total_blent?: number
          status?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comissao_mensal_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      metas: {
        Row: {
          criado_em: string | null
          id: string
          mes_ano: string
          meta_clientes: number
          meta_consultas: number
          meta_faturamento: number | null
          meta_investimento: number | null
          meta_leads: number
          business_id: string | null
        }
        Insert: {
          criado_em?: string | null
          id?: string
          mes_ano: string
          meta_clientes?: number
          meta_consultas?: number
          meta_faturamento?: number | null
          meta_investimento?: number | null
          meta_leads?: number
          business_id?: string | null
        }
        Update: {
          criado_em?: string | null
          id?: string
          mes_ano?: string
          meta_clientes?: number
          meta_consultas?: number
          meta_faturamento?: number | null
          meta_investimento?: number | null
          meta_leads?: number
          business_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metas_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      metricas_ads: {
        Row: {
          campanha: string
          cliques: number | null
          consultas_geradas: number | null
          created_at: string | null
          data_lancamento: string
          id: string
          impressoes: number | null
          investimento: number
          leads_gerados: number | null
          observacoes: string | null
          business_id: string | null
          angulo_oferta: string | null
          procedimento_foco: string | null
        }
        Insert: {
          campanha: string
          cliques?: number | null
          consultas_geradas?: number | null
          created_at?: string | null
          data_lancamento: string
          id?: string
          impressoes?: number | null
          investimento?: number
          leads_gerados?: number | null
          observacoes?: string | null
          business_id?: string | null
          angulo_oferta?: string | null
          procedimento_foco?: string | null
        }
        Update: {
          campanha?: string
          cliques?: number | null
          consultas_geradas?: number | null
          created_at?: string | null
          data_lancamento?: string
          id?: string
          impressoes?: number | null
          investimento?: number
          leads_gerados?: number | null
          observacoes?: string | null
          business_id?: string | null
          angulo_oferta?: string | null
          procedimento_foco?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metricas_ads_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      testes_criativos: {
        Row: {
          id: string
          business_id: string
          created_at: string | null
          nome: string
          servico_foco: string
          verba_diaria: number
          investimento_total: number
          leads_gerados: number
          mqls_gerados: number
          formato: string
          status: string
          imagem_url: string | null
          tags: string[] | null
        }
        Insert: {
          id?: string
          business_id: string
          created_at?: string | null
          nome: string
          servico_foco: string
          verba_diaria?: number
          investimento_total?: number
          leads_gerados?: number
          mqls_gerados?: number
          formato: string
          status?: string
          imagem_url?: string | null
          tags?: string[] | null
        }
        Update: {
          id?: string
          business_id?: string
          created_at?: string | null
          nome?: string
          servico_foco?: string
          verba_diaria?: number
          investimento_total?: number
          leads_gerados?: number
          mqls_gerados?: number
          formato?: string
          status?: string
          imagem_url?: string | null
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "testes_criativos_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
