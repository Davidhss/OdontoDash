import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Smartphone, QrCode, Loader2, Wifi, CheckCircle2 } from 'lucide-react';

interface WhatsAppSetupProps {
  onSetup: (instanceName: string) => void;
  onReconnect: () => void;
  instance: any;
  qrCode: string | null;
  connectionStatus: 'disconnected' | 'connecting' | 'open';
  onRegisterWebhook: () => void;
}


export const WhatsAppSetup: React.FC<WhatsAppSetupProps> = ({
  onSetup,
  onReconnect,
  instance,
  qrCode,
  connectionStatus,
  onRegisterWebhook,
}) => {

  const [instanceName, setInstanceName] = useState('odontoprime');
  const [step, setStep] = useState<'setup' | 'qrcode'>(instance ? 'qrcode' : 'setup');

  const handleSetup = () => {
    if (!instanceName.trim()) return;
    onSetup(instanceName.trim());
    setStep('qrcode');
  };

  const handleReconnect = () => {
    onReconnect();
    setStep('qrcode');
  };

  return (
    <div className="flex items-center justify-center h-[calc(100vh-120px)]">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-lg"
      >
        <div className="bg-background-card border border-border-card rounded-3xl p-8 shadow-xl shadow-black/5">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-emerald-500/25"
            >
              <MessageCircle size={32} />
            </motion.div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              {step === 'setup' ? 'Conectar WhatsApp' : 'Escaneie o QR Code'}
            </h2>
            <p className="text-text-secondary text-sm">
              {step === 'setup'
                ? 'Vincule o WhatsApp da clínica ao Blent Dashboard'
                : 'Abra o WhatsApp no celular e escaneie o código abaixo'}
            </p>
          </div>

          {/* Setup Step */}
          {step === 'setup' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <label className="text-sm font-semibold text-text-secondary mb-2 block">
                  Nome da instância
                </label>
                <input
                  type="text"
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value.replace(/\s/g, '').toLowerCase())}
                  placeholder="ex: odontoprime"
                  className="w-full px-4 py-3 bg-background-app border border-border-card rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                />
                <p className="text-xs text-text-tertiary mt-1.5">
                  Apenas letras minúsculas, sem espaços
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-3">Como funciona:</p>
                <div className="space-y-2.5">
                  {[
                    { icon: <Smartphone size={14} />, text: 'Um QR Code será gerado para você escanear' },
                    { icon: <QrCode size={14} />, text: 'Abra o WhatsApp > Dispositivos conectados > Conectar' },
                    { icon: <Wifi size={14} />, text: 'Após conectar, as mensagens chegam automaticamente aqui' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-text-secondary">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                        {item.icon}
                      </div>
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={instance ? handleReconnect : handleSetup}
                disabled={!instanceName.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {instance ? 'Reconectar WhatsApp' : 'Conectar WhatsApp'}
              </motion.button>
            </motion.div>
          )}

          {/* QR Code Step */}
          {step === 'qrcode' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {connectionStatus === 'connecting' && qrCode ? (
                <>
                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-2xl shadow-inner">
                      <img
                        src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                        alt="QR Code WhatsApp"
                        className="w-64 h-64"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                    <span>Aguardando leitura do QR Code...</span>
                  </div>
                </>
              ) : connectionStatus === 'open' ? (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                  >
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-lg font-bold text-emerald-500">Conectado com sucesso!</p>
                  <p className="text-sm text-text-secondary mt-1 mb-6">As mensagens já estão sendo sincronizadas</p>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onRegisterWebhook}
                    className="px-6 py-2.5 rounded-xl bg-background-app border border-emerald-500/30 text-emerald-500 font-semibold text-xs flex items-center gap-2 mx-auto"
                  >
                    <CheckCircle2 size={14} />
                    Ativar Tempo Real
                  </motion.button>
                </div>

              ) : (
                <div className="text-center py-8">
                  <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
                  <p className="text-sm text-text-secondary">Gerando QR Code...</p>
                </div>
              )}

              {connectionStatus !== 'open' && (
                <button
                  onClick={() => setStep('setup')}
                  className="w-full py-2.5 rounded-xl border border-border-card text-text-secondary text-sm font-medium hover:bg-background-app transition-colors"
                >
                  ← Voltar
                </button>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
