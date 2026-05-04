import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useCriativos } from '../../hooks/useCriativos';
import { TesteCriativo } from '../../types';
import { Plus, Trash2, Edit3, Image as ImageIcon, ArrowUpDown, Search, Filter } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { ModalTesteCriativo } from './ModalTesteCriativo';

type SortField = 'nome' | 'status' | 'verba_diaria' | 'investimento_total' | 'leads_gerados' | 'mqls_gerados' | 'cpl' | 'custo_mql';
type SortOrder = 'asc' | 'desc';

export const TestesCriativos: React.FC = () => {
  const { criativos, loading, deleteCriativo, updateCriativo, createCriativo } = useCriativos();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeste, setEditingTeste] = useState<TesteCriativo | null>(null);
  
  const [sortField, setSortField] = useState<SortField>('nome');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenModal = (teste?: TesteCriativo) => {
    setEditingTeste(teste || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeste(null);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to descending for new fields
    }
  };

  const filteredAndSortedCriativos = useMemo(() => {
    let result = [...criativos];

    // Filter by status
    if (filterStatus !== 'Todos') {
      result = result.filter(c => c.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.nome.toLowerCase().includes(lowerQuery) || 
        c.servico_foco.toLowerCase().includes(lowerQuery) ||
        (c.tags && c.tags.some(t => t.toLowerCase().includes(lowerQuery)))
      );
    }

    // Sort
    result.sort((a, b) => {
      let aValue: any = a[sortField as keyof TesteCriativo];
      let bValue: any = b[sortField as keyof TesteCriativo];

      if (sortField === 'cpl') {
        aValue = a.leads_gerados > 0 ? a.investimento_total / a.leads_gerados : 0;
        bValue = b.leads_gerados > 0 ? b.investimento_total / b.leads_gerados : 0;
      } else if (sortField === 'custo_mql') {
        aValue = a.mqls_gerados > 0 ? a.investimento_total / a.mqls_gerados : 0;
        bValue = b.mqls_gerados > 0 ? b.investimento_total / b.mqls_gerados : 0;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [criativos, sortField, sortOrder, filterStatus, searchQuery]);

  if (loading && criativos.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const SortIcon = ({ field }: { field: SortField }) => (
    <button 
      onClick={() => handleSort(field)} 
      className={cn(
        "ml-1 inline-flex p-0.5 rounded transition-colors",
        sortField === field ? "text-accent-primary bg-accent-primary/10" : "text-text-tertiary hover:text-text-primary hover:bg-background-app"
      )}
    >
      <ArrowUpDown size={12} />
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-text-primary uppercase tracking-wider text-sm">Testes de Criativos</h3>
          <p className="text-xs text-text-tertiary mt-1">Acompanhe a performance dos seus anúncios</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Buscar criativo..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-background-card border border-border-card rounded-xl text-sm focus:border-accent-primary outline-none w-full md:w-48"
            />
          </div>

          {/* Filter Status */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="pl-9 pr-4 py-2 bg-background-card border border-border-card rounded-xl text-sm focus:border-accent-primary outline-none appearance-none"
            >
              <option value="Todos">Todos</option>
              <option value="Ativo">Ativos</option>
              <option value="Pausado">Pausados</option>
              <option value="Concluído">Concluídos</option>
            </select>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-accent-primary/20 whitespace-nowrap"
          >
            <Plus size={16} /> Novo Teste
          </button>
        </div>
      </div>

      <div className="bg-background-card border border-border-card rounded-2xl overflow-hidden shadow-lg shadow-black/5">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background-sidebar/50 border-b border-border-card text-xs font-bold text-text-tertiary uppercase tracking-wider">
                <th className="p-4 w-12 text-center">Mídia</th>
                <th className="p-4 min-w-[200px]">
                  <div className="flex items-center">Nome <SortIcon field="nome" /></div>
                </th>
                <th className="p-4">Serviço/Formato</th>
                <th className="p-4">
                  <div className="flex items-center">Status <SortIcon field="status" /></div>
                </th>
                <th className="p-4">
                  <div className="flex items-center">Verba Diária <SortIcon field="verba_diaria" /></div>
                </th>
                <th className="p-4">
                  <div className="flex items-center">Gasto Total <SortIcon field="investimento_total" /></div>
                </th>
                <th className="p-4 text-center">
                  <div className="flex items-center justify-center">LDS / MQLs</div>
                </th>
                <th className="p-4">
                  <div className="flex items-center">CPL <SortIcon field="cpl" /></div>
                </th>
                <th className="p-4">
                  <div className="flex items-center">Custo/MQL <SortIcon field="custo_mql" /></div>
                </th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-card/50">
              {filteredAndSortedCriativos.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-text-tertiary">
                    Nenhum teste de criativo encontrado.
                  </td>
                </tr>
              ) : (
                filteredAndSortedCriativos.map((teste, i) => {
                  const cpl = teste.leads_gerados > 0 ? teste.investimento_total / teste.leads_gerados : 0;
                  const custoMql = teste.mqls_gerados > 0 ? teste.investimento_total / teste.mqls_gerados : 0;

                  return (
                    <motion.tr 
                      key={teste.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-background-sidebar/30 transition-colors group"
                    >
                      {/* Midia */}
                      <td className="p-4">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-background-app flex items-center justify-center border border-border-card flex-shrink-0">
                          {teste.imagem_url ? (
                            <img src={teste.imagem_url} alt="Midia" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={16} className="text-text-tertiary" />
                          )}
                        </div>
                      </td>

                      {/* Nome */}
                      <td className="p-4">
                        <div className="font-bold text-sm text-text-primary line-clamp-2">{teste.nome}</div>
                        {(teste.tags || []).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(teste.tags || []).slice(0, 2).map((tag, i) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-md bg-background-app text-text-tertiary border border-border-card/50 truncate max-w-[80px]">
                                #{tag}
                              </span>
                            ))}
                            {(teste.tags || []).length > 2 && (
                              <span className="text-[9px] text-text-tertiary">+{teste.tags!.length - 2}</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Serviço & Formato */}
                      <td className="p-4">
                        <div className="text-sm font-medium text-text-primary">{teste.servico_foco}</div>
                        <div className="text-xs text-text-tertiary mt-0.5">{teste.formato}</div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={cn(
                          "px-2 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider inline-flex items-center gap-1.5",
                          teste.status === 'Ativo' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : 
                          teste.status === 'Pausado' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : 
                          "bg-text-tertiary/10 text-text-secondary border border-border-card"
                        )}>
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            teste.status === 'Ativo' ? "bg-emerald-500 animate-pulse" : 
                            teste.status === 'Pausado' ? "bg-amber-500" : 
                            "bg-text-tertiary"
                          )} />
                          {teste.status}
                        </span>
                      </td>

                      {/* Verba */}
                      <td className="p-4 text-sm font-medium text-text-secondary">
                        {formatCurrency(teste.verba_diaria)}<span className="text-[10px] text-text-tertiary ml-1">/dia</span>
                      </td>

                      {/* Investimento Total */}
                      <td className="p-4 text-sm font-bold text-accent-alert">
                        {formatCurrency(teste.investimento_total)}
                      </td>

                      {/* Leads / MQLs */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-sm">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-text-primary">{teste.leads_gerados}</span>
                          </div>
                          <span className="text-text-tertiary">/</span>
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-emerald-500">{teste.mqls_gerados}</span>
                          </div>
                        </div>
                      </td>

                      {/* CPL */}
                      <td className="p-4 text-sm font-bold text-text-primary">
                        {cpl > 0 ? formatCurrency(cpl) : '-'}
                      </td>

                      {/* Custo/MQL */}
                      <td className="p-4 text-sm font-bold text-emerald-500">
                        {custoMql > 0 ? formatCurrency(custoMql) : '-'}
                      </td>

                      {/* Ações */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenModal(teste)}
                            className="p-1.5 text-text-tertiary hover:text-accent-primary transition-colors rounded-lg hover:bg-background-app"
                            title="Editar Teste"
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
                            title="Excluir Teste"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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
