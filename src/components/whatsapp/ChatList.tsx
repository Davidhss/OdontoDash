import React from 'react';
import { motion } from 'motion/react';
import { formatDistanceToNow } from '../../lib/dateUtils';
import { formatPhoneDisplay } from '../../lib/evolutionApi';

interface WhatsAppChat {
  id: string;
  contact_name: string | null;
  contact_phone: string | null;
  profile_pic_url: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  lead_id: string | null;
  remote_jid: string;
}

interface ChatListProps {
  chats: WhatsAppChat[];
  activeChat: WhatsAppChat | null;
  onSelectChat: (chat: WhatsAppChat) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ chats, activeChat, onSelectChat }) => {
  if (chats.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3">
          <span className="text-2xl">💬</span>
        </div>
        <p className="text-sm font-semibold text-text-secondary">Nenhuma conversa ainda</p>
        <p className="text-xs text-text-tertiary mt-1">As conversas aparecerão aqui quando chegarem mensagens</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      {chats.map((chat, index) => {
        const isActive = activeChat?.id === chat.id;
        const displayName = chat.contact_name || (chat.contact_phone ? formatPhoneDisplay(chat.contact_phone) : 'Desconhecido');
        const initial = displayName[0]?.toUpperCase();

        return (
          <motion.button
            key={chat.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onSelectChat(chat)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-border-card/50 hover:bg-emerald-500/5 ${
              isActive ? 'bg-emerald-500/10 border-l-2 border-l-emerald-500' : ''
            }`}
          >
            {/* Avatar */}
            {chat.profile_pic_url ? (
              <img 
                src={chat.profile_pic_url} 
                alt={displayName} 
                className={`w-11 h-11 rounded-full object-cover flex-shrink-0 ${
                  isActive ? 'shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-500/50' : ''
                }`}
              />
            ) : (
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                isActive
                  ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25'
                  : 'bg-gradient-to-br from-gray-400 to-gray-500'
              }`}>
                {initial}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className={`text-sm font-semibold truncate ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-text-primary'}`}>
                  {displayName}
                </p>
                {chat.last_message_at && (
                  <span className="text-[10px] text-text-tertiary font-medium flex-shrink-0 ml-2">
                    {formatTimeAgo(chat.last_message_at)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-text-tertiary truncate max-w-[200px]">
                  {chat.last_message || 'Sem mensagens'}
                </p>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  {chat.lead_id && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Lead vinculado" />
                  )}
                  {chat.unread_count > 0 && (
                    <span className="min-w-[18px] h-[18px] rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                      {chat.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

function formatTimeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Agora';
    if (diffMin < 60) return `${diffMin}min`;
    if (diffHr < 24) return `${diffHr}h`;
    if (diffDay === 1) return 'Ontem';
    if (diffDay < 7) return `${diffDay}d`;
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch {
    return '';
  }
}
