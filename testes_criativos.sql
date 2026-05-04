-- Script para criar a tabela de testes de criativos

CREATE TABLE public.testes_criativos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    nome TEXT NOT NULL,
    servico_foco TEXT NOT NULL,
    verba_diaria NUMERIC NOT NULL DEFAULT 0,
    investimento_total NUMERIC NOT NULL DEFAULT 0,
    leads_gerados INTEGER NOT NULL DEFAULT 0,
    mqls_gerados INTEGER NOT NULL DEFAULT 0,
    
    formato TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Ativo',
    imagem_url TEXT,
    tags TEXT[] DEFAULT '{}'
);

-- RLS (Row Level Security)
ALTER TABLE public.testes_criativos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver testes_criativos da sua clínica" 
    ON public.testes_criativos 
    FOR SELECT 
    USING (
        business_id IN (
            SELECT business_id FROM public.business_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem inserir testes_criativos na sua clínica" 
    ON public.testes_criativos 
    FOR INSERT 
    WITH CHECK (
        business_id IN (
            SELECT business_id FROM public.business_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem atualizar testes_criativos da sua clínica" 
    ON public.testes_criativos 
    FOR UPDATE 
    USING (
        business_id IN (
            SELECT business_id FROM public.business_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem deletar testes_criativos da sua clínica" 
    ON public.testes_criativos 
    FOR DELETE 
    USING (
        business_id IN (
            SELECT business_id FROM public.business_members WHERE user_id = auth.uid()
        )
    );
