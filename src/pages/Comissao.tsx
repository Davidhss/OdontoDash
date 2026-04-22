import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useComissao } from '../hooks/useComissao';
import { useLeads } from '../hooks/useLeads';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  DollarSign, 
  Calendar, 
  Download, 
  TrendingUp, 
  Users, 
  FileText,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { Badge } from '../components/ui/Badge';

const Comissao: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { comissao, loading, salvarComissao } = useComissao(selectedDate);
  const { leads } = useLeads();

  const start = startOfMonth(selectedDate);
  const end = endOfMonth(selectedDate);

  const closedLeads = leads.filter(l => 
    l.etapa === 'cliente_fechado' && 
    l.ultima_atualizacao && 
    new Date(l.ultima_atualizacao) >= start && 
    new Date(l.ultima_atualizacao) <= end
  );

  const handleExport = () => {
    // Placeholder for PDF export
    window.print();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Relatório de Comissão</h1>
          <p className="text-sm text-text-secondary">Acompanhamento de remuneração variável Blent Assessoria</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-background-card border border-border-card rounded-xl px-4 py-2">
            <Calendar size={18} className="text-text-tertiary" />
            <input 
              type="month" 
              value={format(selectedDate, 'yyyy-MM')}
              onChange={(e) => setSelectedDate(new Date(e.target.value + '-01'))}
              className="bg-transparent border-none text-sm font-bold text-text-primary focus:ring-0 outline-none cursor-pointer"
            />
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-background-card border border-border-card px-4 py-2 rounded-xl text-sm font-bold text-text-primary hover:bg-background-sidebar transition-all"
          >
            <Download size={18} />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background-card border border-border-card p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Novos Pacientes</p>
              <h3 className="text-2xl font-bold text-text-primary">{comissao?.total_novos_pacientes || 0}</h3>
            </div>
          </div>
          <p className="text-xs text-text-secondary">Pacientes captados pelos canais Blent</p>
        </div>

        <div className="bg-background-card border border-border-card p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Faturamento Incremental</p>
              <h3 className="text-2xl font-bold text-text-primary">{formatCurrency(comissao?.faturamento_incremental || 0)}</h3>
            </div>
          </div>
          <p className="text-xs text-text-secondary">Volume total de tratamentos fechados</p>
        </div>

        <div className="bg-accent-primary rounded-3xl p-6 text-white shadow-xl shadow-accent-primary/20 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Total Remuneração Blent</p>
            <h3 className="text-3xl font-bold mb-4">{formatCurrency(comissao?.total_blent || 0)}</h3>
            <div className="flex items-center gap-2 text-xs font-medium bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-md">
              <CheckCircle2 size={14} />
              <span>{comissao?.status || 'Calculado'}</span>
            </div>
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
            <DollarSign size={80} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Detailed Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background-card border border-border-card rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border-card">
              <h2 className="text-lg font-bold text-text-primary">Tratamentos Fechados - {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-background-sidebar border-b border-border-card">
                    <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Paciente</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Procedimento</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Data</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider text-right">Valor</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider text-right">Comissão (10%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-card">
                  {closedLeads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-text-tertiary">
                        Nenhum tratamento fechado neste período.
                      </td>
                    </tr>
                  ) : (
                    closedLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-background-sidebar transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-text-primary">{lead.nome}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline">{lead.procedimento_interesse || lead.servico}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-text-secondary">
                            {lead.ultima_atualizacao ? format(new Date(lead.ultima_atualizacao), 'dd/MM/yyyy') : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-text-primary">{formatCurrency(Number(lead.valor_fechado))}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-accent-primary">{formatCurrency(Number(lead.valor_fechado) * 0.10)}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Breakdown Sidebar */}
        <div className="space-y-6">
          <div className="bg-background-card border border-border-card p-6 rounded-3xl shadow-sm">
            <h3 className="font-bold text-text-primary mb-6 flex items-center gap-2">
              <FileText size={18} className="text-accent-primary" />
              Resumo da Remuneração
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-border-card border-dashed">
                <span className="text-sm text-text-secondary">Valor Fixo Mensal</span>
                <span className="text-sm font-bold text-text-primary">{formatCurrency(comissao?.fixo_mes || 1000)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-border-card border-dashed">
                <span className="text-sm text-text-secondary">Comissão Variável (10%)</span>
                <span className="text-sm font-bold text-text-primary">{formatCurrency(comissao?.comissao_calculada || 0)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-text-primary">Total Geral</span>
                <span className="text-lg font-bold text-accent-primary">{formatCurrency(comissao?.total_blent || 0)}</span>
              </div>
            </div>

            <button 
              onClick={salvarComissao}
              disabled={comissao?.status === 'Fechado'}
              className="w-full mt-8 flex items-center justify-center gap-2 bg-accent-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-accent-primary/20"
            >
              {comissao?.status === 'Fechado' ? (
                <>
                  <CheckCircle2 size={18} />
                  Relatório Fechado
                </>
              ) : (
                <>
                  <Clock size={18} />
                  Fechar Relatório
                </>
              )}
            </button>
          </div>

          <div className="bg-background-sidebar border border-border-card p-6 rounded-3xl">
            <h4 className="font-bold text-text-primary text-sm mb-2">Regra de Negócio</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              A remuneração da Blent Assessoria consiste em um valor fixo de R$ 1.000,00 (meses 1-3) acrescido de 10% de comissão sobre o valor total de novos tratamentos fechados originados pelos canais de tráfego pago e gestão Blent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comissao;
