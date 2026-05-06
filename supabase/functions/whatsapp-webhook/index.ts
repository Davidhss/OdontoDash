import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    const { event, instance, data } = payload

    if (!instance) return new Response('No instance', { status: 400 })

    // 1. Buscar o business_id vinculado a esta instância
    const { data: instanceData, error: instanceError } = await supabase
      .from('whatsapp_instances')
      .select('business_id')
      .eq('instance_name', instance)
      .single()

    if (instanceError || !instanceData) {
      return new Response(JSON.stringify({ error: 'Instance not found' }), { status: 404 })
    }

    const business_id = instanceData.business_id

    // 2. Tratar evento de mensagem recebida ou enviada
    if (event === 'messages.upsert') {
      const msg = data
      const remoteJid = msg.key.remoteJid
      
      if (remoteJid === 'status@broadcast') return new Response('OK')

      // Encontrar ou criar o chat
      let { data: chat, error: chatError } = await supabase
        .from('whatsapp_chats')
        .select('id, unread_count')
        .eq('business_id', business_id)
        .eq('remote_jid', remoteJid)
        .single()

      // Extração robusta de conteúdo
      let content = '';
      const m = msg.message;
      if (!m) return new Response('No message content');

      if (m.conversation) content = m.conversation;
      else if (m.extendedTextMessage?.text) content = m.extendedTextMessage.text;
      else if (m.imageMessage) content = m.imageMessage.caption || '📷 Imagem';
      else if (m.videoMessage) content = m.videoMessage.caption || '🎥 Vídeo';
      else if (m.audioMessage) content = '🎵 Áudio';
      else if (m.documentMessage) content = m.documentMessage.title || m.documentMessage.caption || '📄 Documento';
      else if (m.stickerMessage) content = '🎨 Figurinha';
      else if (m.contactMessage) content = `👤 Contato: ${m.contactMessage.displayName}`;
      else if (m.locationMessage) content = '📍 Localização';
      else if (m.buttonsResponseMessage) content = m.buttonsResponseMessage.selectedButtonId || 'Botão selecionado';
      else if (m.listResponseMessage) content = m.listResponseMessage.title || 'Item da lista selecionado';
      else if (m.viewOnceMessageV2?.message?.imageMessage) content = '📷 Imagem (Visualização única)';
      else if (m.viewOnceMessageV2?.message?.videoMessage) content = '🎥 Vídeo (Visualização única)';
      else content = 'Mensagem de mídia ou formato não suportado';


      const timestamp = new Date(msg.messageTimestamp * 1000).toISOString()

      if (chatError && chatError.code === 'PGRST116') {
        // Criar chat se não existir
        const { data: newChat, error: createError } = await supabase
          .from('whatsapp_chats')
          .insert({
            business_id,
            remote_jid: remoteJid,
            contact_name: msg.pushName || null,
            last_message: content,
            last_message_at: timestamp,
            unread_count: msg.key.fromMe ? 0 : 1
          })
          .select('id')
          .single()
        
        if (createError) throw createError
        chat = newChat
      } else if (chat) {
        // Atualizar chat existente
        await supabase
          .from('whatsapp_chats')
          .update({
            last_message: content,
            last_message_at: timestamp,
            unread_count: msg.key.fromMe ? chat.unread_count : (chat.unread_count || 0) + 1
          })
          .eq('id', chat.id)
      }

      // Inserir a mensagem na tabela de mensagens
      if (chat) {
        await supabase
          .from('whatsapp_messages')
          .upsert({
            chat_id: chat.id,
            message_id: msg.key.id,
            from_me: msg.key.fromMe || false,
            content: content,
            timestamp: timestamp,
            status: 'RECEIVED'
          }, { onConflict: 'message_id' })
      }
    }

    return new Response(JSON.stringify({ ok: true }), { 
      headers: { 'Content-Type': 'application/json' } 
    })
  } catch (err) {
    console.error('Webhook Error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
