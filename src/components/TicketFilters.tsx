import React from 'react';
import {
  Search,
  Filter,
  X,
  LayoutGrid,
  List,
  Check,
  Building,
  AlertTriangle,
} from 'lucide-react';
import { TicketStatus } from '../types/workflow';
import { STATUS_CONFIG } from '../data/statusConfig';

interface TicketFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: TicketStatus | 'ALL';
  onStatusFilterChange: (status: TicketStatus | 'ALL') => void;
  clientFilter: string;
  onClientFilterChange: (client: string) => void;
  clientsList: string[];
  viewMode: 'table' | 'kanban';
  onViewModeChange: (mode: 'table' | 'kanban') => void;
  isOnlyMyActionsActive: boolean;
  onToggleOnlyMyActions: () => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const TicketFilters: React.FC<TicketFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  clientFilter,
  onClientFilterChange,
  clientsList,
  viewMode,
  onViewModeChange,
  isOnlyMyActionsActive,
  onToggleOnlyMyActions,
  onResetFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-2xs space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código (ERR-...), título, cliente ou palavra-chave..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 placeholder-slate-400 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Mode Switcher (Table / Kanban) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
          <button
            onClick={() => onViewModeChange('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'table'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Tabela</span>
          </button>
          <button
            onClick={() => onViewModeChange('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'kanban'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Quadro Kanban</span>
          </button>
        </div>
      </div>

      {/* Second Row: Granular Filters */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        {/* Status Dropdown */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange(e.target.value as TicketStatus | 'ALL')
            }
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">Todos os Estados</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>


        {/* Client Dropdown */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500 font-medium">Cliente:</span>
          <select
            value={clientFilter}
            onChange={(e) => onClientFilterChange(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[160px] truncate"
          >
            <option value="ALL">Todos os Clientes</option>
            {clientsList.map((client) => (
              <option key={client} value={client}>
                {client}
              </option>
            ))}
          </select>
        </div>

        {/* Only My Role Actions Switcher Button */}
        <button
          onClick={onToggleOnlyMyActions}
          className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
            isOnlyMyActionsActive
              ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isOnlyMyActionsActive ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          />
          <span>Pendentes do Meu Papel</span>
        </button>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1.5 flex items-center gap-1 transition-colors ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpar Filtros</span>
          </button>
        )}
      </div>
    </div>
  );
};
