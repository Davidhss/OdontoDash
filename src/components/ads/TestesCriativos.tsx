import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useCriativos } from '../../hooks/useCriativos';
import { TesteCriativo, ObjetivoCampanha } from '../../types';
import { Plus, Trash2, Edit3, ArrowUpDown, Search, Filter, Eye, Users, Target, Megaphone, ShoppingCart, Percent, Database, MousePointer2, TrendingUp, Zap } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { ModalTesteCriativo } from './ModalTesteCriativo';

type SortField = 'nome' | 'status' | 'objetivo' | 'verba_diaria' | 'investimento_total' | 'metrica_principal' | 'resultados_dia';
type SortOrder = 'asc' | 'desc';

const OBJETIVO_CONFIG: Record<ObjetivoCampanha, { icon: React.ReactNode; color: string; badgeClass: string; metricaLabel: string }> = {
  'Captação de Leads': { 
    icon: <Target size={13} />, 
    color: 'text-blue-400', 
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    metricaLabel: 'CPL'
  },
  'Branding / Posicionamento': { 
    icon: <Megaphone size={13} />, 
    color: 'text-purple-400', 
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    metricaLabel: 'CPM'
  },
  'Engajamento / Seguidores': { 
    icon: <Users size={13} />, 
    color: 'text-pink-400', 
    badgeClass: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    metricaLabel: 'Custo/Eng.'
  },
  'Venda Direta': { 
    icon: <ShoppingCart size={13} />, 
    color: 'text-emerald-400', 
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    metricaLabel: 'ROAS'
  },
  'Oferta / Desconto': { 
    icon: <Percent size={13} />, 
    color: 'text-amber-400', 
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    metricaLabel: 'CPL'
  },
  'Coleta de Dados': { 
    icon: <Database size={13} />, 
    color: 'text-cyan-400', 
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    metricaLabel: 'Custo/Dado'
  },
};

function getMetricaPrincipal(teste: TesteCriativo): { value: number; label: string; formatted: string } {
  const obj = teste.objetivo;
  if (obj === 'Captação de Leads' || obj === 'Oferta / Desconto' || obj === 'Coleta de Dados') {
    const cpl = teste.leads_gerados > 0 ? teste.investimento_total / teste.leads_gerados : 0;
    return { value: cpl, label: 'CPL', formatted: cpl > 0 ? formatCurrency(cpl) : '-' };
  }
  if (obj === 'Branding / Posicionamento') {
    const cpm = teste.impressoes > 0 ? (teste.investimento_total / teste.impressoes) * 1000 : 0;
    return { value: cpm, label: 'CPM', formatted: cpm > 0 ? formatCurrency(cpm) : '-' };
  }
  if (obj === 'Engajamento / Seguidores') {
    const cpe = teste.engajamentos > 0 ? teste.investimento_total / teste.engajamentos : 0;
    return { value: cpe, label: 'Custo/Eng.', formatted: cpe > 0 ? formatCurrency(cpe) : '-' };
  }
  if (obj === 'Venda Direta') {
    const roas = teste.investimento_total > 0 ? teste.faturamento_gerado / teste.investimento_total : 0;
    return { value: roas, label: 'ROAS', formatted: roas > 0 ? `${roas.toFixed(1)}x` : '-' };
  }
  return { value: 0, label: '-', formatted: '-' };
}

function getSecondaryMetrics(teste: TesteCriativo): { label: string; value: string; color: string }[] {
  const obj = teste.objetivo;
  if (obj === 'Captação de Leads' || obj === 'Oferta / Desconto' || obj === 'Coleta de Dados') {
    return [
      { label: 'Leads', value: String(teste.leads_gerados), color: 'text-blue-400' },
      { label: 'MQLs', value: String(teste.mqls_gerados), color: 'text-emerald-400' },
    ];
  }
  if (obj === 'Branding / Posicionamento') {
    return [
      { label: 'Impressões', value: teste.impressoes.toLocaleString('pt-BR'), color: 'text-purple-400' },
      { label: 'Alcance', value: teste.alcance.toLocaleString('pt-BR'), color: 'text-indigo-400' },
    ];
  }
  if (obj === 'Engajamento / Seguidores') {
    return [
      { label: 'Engajam.', value: teste.engajamentos.toLocaleString('pt-BR'), color: 'text-pink-400' },
      { label: 'Alcance', value: teste.alcance.toLocaleString('pt-BR'), color: 'text-purple-400' },
    ];
  }
  if (obj === 'Venda Direta') {
    return [
      { label: 'Conversões', value: String(teste.conversoes), color: 'text-emerald-400' },
      { label: 'Faturamento', value: formatCurrency(teste.faturamento_gerado), color: 'text-emerald-400' },
    ];
  }
  return [];
}

