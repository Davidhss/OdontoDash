import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Save, Image as ImageIcon, Link as LinkIcon, DollarSign, Target, Tag, MousePointer2 } from 'lucide-react';
import { TesteCriativo, FormatoCriativo, StatusCriativo } from '../../types';

interface ModalTesteCriativoProps {
  onClose: () => void;
  onSave: (data: Partial<TesteCriativo>) => Promise<void>;
  teste: TesteCriativo | null;
}

export const ModalTesteCriativo: React.FC<ModalTesteCriativoProps> = ({ onClose, onSave, teste }) => {
  const [formData, setFormData] = useState({
    nome: '',
    servico_foco: 'Implante',
    verba_diaria: 0,
    investimento_total: 0,
    leads_gerados: 0,
    mqls_gerados: 0,
    formato: 'Estático' as FormatoCriativo,
    status: 'Ativo' as StatusCriativo,
    imagem_url: '',
    tags: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (teste) {
      setFormData({
        nome: teste.nome,
        servico_foco: teste.servico_foco,
        verba_diaria: teste.verba_diaria,
        investimento_total: teste.investimento_total,
        leads_gerados: teste.leads_gerados,
        mqls_gerados: teste.mqls_gerados,
        formato: teste.formato,
        status: teste.status,
        imagem_url: teste.imagem_url || '',
        tags: (teste.tags || []).join(', ')
      });
    }
  }, [teste]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Process tags
    const tagsArray = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    await onSave({
      ...formData,
      tags: tagsArray
    });
    
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background-app/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-background-card border border-border-card rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-border-card bg-background-sidebar/50">
          <h2 className="text-xl font-bold text-text-primary">
            {teste ? 'Editar Teste de Criativo' : 'Novo Teste de Criativo'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-text-tertiary hover:text-text-primary hover:bg-background-app rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="teste-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Seção 1: Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-2">
                <Target size={14} className="text-accent-primary" /> Info Básica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-tertiary uppercase">Nome do Criativo</label>
                  <input 
                    type="text"
                    required
                    value={formData.nome}
                    onChange={e => setFormData({...formData, nome: e.target.value})}
                    placeholder="Ex: Vídeo Depoimento João"
                    className="w-full bg-background-app border border-border-card rounded-xl px-4 py-2.5 text-sm focus:border-accent-primary outline-none"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-tertiary uppercase">Serviço Foco</label>
                  <select
                    value={formData.servico_foco}
                    onChange={e => setFormData({...formData, servico_foco: e.target.value})}
                    className="w-full bg-background-app border border-border-card rounded-xl px-4 py-2.5 text-sm focus:border-accent-primary outline-none"
                  >
                    <option value="Implante">Implante</option>
                    <option value="Prótese">Prótese</option>
                    <option value="Protocolo">Protocolo</option>
                    <option value="Facetas">Facetas</option>
                    <option value="Clareamento">Clareamento</option>
                    <option value="Ortodontia">Ortodontia</option>
                    <option value="Avaliação">Avaliação</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-tertiary uppercase">Formato</label>
                  <select
                    value={formData.formato}
                    onChange={e => setFormData({...formData, formato: e.target.value as FormatoCriativo})}
                    className="w-full bg-background-app border border-border-card rounded-xl px-4 py-2.5 text-sm focus:border-accent-primary outline-none"
                  >
                    <option value="Estático">Estático</option>
                    <option value="Carrossel">Carrossel</option>
                    <option value="Vídeo">Vídeo</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-tertiary uppercase">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as StatusCriativo})}
                    className="w-full bg-background-app border border-border-card rounded-xl px-4 py-2.5 text-sm focus:border-accent-primary outline-none"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Pausado">Pausado</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Seção 2: Imagem/Link e Tags */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-2">
                <ImageIcon size={14} className="text-accent-secondary" /> Mídia & Organização
              </h3>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-tertiary uppercase">Link do Criativo (Imagem/Vídeo Drive)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon size={14} className="text-text-tertiary" />
                  </div>
                  <input 
                    type="url"
                    value={formData.imagem_url}
                    onChange={e => setFormData({...formData, imagem_url: e.target.value})}
                    placeholder="https://..."
                    className="w-full bg-background-app border border-border-card rounded-xl pl-9 pr-4 py-2.5 text-sm focus:border-accent-primary outline-none"
                  />
                </div>
                <p className="text-[10px] text-text-tertiary mt-1">Isso ajuda a identificar o criativo visualmente. Cole o link da imagem.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-tertiary uppercase">Tags (separadas por vírgula)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag size={14} className="text-text-tertiary" />
                  </div>
                  <input 
                    type="text"
                    value={formData.tags}
                    onChange={e => setFormData({...formData, tags: e.target.value})}
                    placeholder="Ex: Quente, Mulheres 30+, Teste A"
                    className="w-full bg-background-app border border-border-card rounded-xl pl-9 pr-4 py-2.5 text-sm focus:border-accent-primary outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Seção 3: Métricas (Para atualização) */}
            <div className="space-y-4 p-4 rounded-xl bg-background-app/50 border border-border-card/50">
              <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-2">
                <DollarSign size={14} className="text-emerald-500" /> Resultados (Atualize Diariamente)
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-tertiary uppercase">Verba Diária (R$)</label>
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.verba_diaria}
                    onChange={e => setFormData({...formData, verba_diaria: Number(e.target.value)})}
                    className="w-full bg-background-sidebar border border-border-card rounded-xl px-3 py-2 text-sm focus:border-accent-primary outline-none"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-accent-alert uppercase">Gasto Total (R$)</label>
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.investimento_total}
                    onChange={e => setFormData({...formData, investimento_total: Number(e.target.value)})}
                    className="w-full bg-background-sidebar border border-border-card rounded-xl px-3 py-2 text-sm focus:border-accent-primary outline-none text-accent-alert font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-tertiary uppercase flex items-center gap-1">
                    <MousePointer2 size={10} /> Leads
                  </label>
                  <input 
                    type="number"
                    min="0"
                    value={formData.leads_gerados}
                    onChange={e => setFormData({...formData, leads_gerados: Number(e.target.value)})}
                    className="w-full bg-background-sidebar border border-border-card rounded-xl px-3 py-2 text-sm focus:border-accent-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                    <Target size={10} /> MQLs
                  </label>
                  <input 
                    type="number"
                    min="0"
                    value={formData.mqls_gerados}
                    onChange={e => setFormData({...formData, mqls_gerados: Number(e.target.value)})}
                    className="w-full bg-background-sidebar border border-border-card rounded-xl px-3 py-2 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
            
          </form>
        </div>

        <div className="p-6 border-t border-border-card bg-background-sidebar/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-text-secondary hover:text-text-primary hover:bg-background-app transition-colors"
          >
            Cancelar
          </button>
          <button
            form="teste-form"
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-50 transition-colors shadow-lg shadow-accent-primary/20"
          >
            <Save size={16} />
            {isSaving ? 'Salvando...' : 'Salvar Criativo'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
