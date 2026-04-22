import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, AlertCircle } from 'lucide-react';
import { useLeads } from '../hooks/useLeads';
import { Lead, LeadEtapa } from '../types';
import { LeadCard } from '../components/pipeline/LeadCard';
import { LeadDetailSidebar } from '../components/pipeline/LeadDetailSidebar';
import { Badge } from '../components/ui/Badge';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { KanbanColumn } from '../components/pipeline/KanbanColumn';

const COLUMNS: { id: LeadEtapa; title: string; color: string }[] = [
  { id: 'novo_lead', title: 'Novos Leads', color: 'bg-accent-primary' },
  { id: 'contato_feito', title: 'Contatos', color: 'bg-accent-secondary' },
  { id: 'consulta_agendada', title: 'Agendados', color: 'bg-accent-alert' },
  { id: 'consulta_realizada', title: 'Consultas', color: 'bg-emerald-500' },
  { id: 'cliente_fechado', title: 'Tratamento Fechado', color: 'bg-indigo-600' },
  { id: 'perdido', title: 'Perdido', color: 'bg-danger' },
];

const Pipeline: React.FC = () => {
  const { leads, loading, moveLeadEtapa, updateLead } = useLeads();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [closingLead, setClosingLead] = useState<Lead | null>(null);
  const [closingValue, setClosingValue] = useState('');
  const [closingProcedure, setClosingProcedure] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => 
      lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.servico?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [leads, searchTerm]);

  const selectedLead = useMemo(() => {
    return leads.find(l => l.id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  const activeLead = useMemo(() => {
    return leads.find(l => l.id === activeId) || null;
  }, [leads, activeId]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // If dropped on a column
    const isColumn = COLUMNS.some(c => c.id === overId);
    if (isColumn) {
      const newEtapa = overId as LeadEtapa;
      const lead = leads.find(l => l.id === activeId);
      if (lead && lead.etapa !== newEtapa) {
        if (newEtapa === 'cliente_fechado') {
          setClosingLead(lead);
          setClosingProcedure(lead.procedimento_interesse || '');
          return;
        }
        await moveLeadEtapa(activeId, newEtapa);
      }
      return;
    }

    // If dropped on another lead
    const overLead = leads.find(l => l.id === overId);
    if (overLead) {
      const newEtapa = overLead.etapa;
      const lead = leads.find(l => l.id === activeId);
      if (lead && lead.etapa !== newEtapa) {
        if (newEtapa === 'cliente_fechado') {
          setClosingLead(lead);
          setClosingProcedure(lead.procedimento_interesse || '');
          return;
        }
        await moveLeadEtapa(activeId, newEtapa);
      }
    }
  };

  const handleConfirmClosing = async () => {
    if (!closingLead) return;
    
    await updateLead(closingLead.id, {
      etapa: 'cliente_fechado',
      valor_fechado: Number(closingValue),
      procedimento_interesse: closingProcedure as any
    });

    setClosingLead(null);
    setClosingValue('');
    setClosingProcedure('');
  };

  if (loading && leads.length === 0) {
    return (
      <div className="h-[calc(100vh-160px)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Pipeline de Leads</h1>
          <p className="text-sm text-text-secondary">Gerencie o progresso dos seus leads no funil</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
            <input
              type="text"
              placeholder="Buscar lead..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-background-card border border-border-card rounded-xl pl-10 pr-4 py-2 text-sm focus:border-accent-primary outline-none w-64"
            />
          </div>
          <button className="p-2.5 rounded-xl bg-background-card border border-border-card text-text-secondary hover:text-text-primary transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              leads={filteredLeads.filter(l => l.etapa === column.id)}
              onLeadClick={(id) => setSelectedLeadId(id)}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeId && activeLead ? (
            <div className="w-80 cursor-grabbing">
              <LeadCard lead={activeLead} isOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {closingLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background-card border border-border-card rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <h2 className="text-xl font-bold text-text-primary mb-2">Tratamento Fechado! 🎉</h2>
            <p className="text-sm text-text-secondary mb-6">Parabéns pelo fechamento com {closingLead.nome}. Informe os detalhes abaixo:</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-tertiary uppercase mb-1.5">Procedimento</label>
                <select 
                  value={closingProcedure}
                  onChange={(e) => setClosingProcedure(e.target.value)}
                  className="w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-2.5 text-sm focus:border-accent-primary outline-none"
                >
                  <option value="Implante">Implante</option>
                  <option value="Facetas">Facetas</option>
                  <option value="Clareamento">Clareamento</option>
                  <option value="Avaliação">Avaliação</option>
                  <option value="Ortodontia">Ortodontia</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-text-tertiary uppercase mb-1.5">Valor do Tratamento (R$)</label>
                <input 
                  type="number"
                  value={closingValue}
                  onChange={(e) => setClosingValue(e.target.value)}
                  placeholder="Ex: 5000"
                  className="w-full bg-background-sidebar border border-border-card rounded-xl px-4 py-2.5 text-sm focus:border-accent-primary outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setClosingLead(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border-card text-text-secondary font-bold hover:bg-background-sidebar transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmClosing}
                disabled={!closingValue || !closingProcedure}
                className="flex-1 px-4 py-2.5 rounded-xl bg-accent-primary text-white font-bold hover:opacity-90 transition-all disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <LeadDetailSidebar 
        lead={selectedLead} 
        onClose={() => setSelectedLeadId(null)} 
      />
    </div>
  );
};

export default Pipeline;
