-- ================================================
-- Correção: Adicionar UNIQUE em message_id
-- ================================================

ALTER TABLE whatsapp_messages ADD CONSTRAINT whatsapp_messages_message_id_key UNIQUE (message_id);
