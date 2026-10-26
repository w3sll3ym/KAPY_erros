import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  Shield,
  Headphones,
  Layers,
  ShieldCheck,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';
import { SystemUser, UserRole } from '../../types/workflow';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
];

const ROLE_INFO: Record<
  UserRole,
  { label: string; badge: string; icon: React.ReactNode; desc: string }
> = {
  CSM: {
    label: 'CSM',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <Headphones className="w-3.5 h-3.5" />,
    desc: 'Abre novos chamados e responde contestações',
  },
  ANALISTA: {
    label: 'Analista',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: <Layers className="w-3.5 h-3.5" />,
    desc: 'Triagem técnica N2, contesta ou aprova/reprova',
  },
  QUALIDADE: {
    label: 'Qualidade (QA)',
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: <Shield className="w-3.5 h-3.5" />,
    desc: 'Veredito conclusivo final sobre reprovações',
  },
  ADMIN: {
    label: 'Administrador',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    desc: 'Configura papéis, clientes, categorias e audita',
  },
  GESTOR_ANALISTA: {
    label: 'Gestor de Analista',
    badge: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    icon: <Users className="w-3.5 h-3.5" />,
    desc: 'Supervisão de equipe e centralização de notificações da hierarquia',
  },
};

export const AdminUsersManagement: React.FC = () => {
  const { systemUsers, saveUser, updateUserRole, deleteUser, servicesList } = useWorkflow();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'CSM' as UserRole,
    title: '',
    team: '',
    service: '',
    avatar: AVATAR_PRESETS[0],
    status: 'ATIVO' as 'ATIVO' | 'INATIVO',
    supervisedAnalysts: [] as string[],
    managerId: '',
    managerName: '',
  });
  const [formError, setFormError] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Delete confirmation
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const filteredUsers = useMemo(() => {
    return systemUsers.filter((u) => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
      if (serviceFilter !== 'ALL' && u.service !== serviceFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = u.name?.toLowerCase().includes(q);
        const matchesEmail = u.email?.toLowerCase().includes(q);
        const matchesTitle = u.title?.toLowerCase().includes(q);
        const matchesTeam = u.team?.toLowerCase().includes(q);
        const matchesService = u.service?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesTitle && !matchesTeam && !matchesService) return false;
      }
      return true;
    });
  }, [systemUsers, roleFilter, statusFilter, serviceFilter, searchTerm]);

  // List of active analysts for hierarchy assignment
  const activeAnalysts = useMemo(() => {
    return systemUsers.filter((u) => u.role === 'ANALISTA' && u.status !== 'INATIVO');
  }, [systemUsers]);

  // List of active gestores de analista
  const activeGestores = useMemo(() => {
    return systemUsers.filter((u) => u.role === 'GESTOR_ANALISTA' && u.status !== 'INATIVO');
  }, [systemUsers]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'CSM',
      title: 'Customer Success Specialist',
      team: 'Relacionamento & Contas',
      service: 'Atendimento Geral',
      avatar: AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)],
      status: 'ATIVO',
      supervisedAnalysts: [],
      managerId: '',
      managerName: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: SystemUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      team: user.team,
      service: user.service || 'Triagem & Operações N2',
      avatar: user.avatar || AVATAR_PRESETS[0],
      status: user.status || 'ATIVO',
      supervisedAnalysts: user.supervisedAnalysts || [],
      managerId: user.managerId || '',
      managerName: user.managerName || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Informe o nome completo do usuário.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Informe um e-mail válido.');
      return;
    }

    try {
      await saveUser({
        id: editingUser ? editingUser.id : undefined,
        ...formData,
      });
      setIsModalOpen(false);
      showFeedback(
        editingUser
          ? `Usuário ${formData.name} atualizado com sucesso!`
          : `Novo usuário ${formData.name} cadastrado com sucesso!`
      );
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar usuário.');
    }
  };

  const handleQuickRoleChange = async (user: SystemUser, newRole: UserRole) => {
    if (user.role === newRole) return;
    try {
      await updateUserRole(user.id, newRole);
      showFeedback(`Papel de ${user.name} alterado para ${ROLE_INFO[newRole].label}`);
    } catch {
      showFeedback('Erro ao atualizar papel do usuário.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUserId) return;
    try {
      await deleteUser(deletingUserId);
      setDeletingUserId(null);
      showFeedback('Usuário excluído com sucesso.');
    } catch {
      showFeedback('Erro ao excluir usuário.');
    }
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
            Gestão de Usuários & Atribuição de Papéis
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure quais papéis os colaboradores irão desempenhar no sistema (CSM, Analista de Triagem, Qualidade ou Administrador).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-xs cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, email, cargo ou equipe..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-slate-50/50"
          />
        </div>

        {/* Filter by Role */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Papel:</span>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="ALL">Todos os Papéis ({systemUsers.length})</option>
            <option value="CSM">CSM</option>
            <option value="ANALISTA">Analista (Ops)</option>
            <option value="GESTOR_ANALISTA">Gestor de Analista</option>
            <option value="QUALIDADE">Qualidade (QA)</option>
            <option value="ADMIN">Administrador</option>
          </select>

          {/* Filter by Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="ALL">Todos os Status</option>
            <option value="ATIVO">Ativos</option>
            <option value="INATIVO">Inativos</option>
          </select>

          {/* Filter by Service */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-purple-500 cursor-pointer max-w-[170px] truncate"
            title="Filtrar por Serviço de atendimento"
          >
            <option value="ALL">Todos os Serviços</option>
            {servicesList.map((srv) => (
              <option key={srv} value={srv}>
                {srv}
              </option>
            ))}
          </select>

          {(searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL' || serviceFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('ALL');
                setStatusFilter('ALL');
                setServiceFilter('ALL');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline px-1 cursor-pointer"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Usuário</th>
                <th className="py-3 px-4">Cargo & Equipe</th>
                <th className="py-3 px-4">Papel no Sistema (Clique p/ Trocar)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-600">Nenhum usuário encontrado</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Tente ajustar os filtros ou cadastrar um novo usuário.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleConfig = ROLE_INFO[user.role] || ROLE_INFO.CSM;
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Avatar & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">
                              {user.name}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate font-mono">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cargo & Team */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 block truncate">
                          {user.title || 'Não informado'}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {user.team || 'Geral'}
                        </span>
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded inline-flex items-center gap-1" title="Serviço ao qual os chamados são direcionados">
                            <Layers className="w-3 h-3" />
                            Serviço: {user.service || 'Geral'}
                          </span>
                        </div>
                        {user.role === 'GESTOR_ANALISTA' && (
                          <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded font-medium mt-1 inline-flex items-center gap-1">
                            👔 Supervisiona:{' '}
                            {user.supervisedAnalysts && user.supervisedAnalysts.length > 0
                              ? user.supervisedAnalysts.join(', ')
                              : 'Todos os analistas'}
                          </span>
                        )}
                        {user.role === 'ANALISTA' && (
                          <span className="text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-medium mt-1 inline-flex items-center gap-1">
                            👤 Gestor: {user.managerName || 'Roberto Mendes'}
                          </span>
                        )}
                      </td>

                      {/* Interactive Role Switcher */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleQuickRoleChange(user, e.target.value as UserRole)
                            }
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border cursor-pointer focus:outline-none transition-colors ${roleConfig.badge}`}
                            title="Selecione para alterar imediatamente o papel do usuário"
                          >
                            <option value="CSM">CSM (Customer Success)</option>
                            <option value="ANALISTA">Analista (Triagem Ops)</option>
                            <option value="GESTOR_ANALISTA">Gestor de Analista (Gestão)</option>
                            <option value="QUALIDADE">Qualidade (QA)</option>
                            <option value="ADMIN">Administrador</option>
                          </select>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {roleConfig.desc}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            user.status !== 'INATIVO'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.status !== 'INATIVO' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {user.status !== 'INATIVO' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar Usuário"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingUserId(user.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir Usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-4">
          <span>
            Total exibido: <strong>{filteredUsers.length}</strong> de{' '}
            <strong>{systemUsers.length}</strong> usuários cadastrados
          </span>
          <span className="text-[11px] text-purple-700 font-medium">
            Alterações de papéis têm efeito imediato no acesso e permissões
          </span>
        </div>
      </div>

      {/* Modal Criar/Editar Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingUser ? 'Editar Usuário' : 'Novo Usuário do Sistema'}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Configure os dados cadastrais e o papel desempenhado
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

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Mariana Silva"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="usuario@kapy.com"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Papel Desempenhado *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as UserRole })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white cursor-pointer font-medium"
                  >
                    <option value="CSM">CSM (Customer Success)</option>
                    <option value="ANALISTA">Analista (Triagem & Suporte N2)</option>
                    <option value="GESTOR_ANALISTA">Gestor de Analista (Supervisão & Notificações)</option>
                    <option value="QUALIDADE">Qualidade (Garantia QA)</option>
                    <option value="ADMIN">Administrador (Governança & Gestão)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status da Conta
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'ATIVO' | 'INATIVO',
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white cursor-pointer"
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="INATIVO">Inativo</option>
                  </select>
                </div>
              </div>

              {/* Title & Team */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cargo / Função
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Gestor de Triagem / Analista N2"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Equipe / Departamento
                  </label>
                  <input
                    type="text"
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    placeholder="Ex: Triagem & Suporte N1/N2"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Serviço / Fila de Atendimento (Direcionamento de Chamados) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Serviço / Fila de Atendimento</span>
                  <span className="text-[10px] text-purple-600 font-medium">
                    Direcionamento de chamados
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="services-datalist-input"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    placeholder="Ex: Triagem & Operações N2, Suporte Técnico N1, Integrações & APIs..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-slate-50/50"
                  />
                  <datalist id="services-datalist-input">
                    {servicesList.map((srv) => (
                      <option key={srv} value={srv} />
                    ))}
                  </datalist>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Os chamados abertos direcionados a este serviço serão atribuídos e visualizados pelos analistas cadastrados nele.
                </p>
              </div>

              {/* Hierarchy Configuration Section */}
              {formData.role === 'GESTOR_ANALISTA' && (
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-950 block">
                        Hierarquia · Analistas Supervisionados
                      </span>
                      <p className="text-[11px] text-indigo-700">
                        O gestor receberá centralizadamente as notificações de todos os analistas selecionados.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const allNames = activeAnalysts.map((a) => a.name);
                        const isAllSelected =
                          formData.supervisedAnalysts.length === allNames.length;
                        setFormData({
                          ...formData,
                          supervisedAnalysts: isAllSelected ? [] : allNames,
                        });
                      }}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                    >
                      {formData.supervisedAnalysts.length === activeAnalysts.length
                        ? 'Desmarcar Todos'
                        : 'Selecionar Todos'}
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
                    {activeAnalysts.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic">
                        Nenhum analista ativo cadastrado no sistema ainda.
                      </p>
                    ) : (
                      activeAnalysts.map((analyst) => {
                        const isChecked = formData.supervisedAnalysts.includes(analyst.name);
                        return (
                          <label
                            key={analyst.id}
                            className={`flex items-center gap-2.5 p-2 rounded-lg border transition-colors cursor-pointer text-xs ${
                              isChecked
                                ? 'bg-white border-indigo-300 font-semibold text-slate-900 shadow-2xs'
                                : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    supervisedAnalysts: [
                                      ...formData.supervisedAnalysts,
                                      analyst.name,
                                    ],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    supervisedAnalysts: formData.supervisedAnalysts.filter(
                                      (n) => n !== analyst.name
                                    ),
                                  });
                                }
                              }}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                            />
                            <img
                              src={analyst.avatar}
                              alt={analyst.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <div className="flex items-center justify-between flex-1 min-w-0">
                              <span className="truncate">{analyst.name}</span>
                              <span className="text-[10px] text-slate-400 font-normal truncate ml-2">
                                {analyst.title || 'Analista'}
                              </span>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {formData.role === 'ANALISTA' && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Gestor de Analista Responsável (Hierarquia)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    O gestor vinculado receberá notificações de todos os chamados deste analista.
                  </p>
                  <select
                    value={formData.managerName}
                    onChange={(e) => {
                      const selectedGestor = activeGestores.find((g) => g.name === e.target.value);
                      setFormData({
                        ...formData,
                        managerName: e.target.value,
                        managerId: selectedGestor ? selectedGestor.id : '',
                      });
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white cursor-pointer mt-1 font-medium"
                  >
                    <option value="">Selecione um Gestor de Analista...</option>
                    {activeGestores.map((gestor) => (
                      <option key={gestor.id} value={gestor.name}>
                        {gestor.name} ({gestor.title || 'Gestor'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Avatar selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Escolher Avatar
                </label>
                <div className="flex items-center gap-3">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: preset })}
                      className={`relative rounded-full p-0.5 transition-all cursor-pointer ${
                        formData.avatar === preset
                          ? 'ring-2 ring-purple-600 scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset}
                        alt={`Preset ${idx + 1}`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      {formData.avatar === preset && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-purple-600 rounded-full text-white flex items-center justify-center text-[8px]">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
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
                  className="px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  {editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm w-full">
            <h3 className="text-sm font-bold text-slate-900">Confirmar Exclusão</h3>
            <p className="text-xs text-slate-600 mt-2">
              Tem certeza que deseja remover este usuário do sistema? Esta ação não pode ser desfeita.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeletingUserId(null)}
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
