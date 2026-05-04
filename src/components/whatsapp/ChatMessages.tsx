import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Loader2, Check, CheckCheck, Image, Mic, Video, FileText, Sticker } from 'lucide-react';

interface WhatsAppMessage {
  id: string;
  from_me: boolean;
  content: string | null;
  media_type: string;
  timestamp: string;
  status: string;
}

interface ChatMessagesProps {
  messages: WhatsAppMessage[];
  loading: boolean;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, loading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-text-tertiary">Nenhuma mensagem carregada. Clique em ↻ para sincronizar.</p>
      </div>
    );
  }

  // Group messages by day
  const groupedMessages = groupByDay(messages);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-5 py-4 space-y-1 bg-background-app/50"
      style={{
        backgroundImage: `radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.03) 0%, transparent 50%), 
                          radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.02) 0%, transparent 50%)`,
      }}
    >
      {groupedMessages.map(({ date, msgs }, groupIndex) => (
        <div key={date} className="space-y-1">
          {/* Date Separator */}
          <div className="flex items-center justify-center my-4">
            <span className="px-3 py-1 rounded-lg bg-background-card border border-border-card text-[10px] font-semibold text-text-tertiary uppercase tracking-wider shadow-sm">
              {formatDateLabel(date)}
            </span>
          </div>

          {/* Messages */}
          {msgs.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: Math.min(index * 0.02, 0.5) }}
              className={`flex ${msg.from_me ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[65%] px-3.5 py-2 rounded-2xl relative group ${
                  msg.from_me
                    ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-tr-sm shadow-lg shadow-emerald-500/10'
                    : 'bg-background-card border border-border-card text-text-primary rounded-tl-sm shadow-sm'
                }`}
              >
                {/* Media Type Icon */}
                {msg.media_type !== 'text' && (
                  <div className={`flex items-center gap-1.5 text-xs mb-1 ${msg.from_me ? 'text-white/70' : 'text-text-tertiary'}`}>
                    {getMediaIcon(msg.media_type)}
                    <span>{getMediaLabel(msg.media_type)}</span>
                  </div>
                )}

                {/* Content */}
                {msg.content && (
                  <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                )}

                {/* Time + Status */}
                <div className={`flex items-center gap-1 mt-1 ${msg.from_me ? 'justify-end' : 'justify-start'}`}>
                  <span className={`text-[10px] ${msg.from_me ? 'text-white/60' : 'text-text-tertiary'}`}>
                    {formatMessageTime(msg.timestamp)}
                  </span>
                  {msg.from_me && (
                    <span className="text-white/60">
                      {getStatusIcon(msg.status)}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

// Helpers
function groupByDay(messages: WhatsAppMessage[]) {
  const groups: { date: string; msgs: WhatsAppMessage[] }[] = [];
  let currentDate = '';

  for (const msg of messages) {
    const date = new Date(msg.timestamp).toDateString();
    if (date !== currentDate) {
      currentDate = date;
      groups.push({ date, msgs: [msg] });
    } else {
      groups[groups.length - 1].msgs.push(msg);
    }
  }

  return groups;
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Hoje';
  if (date.toDateString() === yesterday.toDateString()) return 'Ontem';

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

function formatMessageTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'PENDING': return <Loader2 size={10} className="animate-spin" />;
    case 'SENT':
    case 'SERVER_ACK': return <Check size={10} />;
    case 'DELIVERY_ACK': return <CheckCheck size={10} />;
    case 'READ': return <CheckCheck size={10} className="text-blue-300" />;
    default: return <Check size={10} />;
  }
}

function getMediaIcon(type: string) {
  switch (type) {
    case 'image': return <Image size={12} />;
    case 'audio': return <Mic size={12} />;
    case 'video': return <Video size={12} />;
    case 'document': return <FileText size={12} />;
    case 'sticker': return <Sticker size={12} />;
    default: return null;
  }
}

function getMediaLabel(type: string): string {
  switch (type) {
    case 'image': return 'Imagem';
    case 'audio': return 'Áudio';
    case 'video': return 'Vídeo';
    case 'document': return 'Documento';
    case 'sticker': return 'Figurinha';
    default: return '';
  }
}
