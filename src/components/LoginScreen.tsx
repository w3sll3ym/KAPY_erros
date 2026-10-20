import React, { useState } from 'react';
import {
  Layers,
  Headphones,
  Shield,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';
import { SIMULATED_ACCOUNTS } from '../data/authUsers';
import { UserRole } from '../types/workflow';

interface LoginScreenProps {
  onLoginSuccess?: (role: UserRole) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { login } = useWorkflow();

  const [emailOrRole, setEmailOrRole] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!emailOrRole.trim()) {
      setErrorMessage('Informe seu email ou selecione um dos perfis abaixo.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(emailOrRole, password);
      if (success) {
        if (onLoginSuccess) {
          const lower = emailOrRole.toLowerCase();
          let role: UserRole = 'ANALISTA';
          if (lower.includes('csm')) role = 'CSM';
          if (lower.includes('qualidade') || lower.includes('qa')) role = 'QUALIDADE';
          onLoginSuccess(role);
        }
      } else {
        setErrorMessage('Credenciais inválidas. Verifique o email e a senha (padrão: 123).');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSimulatedRole = async (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage('');
    setIsLoading(true);
    try {
      const account = SIMULATED_ACCOUNTS[role];
      const success = await login(account.role, account.passwordHint);
      if (success && onLoginSuccess) {
        onLoginSuccess(role);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillOnly = (role: UserRole, e: React.MouseEvent) => {
    e.stopPropagation();
    const account = SIMULATED_ACCOUNTS[role];
    setEmailOrRole(account.email);
    setPassword(account.passwordHint);
    setSelectedRole(role);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-slate-100">
      {/* Subtle Top Bar */}
      <header className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs tracking-wider">
            KP
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-slate-900 block leading-none">
              KAPY OPs
            </span>
            <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
              Report de Erros
            </span>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-normal hidden sm:block">
          Ambiente de Simulação de Perfis
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 flex flex-col justify-center">
        {/* Title & Introduction */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Acessar Sistema
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Selecione um dos perfis para simular o fluxo de trabalho ou faça login com suas credenciais.
          </p>
        </div>

        {/* 3 Simulated Profiles (Separated by Profile Type) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
              Perfis de Acesso Rápido
            </span>
            <span className="text-[11px] text-slate-400">
              Clique para entrar instantaneamente
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* CSM Profile */}
            {(() => {
              const csm = SIMULATED_ACCOUNTS.CSM;
              const isSelected = selectedRole === 'CSM';
              return (
                <div
                  key="csm"
                  onClick={() => handleSelectSimulatedRole('CSM')}
                  className={`border rounded-xl p-4 transition-all cursor-pointer bg-white flex flex-col justify-between hover:border-blue-400 hover:shadow-xs group ${
                    isSelected ? 'border-blue-600 ring-1 ring-blue-600/30' : 'border-slate-200'
                  }`}
                >
                  <div>
                    {/* Role Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                        <Headphones className="w-3.5 h-3.5" />
                        <span>CSM</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        senha: 123
                      </span>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <img
                        src={csm.avatar}
                        alt={csm.name}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {csm.name}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {csm.title}
                        </span>
                      </div>
                    </div>

                    {/* Context description */}
                    <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                      Abre novos chamados, visualiza todos os erros e responde contestações.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono truncate max-w-[150px]">
                      {csm.email}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleFillOnly('CSM', e)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                      title="Preencher no formulário"
                    >
                      Preencher
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* ANALISTA Profile */}
            {(() => {
              const ana = SIMULATED_ACCOUNTS.ANALISTA;
              const isSelected = selectedRole === 'ANALISTA';
              return (
                <div
                  key="analista"
                  onClick={() => handleSelectSimulatedRole('ANALISTA')}
                  className={`border rounded-xl p-4 transition-all cursor-pointer bg-white flex flex-col justify-between hover:border-indigo-400 hover:shadow-xs group ${
                    isSelected ? 'border-indigo-600 ring-1 ring-indigo-600/30' : 'border-slate-200'
                  }`}
                >
                  <div>
                    {/* Role Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
                        <Layers className="w-3.5 h-3.5" />
                        <span>Analista</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        senha: 123
                      </span>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <img
                        src={ana.avatar}
                        alt={ana.name}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {ana.name}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {ana.title}
                        </span>
                      </div>
                    </div>

                    {/* Context description */}
                    <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                      Realiza triagem técnica, aprova erros diretamente ou reprova chamados.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono truncate max-w-[150px]">
                      {ana.email}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleFillOnly('ANALISTA', e)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                      title="Preencher no formulário"
                    >
                      Preencher
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* QUALIDADE Profile */}
            {(() => {
              const qa = SIMULATED_ACCOUNTS.QUALIDADE;
              const isSelected = selectedRole === 'QUALIDADE';
              return (
                <div
                  key="qualidade"
                  onClick={() => handleSelectSimulatedRole('QUALIDADE')}
                  className={`border rounded-xl p-4 transition-all cursor-pointer bg-white flex flex-col justify-between hover:border-orange-400 hover:shadow-xs group ${
                    isSelected ? 'border-orange-600 ring-1 ring-orange-600/30' : 'border-slate-200'
                  }`}
                >
                  <div>
                    {/* Role Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-700">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Qualidade (QA)</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        senha: 123
                      </span>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <img
                        src={qa.avatar}
                        alt={qa.name}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {qa.name}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {qa.title}
                        </span>
                      </div>
                    </div>

                    {/* Context description */}
                    <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                      Emite o veredito final exclusivo quando o Analista reprova um erro.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono truncate max-w-[150px]">
                      {qa.email}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleFillOnly('QUALIDADE', e)}
                      className="text-[11px] text-orange-600 hover:text-orange-800 font-medium cursor-pointer"
                      title="Preencher no formulário"
                    >
                      Preencher
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Minimalist Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 font-medium">
              Ou acesse com email e senha
            </span>
          </div>
        </div>

        {/* Minimalist Form */}
        <div className="max-w-md w-full mx-auto">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email ou Perfil
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="csm@kapy.com, analista@kapy.com ou qualidade@kapy.com"
                  value={emailOrRole}
                  onChange={(e) => setEmailOrRole(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Senha
                </label>
                <span className="text-[11px] text-slate-400">
                  Padrão para testes: <strong>123</strong>
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Informe sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-slate-100 px-6 py-4 text-center text-xs text-slate-400">
        <span>KAPY OPs &copy; 2026</span>
        <span className="mx-2">&middot;</span>
        <span>Fluxo Integrado CSM &middot; Analista &middot; Qualidade</span>
      </footer>
    </div>
  );
};