export const TestesCriativos: React.FC = () => {
  const { criativos, loading, deleteCriativo, updateCriativo, createCriativo } = useCriativos();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeste, setEditingTeste] = useState<TesteCriativo | null>(null);
  
  const [sortField, setSortField] = useState<SortField>('nome');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [filterObjetivo, setFilterObjetivo] = useState<string>('Todos');
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
      setSortOrder('desc');
    }
  };

  const filteredAndSortedCriativos = useMemo(() => {
    let result = [...criativos];

    if (filterStatus !== 'Todos') {
      result = result.filter(c => c.status === filterStatus);
    }

    if (filterObjetivo !== 'Todos') {
      result = result.filter(c => c.objetivo === filterObjetivo);
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.nome.toLowerCase().includes(lowerQuery) || 
        c.servico_foco.toLowerCase().includes(lowerQuery) ||
        c.objetivo.toLowerCase().includes(lowerQuery) ||
        (c.tags && c.tags.some(t => t.toLowerCase().includes(lowerQuery)))
      );
    }

    result.sort((a, b) => {
      let aValue: any = a[sortField as keyof TesteCriativo];
      let bValue: any = b[sortField as keyof TesteCriativo];

      if (sortField === 'metrica_principal') {
        aValue = getMetricaPrincipal(a).value;
        bValue = getMetricaPrincipal(b).value;
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
  }, [criativos, sortField, sortOrder, filterStatus, filterObjetivo, searchQuery]);

  // Contadores de status
  const ativosCount = criativos.filter(c => c.status === 'Ativo').length;
  const pausadosCount = criativos.filter(c => c.status === 'Pausado').length;

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
      {/* Header com contadores */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-text-primary uppercase tracking-wider text-sm flex items-center gap-2">
            <Zap size={16} className="text-accent-primary" />
            Campanhas & Criativos
          </h3>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[11px] text-text-tertiary flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {ativosCount} ativas
            </span>
            <span className="text-[11px] text-text-tertiary flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {pausadosCount} pausadas
            </span>
            <span className="text-[11px] text-text-tertiary">
              {criativos.length} total
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Buscar campanha..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-background-card border border-border-card rounded-xl text-sm focus:border-accent-primary outline-none w-full md:w-48"
            />
          </div>

          {/* Filter Objetivo */}
          <div className="relative">
            <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <select
              value={filterObjetivo}
              onChange={e => setFilterObjetivo(e.target.value)}
              className="pl-9 pr-4 py-2 bg-background-card border border-border-card rounded-xl text-sm focus:border-accent-primary outline-none appearance-none"
            >
              <option value="Todos">Todos Objetivos</option>
              <option value="Captação de Leads">Captação de Leads</option>
              <option value="Branding / Posicionamento">Branding</option>
              <option value="Engajamento / Seguidores">Engajamento</option>
              <option value="Venda Direta">Venda Direta</option>
              <option value="Oferta / Desconto">Oferta / Desconto</option>
              <option value="Coleta de Dados">Coleta de Dados</option>
            </select>
          </div>

          {/* Filter Status */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="pl-9 pr-4 py-2 bg-background-card border border-border-card rounded-xl text-sm focus:border-accent-primary outline-none appearance-none"
            >
              <option value="Todos">Todos Status</option>
              <option value="Ativo">Ativos</option>
              <option value="Pausado">Pausados</option>
              <option value="Concluído">Concluídos</option>
            </select>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-accent-primary/20 whitespace-nowrap"
          >
            <Plus size={16} /> Nova Campanha
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-background-card border border-border-card rounded-2xl overflow-hidden shadow-lg shadow-black/5">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background-sidebar/50 border-b border-border-card text-xs font-bold text-text-tertiary uppercase tracking-wider">
                <th className="p-4 min-w-[200px]">
                  <div className="flex items-center">Campanha <SortIcon field="nome" /></div>
                </th>
                <th className="p-4">
                  <div className="flex items-center">Objetivo <SortIcon field="objetivo" /></div>
                </th>
                <th className="p-4">
                  <div className="flex items-center">Status <SortIcon field="status" /></div>
                </th>
                <th className="p-4">
                  <div className="flex items-center">Verba <SortIcon field="verba_diaria" /></div>
                </th>
                <th className="p-4">
                  <div className="flex items-center">Gasto <SortIcon field="investimento_total" /></div>
                </th>
                <th className="p-4">
                  <div className="flex items-center">Hoje <SortIcon field="resultados_dia" /></div>
                </th>
                <th className="p-4 text-center">Resultados</th>
                <th className="p-4">
                  <div className="flex items-center">KPI <SortIcon field="metrica_principal" /></div>
                </th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-card/50">
              {filteredAndSortedCriativos.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-text-tertiary">
                    Nenhuma campanha encontrada.
                  </td>
                </tr>
              ) : (
                filteredAndSortedCriativos.map((teste, i) => {
                  const metrica = getMetricaPrincipal(teste);
                  const secondary = getSecondaryMetrics(teste);
                  const objConfig = OBJETIVO_CONFIG[teste.objetivo] || OBJETIVO_CONFIG['Captação de Leads'];

                  return (
                    <motion.tr 
                      key={teste.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-background-sidebar/30 transition-colors group"
                    >
                      {/* Campanha */}
                      <td className="p-4">
                        <div className="font-bold text-sm text-text-primary line-clamp-1">{teste.nome}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-text-tertiary">{teste.servico_foco}</span>
                          <span className="text-[10px] text-text-tertiary">•</span>
                          <span className="text-[10px] text-text-tertiary">{teste.formato}</span>
                        </div>
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

                      {/* Objetivo */}
                      <td className="p-4">
                        <span className={cn(
                          "px-2.5 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider inline-flex items-center gap-1.5 border whitespace-nowrap",
                          objConfig.badgeClass
                        )}>
                          {objConfig.icon}
                          {teste.objetivo.split(' / ')[0].replace('Captação de ', '')}
                        </span>
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

                      {/* Gasto Total */}
                      <td className="p-4 text-sm font-bold text-accent-alert">
                        {formatCurrency(teste.investimento_total)}
                      </td>

                      {/* Hoje */}
                      <td className="p-4">
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="text-sm font-bold text-accent-primary">{teste.resultados_dia} <span className="text-[9px] font-normal text-text-tertiary">result.</span></span>
                          {teste.gasto_hoje > 0 && (
                            <span className="text-[10px] text-amber-400 font-medium">{formatCurrency(teste.gasto_hoje)}</span>
                          )}
                          {teste.impressoes > 0 && (
                            <span className="text-[10px] text-text-tertiary flex items-center gap-0.5">
                              <Eye size={9} /> {teste.impressoes.toLocaleString('pt-BR')} imp.
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Resultados Secundários (dinâmicos) */}
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {secondary.map((m, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                              <span className="text-text-tertiary">{m.label}:</span>
                              <span className={cn("font-bold", m.color)}>{m.value}</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* KPI Principal */}
                      <td className="p-4">
                        <div className="flex flex-col items-start">
                          <span className={cn("text-sm font-bold", objConfig.color)}>
                            {metrica.formatted}
                          </span>
                          <span className="text-[9px] text-text-tertiary uppercase tracking-wider">{metrica.label}</span>
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenModal(teste)}
                            className="p-1.5 text-text-tertiary hover:text-accent-primary transition-colors rounded-lg hover:bg-background-app"
                            title="Editar Campanha"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm('Tem certeza que deseja excluir esta campanha?')) {
                                deleteCriativo(teste.id);
                              }
                            }}
                            className="p-1.5 text-text-tertiary hover:text-danger transition-colors rounded-lg hover:bg-danger/10"
                            title="Excluir Campanha"
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
