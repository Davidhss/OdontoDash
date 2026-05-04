import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Smile } from 'lucide-react';

interface MessageInputProps {
  onSend: (text: string) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend }) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setText('');
    
    try {
      await onSend(trimmed);
    } catch (err) {
      setText(trimmed); // Restore on error
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 py-3 border-t border-border-card bg-background-card">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem..."
            rows={1}
            className="w-full px-4 py-2.5 bg-background-app border border-border-card rounded-2xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-emerald-500/50 resize-none transition-colors pr-10"
            style={{ maxHeight: '120px' }}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
            text.trim()
              ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
              : 'bg-background-app text-text-tertiary border border-border-card'
          } disabled:opacity-50`}
        >
          <Send size={16} className={text.trim() ? 'translate-x-[1px]' : ''} />
        </motion.button>
      </div>

      <p className="text-[10px] text-text-tertiary mt-1.5 ml-1">
        Enter para enviar • Shift+Enter para nova linha
      </p>
    </div>
  );
};
