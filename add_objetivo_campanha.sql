-- ================================================
-- Migração: Adicionar Objetivo de Campanha + Métricas por Tipo
-- Execute este script no Supabase SQL Editor
-- ================================================

-- 1. Adicionar coluna de objetivo da campanha
ALTER TABLE public.testes_criativos 
  ADD COLUMN IF NOT EXISTS objetivo TEXT NOT NULL DEFAULT 'Captação de Leads';

-- 2. Adicionar novas métricas para diferentes tipos de campanha
ALTER TABLE public.testes_criativos 
  ADD COLUMN IF NOT EXISTS impressoes INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS alcance INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS engajamentos INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cliques INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS resultados_dia INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gasto_hoje NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS conversoes INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS faturamento_gerado NUMERIC NOT NULL DEFAULT 0;

-- Pronto! Rode no SQL Editor do Supabase.
