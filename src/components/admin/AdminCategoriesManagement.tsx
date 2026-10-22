import React, { useState, useMemo } from 'react';
import {
  Tags,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  Check,
  Tag,
} from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';
import { CategoryRecord } from '../../types/workflow';

const COLOR_OPTIONS = [
  { id: 'blue', label: 'Azul', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'indigo', label: 'Índigo', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { id: 'purple', label: 'Roxo', bg: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'emerald', label: 'Verde', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'amber', label: 'Âmbar', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'rose', label: 'Rosa / Vermelho', bg: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'cyan', label: 'Ciano', bg: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  { id: 'slate', label: 'Cinza', bg: 'bg-slate-100 text-slate-800 border-slate-200' },
];

export const AdminCategoriesManagement: React.FC = () => {
  const { categories, tickets, saveCategory, deleteCategory } = useWorkflow();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'indigo',
    status: 'ATIVO' as 'ATIVO' | 'INATIVO',
  });
  const [formError, setFormError] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Ticket count per category
  const categoryTicketCounts = useMemo(() => {
    const map: Record<string, number> = {};
    tickets.forEach((t) => {
      if (t.category) {
        const key = t.category.trim().toLowerCase();
        map[key] = (map[key] || 0) + 1;
      }
    });
    return map;
  }, [tickets]);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = c.name?.toLowerCase().includes(q);
        const matchesDesc = c.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }, [categories, statusFilter, searchTerm]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      color: 'indigo',
      status: 'ATIVO',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: CategoryRecord) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || 'indigo',
      status: category.status || 'ATIVO',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Informe o nome da categoria.');
      return;
    }

    try {
      await saveCategory({
        id: editingCategory ? editingCategory.id : undefined,
        ...formData,
      });
      setIsModalOpen(false);
      showFeedback(
        editingCategory
          ? `Categoria "${formData.name}" atualizada com sucesso!`
          : `Nova categoria "${formData.name}" criada com sucesso!`
      );
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar categoria.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCatId) return;
    try {
      await deleteCategory(deletingCatId);
      setDeletingCatId(null);
      showFeedback('Categoria removida com sucesso.');
    } catch {
      showFeedback('Erro ao remover categoria.');
    }
  };

  const getColorConfig = (colorId?: string) => {
    return COLOR_OPTIONS.find((c) => c.id === colorId) || COLOR_OPTIONS[0];
  };

  return (
    <div className="space-y-5">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{feedbackMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Cadastro e Parametrização de Categorias
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Defina e organize as categorias e módulos de erros disponíveis para seleção pelos analistas e CSMs.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por categoria ou descrição do módulo..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Todos os Status</option>
            <option value="ATIVO">Ativas</option>
            <option value="INATIVO">Inativas</option>
          </select>

          {(searchTerm || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline px-1 cursor-pointer"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Categories Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full py-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400">
            <Tags className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-medium text-slate-600">Nenhuma categoria encontrada</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Clique em Nova Categoria para parametrizar um módulo de erro.
            </p>
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const colorCfg = getColorConfig(cat.color);
            const count = categoryTicketCounts[cat.name.trim().toLowerCase()] || 0;

            return (
              <div
                key={cat.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${colorCfg.bg}`}
                    >
                      <Tag className="w-3 h-3" />
                      <span>{cat.name}</span>
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${
                        cat.status !== 'INATIVO'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          cat.status !== 'INATIVO' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      {cat.status !== 'INATIVO' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mt-2.5 line-clamp-3">
                    {cat.description || 'Sem descrição cadastrada.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700 tabular-nums">
                    {count} {count === 1 ? 'chamado associado' : 'chamados associados'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Editar Categoria"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingCatId(cat.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir Categoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Criar/Editar Categoria */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Tags className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingCategory ? 'Editar Categoria' : 'Nova Categoria de Erro'}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Módulos e classificações de erros no sistema
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome da Categoria / Módulo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Faturamento & Cobrança"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição e Escopo do Erro
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva que tipos de problemas e falhas técnicas se enquadram nesta categoria..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Color Tag Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Identificador Visual / Cor da Tag
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: opt.id })}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center justify-between cursor-pointer transition-all ${
                        opt.bg
                      } ${
                        formData.color === opt.id
                          ? 'ring-2 ring-indigo-600 ring-offset-1 scale-102'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {formData.color === opt.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'ATIVO' | 'INATIVO',
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white cursor-pointer"
                >
                  <option value="ATIVO">Ativa (disponível para novos chamados)</option>
                  <option value="INATIVO">Inativa (oculta de novas aberturas)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCatId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm w-full">
            <h3 className="text-sm font-bold text-slate-900">Confirmar Exclusão</h3>
            <p className="text-xs text-slate-600 mt-2">
              Tem certeza que deseja remover esta categoria? Os chamados existentes continuarão exibindo seu histórico.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeletingCatId(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer shadow-xs"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
