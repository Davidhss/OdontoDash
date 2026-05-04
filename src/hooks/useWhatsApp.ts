import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useBusiness } from './useBusiness';
import * as evoApi from '../lib/evolutionApi';
import { toast } from 'react-hot-toast';

export interface WhatsAppInstance {
  id: string;
  business_id: string;
  instance_name: string;
  instance_id: string | null;
  api_url: string;
  api_key: string;
  status: 'disconnected' | 'connecting' | 'open';
  phone_number: string | null;
  created_at: string;
}

export interface WhatsAppChat {
  id: string;
  business_id: string;
  lead_id: string | null;
  remote_jid: string;
  contact_name: string | null;
  contact_phone: string | null;
  profile_pic_url: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  is_archived: boolean;
  created_at: string;
}

export interface WhatsAppMessage {
  id: string;
  chat_id: string;
  message_id: string | null;
  from_me: boolean;
  content: string | null;
  media_type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'sticker';
  media_url: string | null;
  timestamp: string;
  status: string;
  created_at: string;
}

export function useWhatsApp() {
  const { activeBusiness } = useBusiness();
  const [instance, setInstance] = useState<WhatsAppInstance | null>(null);
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [activeChat, setActiveChat] = useState<WhatsAppChat | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'open'>('disconnected');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const chatPollingRef = useRef<NodeJS.Timeout | null>(null);

  // Load instance for active business
  const loadInstance = useCallback(async () => {
    if (!activeBusiness) return;
    try {
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('business_id', activeBusiness.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setInstance(data as WhatsAppInstance | null);
      if (data) {
        setConnectionStatus(data.status as any);
      }
    } catch (err) {
      console.error('Erro ao carregar instância WhatsApp:', err);
    } finally {
      setLoading(false);
    }
  }, [activeBusiness]);

  // Load chats
  const loadChats = useCallback(async () => {
    if (!activeBusiness) return;
    try {
      const { data, error } = await supabase
        .from('whatsapp_chats')
        .select('*')
        .eq('business_id', activeBusiness.id)
        .eq('is_archived', false)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      setChats(data as WhatsAppChat[]);
      
      const total = (data || []).reduce((sum, c) => sum + (c.unread_count || 0), 0);
      setUnreadTotal(total);
    } catch (err) {
      console.error('Erro ao carregar chats:', err);
    }
  }, [activeBusiness]);

  // Load messages for active chat
  const loadMessages = useCallback(async (chatId: string) => {
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setMessages(data as WhatsAppMessage[]);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Setup instance
  const setupInstance = useCallback(async (instanceName: string) => {
    if (!activeBusiness) return;
    try {
      setConnectionStatus('connecting');
      
      // Create instance on Evolution API
      const result = await evoApi.createInstance(instanceName);
      
      // Save to Supabase
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .upsert({
          business_id: activeBusiness.id,
          instance_name: instanceName,
          instance_id: result?.instance?.instanceId || null,
          api_url: import.meta.env.VITE_EVOLUTION_API_URL,
          api_key: import.meta.env.VITE_EVOLUTION_API_KEY,
          status: 'connecting',
        }, { onConflict: 'business_id' })
        .select()
        .single();

      if (error) throw error;
      setInstance(data as WhatsAppInstance);

      // Get QR code
      if (result?.qrcode?.base64) {
        setQrCode(result.qrcode.base64);
      }

      // Start polling for connection status
      startConnectionPolling(instanceName);

      toast.success('Instância criada! Escaneie o QR Code.');
      return result;
    } catch (err: any) {
      console.error('Erro ao criar instância:', err);
      setConnectionStatus('disconnected');
      toast.error(err?.response?.data?.message || 'Erro ao conectar WhatsApp');
    }
  }, [activeBusiness]);

  // Connect (get QR code)
  const reconnect = useCallback(async () => {
    if (!instance) return;
    try {
      setConnectionStatus('connecting');
      const result = await evoApi.connectInstance(instance.instance_name);
      
      if (result?.base64) {
        setQrCode(result.base64);
      }
      
      startConnectionPolling(instance.instance_name);
    } catch (err: any) {
      console.error('Erro ao reconectar:', err);
      toast.error('Erro ao gerar QR Code');
    }
  }, [instance]);

  // Poll connection status
  const startConnectionPolling = useCallback((instanceName: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const result = await evoApi.getConnectionState(instanceName);
        const state = result?.instance?.state || 'close';

        if (state === 'open') {
          setConnectionStatus('open');
          setQrCode(null);
          
          // Update Supabase
          await supabase
            .from('whatsapp_instances')
            .update({ status: 'open' })
            .eq('instance_name', instanceName);

          toast.success('WhatsApp conectado com sucesso!');
          
          if (pollingRef.current) clearInterval(pollingRef.current);
          
          // Start syncing chats
          syncChats(instanceName);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);
  }, []);

  // Sync chats from Evolution API to Supabase
  const syncChats = useCallback(async (instanceName: string) => {
    if (!activeBusiness) return;
    try {
      // Fetch both chats and contacts
      const [apiChats, apiContacts] = await Promise.all([
        evoApi.findChats(instanceName).catch(() => []),
        evoApi.findContacts(instanceName).catch(() => [])
      ]);
      
      if (!apiChats || !Array.isArray(apiChats)) return;

      // Build contacts map
      const contactsMap = new Map();
      if (Array.isArray(apiContacts)) {
        apiContacts.forEach((c: any) => {
          if (c.id || c.remoteJid) {
            contactsMap.set(c.remoteJid || c.id, c);
          }
        });
      }

      // Process all chats concurrently to avoid blocking
      await Promise.all(apiChats.map(async (chat: any) => {
        if (!chat.remoteJid || evoApi.isGroupJid(chat.remoteJid)) return; // Skip groups for now

        // Get actual phone from remoteJidAlt if it's a @lid
        const realJid = chat.lastMessage?.key?.remoteJidAlt || chat.remoteJid;
        const phone = evoApi.extractPhoneFromJid(realJid);
        
        // Find best possible name from chat or contacts
        const contactData = contactsMap.get(chat.remoteJid) || contactsMap.get(realJid);
        let contactName = contactData?.pushName || contactData?.name || chat.pushName || chat.name || null;

        // If it's a hidden LID number and no contact name exists, use a generic name
        if (!contactName && realJid.includes('@lid') && phone.length > 13) {
          contactName = 'Usuário (Oculto)';
        }

        let profilePicUrl = contactData?.profilePicUrl || chat.profilePicUrl || null;

        // Automatically fetch missing profile pictures from Evolution API
        if (!profilePicUrl) {
          try {
            profilePicUrl = await evoApi.getProfilePicture(instanceName, chat.remoteJid);
          } catch (e) {
            // ignore failure
          }
        }

        // Upsert chat in Supabase
        await supabase
          .from('whatsapp_chats')
          .upsert({
            business_id: activeBusiness.id,
            remote_jid: chat.remoteJid,
            contact_name: contactName,
            contact_phone: phone,
            profile_pic_url: profilePicUrl || null,
            last_message: chat.lastMessage?.message?.conversation || 
                          chat.lastMessage?.message?.extendedTextMessage?.text || 
                          '📎 Mídia',
            last_message_at: chat.lastMessage?.messageTimestamp 
              ? new Date(chat.lastMessage.messageTimestamp * 1000).toISOString()
              : null,
          }, { onConflict: 'business_id,remote_jid' });
      }));

      await loadChats();
    } catch (err) {
      console.error('Erro ao sincronizar chats:', err);
    }
  }, [activeBusiness, loadChats]);

  // Sync messages for a specific chat
  const syncMessages = useCallback(async (chat: WhatsAppChat) => {
    if (!instance) return;
    try {
      const response = await evoApi.findMessages(instance.instance_name, chat.remote_jid);
      const apiMessages = response?.messages?.records || response?.records || response;
      if (!apiMessages || !Array.isArray(apiMessages)) return;

      const processedMessages = await Promise.all(
        apiMessages
          .filter((msg: any) => msg.key && msg.message)
          .slice(-100) // Last 100 messages
          .map(async (msg: any) => {
            const mediaType = getMediaType(msg.message);
            let mediaUrl = null;

            // Fetch base64 for media messages
            if (['image', 'audio', 'video', 'document', 'sticker'].includes(mediaType)) {
              try {
                const mediaResponse = await fetch(`${import.meta.env.VITE_EVOLUTION_API_URL}/chat/getBase64FromMediaMessage/${instance.instance_name}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'apikey': import.meta.env.VITE_EVOLUTION_API_KEY,
                  },
                  body: JSON.stringify({ message: msg })
                });
                const mediaData = await mediaResponse.json();
                if (mediaData && mediaData.base64) {
                  mediaUrl = mediaData.base64.startsWith('data:') ? mediaData.base64 : `data:${getMimeType(mediaType)};base64,${mediaData.base64}`;
                }
              } catch (e) {
                console.error('Failed to fetch media base64', e);
              }
            }

            return {
              chat_id: chat.id,
              message_id: msg.key.id,
              from_me: msg.key.fromMe || false,
              content: msg.message?.conversation || 
                       msg.message?.extendedTextMessage?.text ||
                       msg.message?.imageMessage?.caption ||
                       msg.message?.videoMessage?.caption ||
                       null,
              media_type: mediaType,
              media_url: mediaUrl,
              timestamp: msg.messageTimestamp 
                ? new Date(msg.messageTimestamp * 1000).toISOString() 
                : new Date().toISOString(),
              status: msg.key.fromMe ? 'READ' : 'READ',
            };
          })
      );

      // Insert messages (ignore duplicates)
      for (const msg of processedMessages) {
        await supabase
          .from('whatsapp_messages')
          .upsert(msg, { 
            onConflict: 'message_id',
            ignoreDuplicates: true 
          })
          .select();
      }

      await loadMessages(chat.id);

      // Mark as read
      await supabase
        .from('whatsapp_chats')
        .update({ unread_count: 0 })
        .eq('id', chat.id);

    } catch (err) {
      console.error('Erro ao sincronizar mensagens:', err);
    }
  }, [instance, loadMessages]);

  // Send message
  const sendMessage = useCallback(async (text: string) => {
    if (!instance || !activeChat) return;
    try {
      const phone = evoApi.extractPhoneFromJid(activeChat.remote_jid);
      await evoApi.sendText(instance.instance_name, phone, text);

      // Save to Supabase immediately
      const { data: newMsg } = await supabase
        .from('whatsapp_messages')
        .insert({
          chat_id: activeChat.id,
          from_me: true,
          content: text,
          media_type: 'text',
          timestamp: new Date().toISOString(),
          status: 'SENT',
        })
        .select()
        .single();

      if (newMsg) {
        setMessages(prev => [...prev, newMsg as WhatsAppMessage]);
      }

      // Update chat preview
      await supabase
        .from('whatsapp_chats')
        .update({
          last_message: text,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', activeChat.id);

      await loadChats();
    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err);
      toast.error('Erro ao enviar mensagem');
    }
  }, [instance, activeChat, loadChats]);

  // Select a chat
  const selectChat = useCallback(async (chat: WhatsAppChat) => {
    setActiveChat(chat);
    await loadMessages(chat.id);
    
    // If no messages yet, sync from Evolution API
    const { count } = await supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact', head: true })
      .eq('chat_id', chat.id);

    if (!count || count === 0) {
      await syncMessages(chat);
    }
  }, [loadMessages, syncMessages]);

  // Create lead from chat with user-confirmed data
  const createLeadFromChat = useCallback(async (chat: WhatsAppChat, leadFormData: {
    nome: string;
    telefone: string;
    servico: string;
    fonte: string;
    temperatura: string;
    etapa: string;
    procedimento_interesse: string;
    angulo_oferta: string;
    etapa_jornada: string;
    anotacoes: string;
    data_consulta?: string;
  }) => {
    if (!activeBusiness) return;
    try {
      const { data: lead, error } = await supabase
        .from('leads')
        .insert({
          business_id: activeBusiness.id,
          nome: leadFormData.nome,
          telefone: leadFormData.telefone,
          fonte: leadFormData.fonte,
          etapa: leadFormData.etapa,
          temperatura: leadFormData.temperatura,
          servico: leadFormData.servico,
          procedimento_interesse: leadFormData.procedimento_interesse,
          angulo_oferta: leadFormData.angulo_oferta,
          etapa_jornada: leadFormData.etapa_jornada,
          anotacoes: leadFormData.anotacoes || null,
          data_consulta: leadFormData.data_consulta ? new Date(leadFormData.data_consulta).toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;

      // Link chat to lead and update contact name
      await supabase
        .from('whatsapp_chats')
        .update({ 
          lead_id: lead.id,
          contact_name: leadFormData.nome 
        })
        .eq('id', chat.id);

      // Update local state
      setChats(prev => prev.map(c => c.id === chat.id ? { ...c, lead_id: lead.id, contact_name: leadFormData.nome } : c));
      setActiveChat(prev => prev?.id === chat.id ? { ...prev, lead_id: lead.id, contact_name: leadFormData.nome } : prev);

      toast.success(`Lead "${leadFormData.nome}" criado no pipeline!`);
      return lead;
    } catch (err) {
      console.error('Erro ao criar lead:', err);
      toast.error('Erro ao criar lead');
      throw err;
    }
  }, [activeBusiness]);

  // Disconnect WhatsApp
  const disconnect = useCallback(async () => {
    if (!instance) return;
    try {
      await evoApi.logoutInstance(instance.instance_name);
      setConnectionStatus('disconnected');
      setQrCode(null);
      
      await supabase
        .from('whatsapp_instances')
        .update({ status: 'disconnected' })
        .eq('id', instance.id);
      
      toast.success('WhatsApp desconectado');
    } catch (err) {
      console.error('Erro ao desconectar:', err);
    }
  }, [instance]);

  // Periodic chat polling (every 15s for new messages)
  useEffect(() => {
    if (connectionStatus === 'open' && instance) {
      chatPollingRef.current = setInterval(() => {
        syncChats(instance.instance_name);
      }, 15000);
    }

    return () => {
      if (chatPollingRef.current) clearInterval(chatPollingRef.current);
    };
  }, [connectionStatus, instance, syncChats]);

  // Realtime subscription for chats
  useEffect(() => {
    if (!activeBusiness) return;

    const channel = supabase
      .channel('whatsapp-chats-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'whatsapp_chats',
        filter: `business_id=eq.${activeBusiness.id}`,
      }, () => {
        loadChats();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeBusiness, loadChats]);

  // Realtime subscription for messages
  useEffect(() => {
    if (!activeChat) return;

    const channel = supabase
      .channel('whatsapp-messages-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'whatsapp_messages',
        filter: `chat_id=eq.${activeChat.id}`,
      }, (payload) => {
        setMessages(prev => {
          const exists = prev.some(m => m.id === payload.new.id);
          if (exists) return prev;
          return [...prev, payload.new as WhatsAppMessage];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeChat]);

  // Initialize
  useEffect(() => {
    loadInstance();
  }, [loadInstance]);

  useEffect(() => {
    if (instance && connectionStatus === 'open') {
      loadChats();
    }
  }, [instance, connectionStatus, loadChats]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (chatPollingRef.current) clearInterval(chatPollingRef.current);
    };
  }, []);

  return {
    instance,
    chats,
    activeChat,
    messages,
    loading,
    loadingMessages,
    connectionStatus,
    qrCode,
    unreadTotal,
    setupInstance,
    reconnect,
    disconnect,
    selectChat,
    sendMessage,
    createLeadFromChat,
    syncChats: () => instance ? syncChats(instance.instance_name) : null,
    syncMessages: () => activeChat ? syncMessages(activeChat) : null,
    loadChats,
  };
}

// Helper
function getMediaType(message: any): string {
  if (!message) return 'text';
  if (message.imageMessage) return 'image';
  if (message.audioMessage) return 'audio';
  if (message.videoMessage) return 'video';
  if (message.documentMessage) return 'document';
  if (message.stickerMessage) return 'sticker';
  return 'text';
}

function getMimeType(mediaType: string): string {
  switch (mediaType) {
    case 'image': return 'image/jpeg';
    case 'audio': return 'audio/ogg';
    case 'video': return 'video/mp4';
    case 'document': return 'application/pdf';
    case 'sticker': return 'image/webp';
    default: return 'application/octet-stream';
  }
}
