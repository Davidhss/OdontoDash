-- ===============================================================
-- SCHEMA DO BANCO DE DADOS: BLENT GROWTH DASHBOARD (ODONTO PRIME)
-- ===============================================================

-- 0. TABELAS DE GESTÃO DE NEGÓCIOS
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    nome TEXT NOT NULL,
    regiao TEXT,
    user_id UUID NOT NULL, -- Criador do negócio
    invite_code TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS business_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT DEFAULT 'member', -- 'admin', 'member'
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(business_id, user_id)
);

-- 1. TABELA: leads
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    nome TEXT NOT NULL,
    telefone TEXT,
    servico TEXT,
    fonte TEXT,
    temperatura TEXT,
    etapa TEXT,
    data_consulta DATE,
    valor_fechado NUMERIC(10,2),
    anotacoes TEXT,
    ultima_atualizacao TIMESTAMPTZ DEFAULT now(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    procedimento_interesse TEXT,
    angulo_oferta TEXT,
    etapa_jornada TEXT,
    data_retorno_previsto DATE,
    reativacao BOOLEAN DEFAULT false
);

-- 2. TABELA: contatos
CREATE TABLE IF NOT EXISTS contatos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    tipo TEXT,
    direcao TEXT,
    resumo TEXT NOT NULL,
    resultado TEXT,
    autor TEXT,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE
);

-- 3. TABELA: metricas_ads
CREATE TABLE IF NOT EXISTS metricas_ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    data_lancamento DATE NOT NULL,
    campanha TEXT NOT NULL,
    investimento NUMERIC(10,2) NOT NULL DEFAULT 0,
    impressoes INTEGER DEFAULT 0,
    cliques INTEGER DEFAULT 0,
    leads_gerados INTEGER DEFAULT 0,
    consultas_geradas INTEGER DEFAULT 0,
    observacoes TEXT,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    angulo_oferta TEXT,
    procedimento_foco TEXT
);

-- 4. TABELA: metas
CREATE TABLE IF NOT EXISTS metas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mes_ano TEXT NOT NULL, -- formato: '2026-04'
    meta_leads INTEGER NOT NULL DEFAULT 100,
    meta_consultas INTEGER NOT NULL DEFAULT 30,
    meta_clientes INTEGER NOT NULL DEFAULT 15,
    meta_investimento NUMERIC(10,2) DEFAULT 3000,
    meta_faturamento NUMERIC(10,2) DEFAULT 15000,
    criado_em TIMESTAMPTZ DEFAULT now(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    UNIQUE(business_id, mes_ano)
);

-- 5. TABELA: atividades
CREATE TABLE IF NOT EXISTS atividades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    tipo TEXT,
    descricao TEXT NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    lead_nome TEXT,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE
);

-- 6. TABELA: follow_up
CREATE TABLE IF NOT EXISTS follow_up (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    data_prevista TIMESTAMPTZ NOT NULL,
    mensagem_template TEXT NOT NULL,
    realizado BOOLEAN DEFAULT false,
    resultado TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. TABELA: apologia
CREATE TABLE IF NOT EXISTS apologia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL, -- 'Vídeo', 'Google Review'
    data TIMESTAMPTZ NOT NULL,
    coletado BOOLEAN DEFAULT false,
    texto_depoimento TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. TABELA: comissao_mensal
CREATE TABLE IF NOT EXISTS comissao_mensal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    mes_ano TEXT NOT NULL, -- '2026-04'
    total_novos_pacientes INTEGER DEFAULT 0,
    faturamento_incremental NUMERIC(10,2) DEFAULT 0,
    comissao_calculada NUMERIC(10,2) DEFAULT 0,
    fixo_mes NUMERIC(10,2) DEFAULT 1000,
    total_blent NUMERIC(10,2) DEFAULT 0,
    status TEXT DEFAULT 'Aberto',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(business_id, mes_ano)
);

-- ===============================================================
-- ÍNDICES PARA PERFORMANCE
-- ===============================================================
CREATE INDEX IF NOT EXISTS idx_leads_business_id ON leads(business_id);
CREATE INDEX IF NOT EXISTS idx_leads_etapa ON leads(etapa);
CREATE INDEX IF NOT EXISTS idx_contatos_business_id ON contatos(business_id);
CREATE INDEX IF NOT EXISTS idx_metricas_ads_business_id ON metricas_ads(business_id);
CREATE INDEX IF NOT EXISTS idx_atividades_business_id ON atividades(business_id);

-- ===============================================================
-- ROW LEVEL SECURITY (RLS)
-- ===============================================================
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE contatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up ENABLE ROW LEVEL SECURITY;
ALTER TABLE apologia ENABLE ROW LEVEL SECURITY;
ALTER TABLE comissao_mensal ENABLE ROW LEVEL SECURITY;

-- Políticas simplificadas (ajustar conforme necessidade de produção)
CREATE POLICY "allow_all" ON businesses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON business_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON contatos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON metricas_ads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON metas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON atividades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON follow_up FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON apologia FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON comissao_mensal FOR ALL USING (true) WITH CHECK (true);
