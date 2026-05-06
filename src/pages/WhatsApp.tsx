import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Wifi, WifiOff, RefreshCw, LogOut, Search, Users, Bell, BellOff, Target, ChevronLeft } from 'lucide-react';
import { useWhatsApp } from '../hooks/useWhatsApp';
import { WhatsAppSetup } from '../components/whatsapp/WhatsAppSetup';
import { ChatList } from '../components/whatsapp/ChatList';
import { ChatMessages } from '../components/whatsapp/ChatMessages';
import { MessageInput } from '../components/whatsapp/MessageInput';
import { ModalCriarLeadWhatsApp, LeadFormData } from '../components/whatsapp/ModalCriarLeadWhatsApp';
import { LeadPanel } from '../components/whatsapp/LeadPanel';
import { cn } from '../lib/utils';

const WhatsApp: React.FC = () => {
  const {
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
    syncChats,
    syncMessages,
    loadChats,
    registerWebhook,
  } = useWhatsApp();


  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateLeadModal, setShowCreateLeadModal] = useState(false);
  const [showLeadPanel, setShowLeadPanel] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw className="w-8 h-8 text-emerald-500" />
        </motion.div>
      </div>
    );
  }

  // Show setup if no instance or disconnected
  if (!instance || connectionStatus === 'disconnected') {
    return (
      <WhatsAppSetup
        onSetup={setupInstance}
        onReconnect={reconnect}
        instance={instance}
        qrCode={qrCode}
        connectionStatus={connectionStatus}
        onRegisterWebhook={registerWebhook}
      />

    );
  }

  // Show QR code if connecting
  if (connectionStatus === 'connecting' && qrCode) {
    return (
      <WhatsAppSetup
        onSetup={setupInstance}
        onReconnect={reconnect}
        instance={instance}
        qrCode={qrCode}
        connectionStatus={connectionStatus}
        onRegisterWebhook={registerWebhook}
      />

    );
  }

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      chat.contact_name?.toLowerCase().includes(q) ||
      chat.contact_phone?.includes(q)
    );
  });

  const handleCreateLeadSubmit = async (leadFormData: LeadFormData) => {
    if (!activeChat) return;
    await createLeadFromChat(activeChat, leadFormData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-120px)] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
            <MessageCircle size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">WhatsApp</h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connectionStatus === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-xs text-text-secondary font-medium">
                {connectionStatus === 'open' ? 'Conectado' : 'Desconectado'}
              </span>
              {unreadTotal > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                  {unreadTotal} não lida{unreadTotal > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => syncChats()}
            className="p-2.5 rounded-xl bg-background-card border border-border-card hover:border-emerald-500/50 transition-all text-text-secondary hover:text-emerald-500"
            title="Sincronizar conversas"
          >
            <RefreshCw size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={disconnect}
            className="p-2.5 rounded-xl bg-background-card border border-border-card hover:border-red-500/50 transition-all text-text-secondary hover:text-red-500"
            title="Desconectar WhatsApp"
          >
            <LogOut size={16} />
          </motion.button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col md:flex-row rounded-2xl border border-border-card overflow-hidden bg-background-card shadow-xl shadow-black/5 relative">
        {/* Chat List Panel */}
        <div className={cn(
          "w-full md:w-[320px] lg:w-[380px] border-r border-border-card flex flex-col bg-background-card transition-all duration-300",
          activeChat ? "hidden md:flex" : "flex"
        )}>
          {/* Search */}
          <div className="p-4 border-b border-border-card bg-background-card/50 backdrop-blur-md sticky top-0 z-10">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input
                type="text"
                placeholder="Buscar conversa ou número..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background-app/50 border border-border-card rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          {/* Chat List */}
          <ChatList
            chats={filteredChats}
            activeChat={activeChat}
            onSelectChat={(chat) => {
              selectChat(chat);
              setShowLeadPanel(false);
            }}
          />
        </div>

        {/* Messages Panel */}
        <div className={cn(
          "flex-1 flex flex-col min-w-0 bg-background-app/30 relative",
          !activeChat ? "hidden md:flex" : "flex"
        )}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-border-card flex items-center justify-between bg-background-card/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3 md:gap-4">
                  {/* Mobile Back Button */}
                  <button 
                    onClick={() => selectChat(null as any)}
                    className="md:hidden p-2 -ml-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border-card/50 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  {activeChat.profile_pic_url ? (
                    <img
                      src={activeChat.profile_pic_url}
                      alt={activeChat.contact_name || ''}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                      {(activeChat.contact_name || '?')[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-text-primary text-sm">
                      {activeChat.contact_name || activeChat.contact_phone}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {activeChat.contact_phone ? `+${activeChat.contact_phone}` : activeChat.remote_jid}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!activeChat.lead_id && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowCreateLeadModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
                    >
                      + Criar Lead
                    </motion.button>
                  )}
                  {activeChat.lead_id && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowLeadPanel(!showLeadPanel)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                        showLeadPanel
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25'
                          : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                      }`}
                    >
                      <Target size={12} />
                      {showLeadPanel ? 'Fechar Lead' : 'Gerenciar Lead'}
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => syncMessages()}
                    className="p-2 rounded-lg hover:bg-background-app transition-colors text-text-secondary"
                    title="Atualizar mensagens"
                  >
                    <RefreshCw size={14} />
                  </motion.button>
                </div>
              </div>

              {/* Messages + Optional Lead Panel */}
              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex flex-col">
                  {/* Messages */}
                  <ChatMessages
                    messages={messages}
                    loading={loadingMessages}
                  />

                  {/* Input */}
                  <MessageInput onSend={sendMessage} />
                </div>

                {/* Lead Side Panel */}
                <AnimatePresence>
                  {showLeadPanel && activeChat.lead_id && (
                    <LeadPanel
                      leadId={activeChat.lead_id}
                      onClose={() => setShowLeadPanel(false)}
                      onUpdated={() => loadChats()}
                    />
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-tertiary">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-green-600/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-emerald-500/50" />
                </div>
                <p className="text-lg font-semibold text-text-secondary mb-1">Selecione uma conversa</p>
                <p className="text-sm">Escolha um contato ao lado para ver as mensagens</p>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Create Lead Modal */}
      <ModalCriarLeadWhatsApp
        isOpen={showCreateLeadModal}
        onClose={() => setShowCreateLeadModal(false)}
        onSubmit={handleCreateLeadSubmit}
        initialName={activeChat?.contact_name || ''}
        initialPhone={activeChat?.contact_phone || ''}
      />
    </motion.div>
  );
};

export default WhatsApp;
