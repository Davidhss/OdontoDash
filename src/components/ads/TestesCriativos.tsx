import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { useCriativos } from '../../hooks/useCriativos';
import { TesteCriativo } from '../../types';
import { Plus, Link as LinkIcon, Trash2, Edit3, Image as ImageIcon } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { ModalTesteCriativo } from './ModalTesteCriativo';

export const TestesCriativos: React.FC = () => {
  const { criativos, loading, deleteCriativo, updateCriativo, createCriativo } = useCriativos();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeste, setEditingTeste] = useState<TesteCriativo | null>(null);

  const handleOpenModal = (teste?: TesteCriativo) => {
    setEditingTeste(teste || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeste(null);
  };

  if (loading && criativos.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-text-primary uppercase tracking-wider text-sm">Testes de Criativos</h3>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-accent-primary/20"
        >
          <Plus size={16} /> Novo Teste
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {criativos.length === 0 ? (
          <div className="col-span-full py-12 text-center text-text-tertiary glass-card rounded-2xl border border-dashed border-border-card/50">
            Nenhum teste de criativo cadastrado ainda.
          </div>
        ) : (
          criativos.map((teste) => {
            const cpl = teste.leads_gerados > 0 ? teste.investimento_total / teste.leads_gerados : 0;
            const custoMql = teste.mqls_gerados > 0 ? teste.investimento_total / teste.mqls_gerados : 0;

            return (
              <div key={teste.id} className="glass-card rounded-2xl overflow-hidden flex flex-col group">
                {/* Header Image */}
                <div className="h-32 bg-background-sidebar relative flex items-center justify-center overflow-hidden border-b border-border-card/50">
                  {teste.imagem_url ? (
                    <img src={teste.imagem_url} alt={teste.nome} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <ImageIcon size={32} className="text-text-tertiary/30" />
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <span className={cn(
                      "px-2 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider backdrop-blur-md",
                      teste.status === 'Ativo' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : 
                      teste.status === 'Pausado' ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : 
                      "bg-text-tertiary/20 text-text-secondary border border-border-card"
                    )}>
                      {teste.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h4 className="text-lg font-bold text-text-primary line-clamp-1">{teste.nome}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{teste.formato}</Badge>
                      <span className="text-xs text-text-tertiary">{teste.servico_foco}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 flex-1">
                    <div>
                      <p className="text-[10px] text-text-tertiary font-bold uppercase">Verba Diária</p>
                      <p className="text-sm font-bold text-text-primary">{formatCurrency(teste.verba_diaria)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-tertiary font-bold uppercase">Gasto Total</p>
                      <p className="text-sm font-bold text-accent-alert">{formatCurrency(teste.investimento_total)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-tertiary font-bold uppercase">CPL Médio</p>
                      <p className="text-sm font-bold text-accent-secondary">{cpl > 0 ? formatCurrency(cpl) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-tertiary font-bold uppercase">Custo / MQL</p>
                      <p className="text-sm font-bold text-emerald-400">{custoMql > 0 ? formatCurrency(custoMql) : '-'}</p>
                    </div>
                  </div>

                  {/* Footer Stats */}
                  <div className="flex items-center justify-between py-3 border-t border-border-card/50">
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-text-tertiary text-xs mr-1">Leads:</span>
                        <span className="font-bold text-text-primary">{teste.leads_gerados}</span>
                      </div>
                      <div>
                        <span className="text-text-tertiary text-xs mr-1">MQLs:</span>
                        <span className="font-bold text-text-primary">{teste.mqls_gerados}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleOpenModal(teste)}
                        className="p-1.5 text-text-tertiary hover:text-accent-primary transition-colors rounded-lg hover:bg-background-sidebar"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja excluir este teste de criativo?')) {
                            deleteCriativo(teste.id);
                          }
                        }}
                        className="p-1.5 text-text-tertiary hover:text-danger transition-colors rounded-lg hover:bg-danger/10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  {(teste.tags || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(teste.tags || []).map((tag, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-background-app text-text-tertiary border border-border-card/50">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <ModalTesteCriativo 
            onClose={handleCloseModal}
            teste={editingTeste}
            onSave={async (data) => {
              if (editingTeste) {
                await updateCriativo(editingTeste.id, data);
              } else {
                await createCriativo(data as any);
              }
              handleCloseModal();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
