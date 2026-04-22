import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Lead } from '../../types';
import { LeadCard } from './LeadCard';
import { Badge } from '../ui/Badge';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  leads: Lead[];
  onLeadClick: (id: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, color, leads, onLeadClick }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef}
      className="flex-shrink-0 w-80 flex flex-col bg-background-sidebar/30 rounded-2xl border border-border-card/50"
    >
      <div className="p-4 flex items-center justify-between border-b border-border-card/50">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider">{title}</h3>
          <Badge variant="outline" className="h-5">{leads.length}</Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <LeadCard 
              key={lead.id} 
              lead={lead} 
              onClick={() => onLeadClick(lead.id)}
            />
          ))}
        </SortableContext>
        
        {leads.length === 0 && (
          <div className="h-32 border-2 border-dashed border-border-card rounded-xl flex flex-col items-center justify-center text-text-tertiary gap-2">
            <p className="text-xs font-medium">Nenhum lead nesta etapa</p>
          </div>
        )}
      </div>
    </div>
  );
};
