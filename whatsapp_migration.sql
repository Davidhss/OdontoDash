-- ================================================
-- WhatsApp Integration Tables - Blent Dashboard
-- Execute este script no Supabase SQL Editor
-- ================================================

-- 1. Tabela: Instâncias do WhatsApp (uma por clínica)
CREATE TABLE IF NOT EXISTS whatsapp_instances (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  instance_name text NOT NULL,
  instance_id text,
  api_url text NOT NULL,
  api_key text NOT NULL,
  status text DEFAULT 'disconnected' CHECK (status IN ('disconnected', 'connecting', 'open')),
  phone_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(business_id)
);

-- 2. Tabela: Conversas (uma por contato)
CREATE TABLE IF NOT EXISTS whatsapp_chats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  remote_jid text NOT NULL,
  contact_name text,
  contact_phone text,
  profile_pic_url text,
  last_message text,
  last_message_at timestamptz,
  unread_count integer DEFAULT 0,
  is_archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(business_id, remote_jid)
);

-- 3. Tabela: Mensagens
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id uuid NOT NULL REFERENCES whatsapp_chats(id) ON DELETE CASCADE,
  message_id text UNIQUE,
  from_me boolean DEFAULT false,
  content text,
  media_type text DEFAULT 'text' CHECK (media_type IN ('text', 'image', 'audio', 'video', 'document', 'sticker')),
  media_url text,
  timestamp timestamptz DEFAULT now(),
  status text DEFAULT 'SENT' CHECK (status IN ('PENDING', 'SENT', 'SERVER_ACK', 'DELIVERY_ACK', 'READ', 'ERROR')),
  created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_business ON whatsapp_chats(business_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_lead ON whatsapp_chats(lead_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_chats_remote_jid ON whatsapp_chats(remote_jid);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_chat ON whatsapp_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_timestamp ON whatsapp_messages(timestamp);

-- RLS (Row Level Security)
ALTER TABLE whatsapp_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Policies para whatsapp_instances
CREATE POLICY "Users can view their business instances" ON whatsapp_instances
  FOR SELECT USING (
    business_id IN (
      SELECT business_id FROM business_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their business instances" ON whatsapp_instances
  FOR ALL USING (
    business_id IN (
      SELECT business_id FROM business_members WHERE user_id = auth.uid()
    )
  );

-- Policies para whatsapp_chats
CREATE POLICY "Users can view their business chats" ON whatsapp_chats
  FOR SELECT USING (
    business_id IN (
      SELECT business_id FROM business_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their business chats" ON whatsapp_chats
  FOR ALL USING (
    business_id IN (
      SELECT business_id FROM business_members WHERE user_id = auth.uid()
    )
  );

-- Policies para whatsapp_messages
CREATE POLICY "Users can view messages from their business chats" ON whatsapp_messages
  FOR SELECT USING (
    chat_id IN (
      SELECT wc.id FROM whatsapp_chats wc
      WHERE wc.business_id IN (
        SELECT business_id FROM business_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage messages from their business chats" ON whatsapp_messages
  FOR ALL USING (
    chat_id IN (
      SELECT wc.id FROM whatsapp_chats wc
      WHERE wc.business_id IN (
        SELECT business_id FROM business_members WHERE user_id = auth.uid()
      )
    )
  );

-- Habilitar Realtime nas tabelas de chat
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_messages;
