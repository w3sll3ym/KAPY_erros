import React, { useState, useMemo } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { Ticket, TicketStatus, TicketSeverity } from '../types/workflow';
import { STATUS_CONFIG, SEVERITY_CONFIG, CATEGORIES } from '../data/statusConfig';
import { StatusBadge } from './StatusBadge';
import {
  Download,
  FileSpreadsheet,
  FileCode,
  Filter,
  CheckSquare,
  Square,
  Search,
  RefreshCw,
  Table as TableIcon,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';

interface ColumnDef {
  key: string;
  label: string;
  defaultSelected: boolean;
  getter: (t: Ticket) => string | number;
}

const AVAILABLE_COLUMNS: ColumnDef[] = [
  { key: 'code', label: 'Código do Chamado', defaultSelected: true, getter: (t) => t.code || '' },
  { key: 'title', label: 'Título do Erro', defaultSelected: true, getter: (t) => t.title || '' },
  { key: 'clientName', label: 'Cliente', defaultSelected: true, getter: (t) => t.clientName || '' },
  { key: 'clientSegment', label: 'Segmento do Cliente', defaultSelected: false, getter: (t) => t.clientSegment || '' },
  { key: 'category', label: 'Categoria / Módulo', defaultSelected: true, getter: (t) => t.category || '' },
  { key: 'severity', label: 'Severidade', defaultSelected: true, getter: (t) => t.severity || '' },
  {
    key: 'status',
    label: 'Status no Workflow',
    defaultSelected: true,
    getter: (t) => STATUS_CONFIG[t.status]?.label || t.status,
  },
  { key: 'analystCell', label: 'Célula do Analista', defaultSelected: true, getter: (t) => t.analystCell || '' },
  { key: 'analystName', label: 'Nome do Analista', defaultSelected: false, getter: (t) => t.analystName || '' },
  { key: 'errorReasonDC', label: 'Motivo do Erro - DC', defaultSelected: true, getter: (t) => t.errorReasonDC || '' },
  {
    key: 'impactedEmployeesCount',
    label: 'Colaboradores Impactados',
    defaultSelected: true,
    getter: (t) => t.impactedEmployeesCount ?? 0,
  },
  {
    key: 'impactedCompetenciesCount',
    label: 'Competências Impactadas',
    defaultSelected: true,
    getter: (t) => t.impactedCompetenciesCount ?? 0,
  },
  { key: 'documentList', label: 'Listagem de Documentos', defaultSelected: false, getter: (t) => t.documentList || '' },
  {
    key: 'createdAt',
    label: 'Data de Abertura',
    defaultSelected: true,
    getter: (t) => (t.createdAt ? new Date(t.createdAt).toLocaleDateString('pt-BR') : ''),
  },
  {
    key: 'updatedAt',
    label: 'Última Atualização',
    defaultSelected: false,
    getter: (t) => (t.updatedAt ? new Date(t.updatedAt).toLocaleDateString('pt-BR') : ''),
  },
  { key: 'createdByName', label: 'Criado Por (CSM)', defaultSelected: false, getter: (t) => t.createdByName || '' },
  {
    key: 'analystDecision',
    label: 'Decisão do Analista',
    defaultSelected: false,
    getter: (t) => t.analystReview?.decision || '',
  },
  {
    key: 'analystNotes',
    label: 'Parecer do Analista',
    defaultSelected: false,
    getter: (t) => t.analystReview?.notes || '',
  },
  {
    key: 'qualityVerdict',
    label: 'Veredito da Qualidade',
    defaultSelected: false,
    getter: (t) => t.qualityReview?.verdict || '',
  },
  {
    key: 'qualityReport',
    label: 'Laudo da Qualidade',
    defaultSelected: false,
    getter: (t) => t.qualityReview?.technicalReport || '',
  },
];

export const ExportReportsPage: React.FC = () => {
  const { tickets } = useWorkflow();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | 'ALL'>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<TicketSeverity | 'ALL'>('ALL');
  const [selectedClient, setSelectedClient] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCell, setSelectedCell] = useState<string>('ALL');

  // Columns to include
  const [selectedColumns, setSelectedColumns] = useState<string[]>(() =>
    AVAILABLE_COLUMNS.filter((c) => c.defaultSelected).map((c) => c.key)
  );

  // Status and client lists
  const clientsList = useMemo(() => {
    const set = new Set<string>();
    tickets.forEach((t) => {
      if (t.clientName) set.add(t.clientName.trim());
    });
    return Array.from(set).sort();
  }, [tickets]);

  const cellsList = useMemo(() => {
    const set = new Set<string>();
    tickets.forEach((t) => {
      if (t.analystCell) set.add(t.analystCell.trim());
    });
    return Array.from(set).sort();
  }, [tickets]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (selectedStatus !== 'ALL' && t.status !== selectedStatus) {
        return false;
      }
      if (selectedSeverity !== 'ALL' && t.severity !== selectedSeverity) {
        return false;
      }
      if (selectedClient !== 'ALL' && t.clientName?.trim() !== selectedClient) {
        return false;
      }
      if (selectedCategory !== 'ALL' && t.category !== selectedCategory) {
        return false;
      }
      if (selectedCell !== 'ALL' && t.analystCell?.trim() !== selectedCell) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesCode = t.code?.toLowerCase().includes(query);
        const matchesTitle = t.title?.toLowerCase().includes(query);
        const matchesClient = t.clientName?.toLowerCase().includes(query);
        const matchesReason = t.errorReasonDC?.toLowerCase().includes(query);
        if (!matchesCode && !matchesTitle && !matchesClient && !matchesReason) {
          return false;
        }
      }
      return true;
    });
  }, [tickets, selectedStatus, selectedSeverity, selectedClient, selectedCategory, selectedCell, searchTerm]);

  // Toggle column
  const toggleColumn = (key: string) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const selectAllColumns = () => {
    setSelectedColumns(AVAILABLE_COLUMNS.map((c) => c.key));
  };

  const selectDefaultColumns = () => {
    setSelectedColumns(AVAILABLE_COLUMNS.filter((c) => c.defaultSelected).map((c) => c.key));
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('ALL');
    setSelectedSeverity('ALL');
    setSelectedClient('ALL');
    setSelectedCategory('ALL');
    setSelectedCell('ALL');
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredTickets.length === 0) return;

    const activeCols = AVAILABLE_COLUMNS.filter((c) => selectedColumns.includes(c.key));
    const headers = activeCols.map((c) => `"${c.label.replace(/"/g, '""')}"`);

    const rows = filteredTickets.map((t) => {
      return activeCols
        .map((c) => {
          const val = c.getter(t);
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(';');
    });

    // Add BOM for UTF-8 Excel compatibility
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_chamados_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export to JSON
  const handleExportJSON = () => {
    if (filteredTickets.length === 0) return;

    const activeCols = AVAILABLE_COLUMNS.filter((c) => selectedColumns.includes(c.key));
    const dataToExport = filteredTickets.map((t) => {
      const obj: Record<string, any> = {};
      activeCols.forEach((c) => {
        obj[c.key] = c.getter(t);
      });
      return obj;
    });

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_chamados_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-blue-400" />
            <span>Exportação de Relatórios & Dados</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Configure filtros, escolha as colunas desejadas e exporte os dados dos chamados em formato CSV (compatível com Excel) ou JSON para auditorias e reuniões de acompanhamento.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            disabled={filteredTickets.length === 0 || selectedColumns.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Baixar CSV (.csv)</span>
          </button>
          <button
            onClick={handleExportJSON}
            disabled={filteredTickets.length === 0 || selectedColumns.length === 0}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl border border-slate-700 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <FileCode className="w-4 h-4 text-blue-300" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Registros Filtrados</span>
          <span className="text-2xl font-black text-slate-900 tabular-nums">
            {filteredTickets.length}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">de {tickets.length} no total</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Colunas Ativas</span>
          <span className="text-2xl font-black text-blue-600 tabular-nums">
            {selectedColumns.length}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">de {AVAILABLE_COLUMNS.length} disponíveis</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Formato Padrão</span>
          <span className="text-lg font-bold text-slate-900 block mt-1">Excel CSV (;)</span>
          <span className="text-[11px] text-emerald-600 font-medium block">Codificado UTF-8 com BOM</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Status da Base</span>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-800">Sincronizado</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">Base em tempo real</span>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">1. Filtrar Base de Dados</h3>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Redefinir Filtros</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Search */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Busca Textual (Código, Título, Motivo)
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ex: ERR-2026, John Deere, EPI..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Status do Workflow
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="ALL">Todos os Status</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Client */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Cliente / Empresa
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="ALL">Todos os Clientes ({clientsList.length})</option>
              {clientsList.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Severidade
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="ALL">Todas as Severidades</option>
              {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Módulo / Categoria
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="ALL">Todas as Categorias</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Analyst Cell */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Célula do Analista
            </label>
            <select
              value={selectedCell}
              onChange={(e) => setSelectedCell(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="ALL">Todas as Células ({cellsList.length})</option>
              {cellsList.map((cell) => (
                <option key={cell} value={cell}>
                  {cell}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Column Selection Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              2. Selecionar Colunas para o Arquivo ({selectedColumns.length} de {AVAILABLE_COLUMNS.length})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={selectAllColumns}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            >
              Selecionar Todas
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={selectDefaultColumns}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Colunas Padrão
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {AVAILABLE_COLUMNS.map((col) => {
            const isChecked = selectedColumns.includes(col.key);
            return (
              <label
                key={col.key}
                onClick={() => toggleColumn(col.key)}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                  isChecked
                    ? 'bg-blue-50/60 border-blue-200 text-slate-900 font-semibold shadow-2xs'
                    : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100/70'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className="truncate">{col.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Live Preview Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">
              3. Pré-visualização dos Dados ({filteredTickets.length} registros)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Exibindo até 8 linhas de prévia
          </span>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Nenhum chamado encontrado com os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-semibold">
                <tr>
                  {AVAILABLE_COLUMNS.filter((c) => selectedColumns.includes(c.key)).map((c) => (
                    <th key={c.key} className="py-2.5 px-3 whitespace-nowrap">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredTickets.slice(0, 8).map((ticket) => {
                  const activeCols = AVAILABLE_COLUMNS.filter((c) =>
                    selectedColumns.includes(c.key)
                  );
                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                      {activeCols.map((c) => {
                        const val = c.getter(ticket);
                        return (
                          <td
                            key={c.key}
                            className="py-2.5 px-3 text-slate-700 whitespace-nowrap max-w-xs truncate"
                          >
                            {c.key === 'status' ? (
                              <StatusBadge status={ticket.status} size="sm" />
                            ) : c.key === 'code' ? (
                              <span className="font-bold text-slate-900">{String(val)}</span>
                            ) : (
                              String(val)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Action Bottom Bar */}
        <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs text-slate-500">
            Pronto para baixar? O arquivo será gerado instantaneamente no seu navegador.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={filteredTickets.length === 0 || selectedColumns.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Relatório CSV ({filteredTickets.length})</span>
            </button>
            <button
              onClick={handleExportJSON}
              disabled={filteredTickets.length === 0 || selectedColumns.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-blue-300" />
              <span>Exportar JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
