import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Upload,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  FileText,
} from 'lucide-react';
import { Ticket, Attachment } from '../types/workflow';
import { useWorkflow } from '../context/WorkflowContext';

// 1. Modal: Analista solicita informações adicionais ao CSM
export const RequestInfoModal: React.FC<{
  isOpen: boolean;
  ticket: Ticket;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ isOpen, ticket, onClose, onSuccess }) => {
  const { requestMoreInfo } = useWorkflow();
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setError('Por favor detalhe as informações ou logs que faltam.');
      return;
    }
    try {
      setSubmitting(true);
      await requestMoreInfo(ticket.id, question.trim());
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha ao salvar no Firebase.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-amber-50/50">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Solicitar Mais Informações ao CSM
              </h3>
              <span className="text-[11px] text-amber-800">
                {ticket.code} · Devolver para esclarecimento
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            O chamado passará para o estado{' '}
            <strong className="text-amber-700">INFORMACOES_FALTANDO</strong> no Firebase Firestore. O CSM
            será alertado no painel para fornecer as respostas solicitadas.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Descreva detalhadamente o que precisa ser complementado *
            </label>
            <textarea
              rows={4}
              placeholder="Ex: Por favor solicite ao cliente os logs de request/response no momento da falha, ou o ID da transação exata para consulta no banco..."
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                if (error) setError('');
              }}
              className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 focus:bg-white"
            />
            {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-lg shadow-xs flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Confirmar e Notificar CSM</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. Modal: Analista contesta chamado e devolve ao CSM (faltam informações)
export const ContestModal: React.FC<{
  isOpen: boolean;
  ticket: Ticket;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ isOpen, ticket, onClose, onSuccess }) => {
  const { contestByAnalyst } = useWorkflow();
  const [justification, setJustification] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) {
      setError('Por favor detalhe quais informações ou evidências estão faltando.');
      return;
    }
    try {
      setSubmitting(true);
      await contestByAnalyst(ticket.id, justification.trim());
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha ao gravar contestação no Firebase.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-amber-50/50">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Contestar Chamado (Faltam Informações)
              </h3>
              <span className="text-[11px] text-amber-800">
                {ticket.code} · Devolver ao perfil CSM / Relacionamento
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed">
            <strong>Atenção:</strong> Ao contestar por falta de informações, o chamado passará para a tela{' '}
            <strong className="text-amber-800">"Erros Contestados"</strong> do perfil <strong>CSM</strong>, que
            poderá complementar os dados solicitados e reenviar à triagem.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Descreva as informações que estão faltando *
            </label>
            <textarea
              rows={4}
              placeholder="Ex: Faltam logs do console do navegador, ID da transação exata e print da mensagem de erro ocorrida..."
              value={justification}
              onChange={(e) => {
                setJustification(e.target.value);
                if (error) setError('');
              }}
              className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 focus:bg-white"
            />
            {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-lg shadow-xs flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Contestar e Devolver ao CSM</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2b. Modal: Analista reprova erro e encaminha para parecer final da Qualidade
export const RejectByAnalystModal: React.FC<{
  isOpen: boolean;
  ticket: Ticket;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ isOpen, ticket, onClose, onSuccess }) => {
  const { rejectByAnalyst } = useWorkflow();
  const [justification, setJustification] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) {
      setError('A fundamentação técnica da reprovação é obrigatória.');
      return;
    }
    try {
      setSubmitting(true);
      await rejectByAnalyst(ticket.id, justification.trim());
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha ao registrar reprovação no Firebase.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-orange-50/50">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-orange-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Reprovar Chamado & Encaminhar à Qualidade
              </h3>
              <span className="text-[11px] text-orange-800">
                {ticket.code} · Parecer do Analista / Supervisor
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div className="p-2.5 bg-orange-50/80 border border-orange-200 rounded-lg text-xs text-orange-900 leading-relaxed">
            <strong>Atenção:</strong> Ao reprovar este erro, o chamado passará para{' '}
            <code className="font-bold">REPROVADO_ANALISTA</code> e irá para a tela de{' '}
            <strong>"Erros Reprovados"</strong> do perfil de <strong>Qualidade</strong>, que dará o parecer final deliberando se aprova o chamado ou se confirma a reprovação.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Justificativa Técnica da Reprovação *
            </label>
            <textarea
              rows={4}
              placeholder="Explique os motivos técnicos pelos quais o erro está sendo reprovado (ex: comportamento esperado do sistema, regra de negócio já definida, parametrização operacional incorreta)..."
              value={justification}
              onChange={(e) => {
                setJustification(e.target.value);
                if (error) setError('');
              }}
              className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50 focus:bg-white"
            />
            {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 text-xs font-semibold bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg shadow-xs flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Reprovar e Enviar para Parecer da Qualidade</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. Modal: CSM edita chamado contestado e reenvia à triagem
export const ResubmitInfoModal: React.FC<{
  isOpen: boolean;
  ticket: Ticket;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ isOpen, ticket, onClose, onSuccess }) => {
  const { resubmitByCSM } = useWorkflow();

  // Estados dos campos do chamado editáveis pelo CSM
  const [analystCell, setAnalystCell] = useState(ticket.analystCell || ticket.category || '');
  const [analystName, setAnalystName] = useState(ticket.analystName || '');
  const [clientName, setClientName] = useState(ticket.clientName || '');
  const [clientSegment, setClientSegment] = useState(ticket.clientSegment || 'Corporativo');
  const [severity, setSeverity] = useState(ticket.severity || 'MEDIA');
  const [analysisDate, setAnalysisDate] = useState(ticket.analysisDate || new Date().toISOString().split('T')[0]);
  const [errorReasonDC, setErrorReasonDC] = useState(ticket.errorReasonDC || ticket.title || '');
  const [impactedEmployeesCount, setImpactedEmployeesCount] = useState<number | ''>(
    ticket.impactedEmployeesCount !== undefined ? ticket.impactedEmployeesCount : ''
  );
  const [impactedCompetenciesCount, setImpactedCompetenciesCount] = useState<number | ''>(
    ticket.impactedCompetenciesCount !== undefined ? ticket.impactedCompetenciesCount : ''
  );
  const [documentList, setDocumentList] = useState(ticket.documentList || '');
  const [description, setDescription] = useState(ticket.description || '');
  const [reproductionSteps, setReproductionSteps] = useState(ticket.reproductionSteps || '');

  // Anexos
  const [currentAttachments, setCurrentAttachments] = useState<Attachment[]>(ticket.attachments || []);
  const [attName, setAttName] = useState('');
  const [attUrl, setAttUrl] = useState('');

  // Resposta/esclarecimento das correções
  const [responseNotes, setResponseNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sincroniza se o ticket mudar
  React.useEffect(() => {
    if (ticket) {
      setAnalystCell(ticket.analystCell || ticket.category || '');
      setAnalystName(ticket.analystName || '');
      setClientName(ticket.clientName || '');
      setClientSegment(ticket.clientSegment || 'Corporativo');
      setSeverity(ticket.severity || 'MEDIA');
      setAnalysisDate(ticket.analysisDate || new Date().toISOString().split('T')[0]);
      setErrorReasonDC(ticket.errorReasonDC || ticket.title || '');
      setImpactedEmployeesCount(ticket.impactedEmployeesCount !== undefined ? ticket.impactedEmployeesCount : '');
      setImpactedCompetenciesCount(ticket.impactedCompetenciesCount !== undefined ? ticket.impactedCompetenciesCount : '');
      setDocumentList(ticket.documentList || '');
      setDescription(ticket.description || '');
      setReproductionSteps(ticket.reproductionSteps || '');
      setCurrentAttachments(ticket.attachments || []);
    }
  }, [ticket]);

  if (!isOpen) return null;

  const handleAddAtt = () => {
    if (!attName.trim()) return;
    setCurrentAttachments((prev) => [
      ...prev,
      {
        id: `att-edit-${Date.now()}`,
        name: attName.trim(),
        url: attUrl.trim() || 'https://exemplo.com/documento.pdf',
        size: '1.2 MB',
        type: attName.includes('.txt') || attName.includes('.log') ? 'log' : 'doc',
      },
    ]);
    setAttName('');
    setAttUrl('');
  };

  const handleRemoveAtt = (id: string) => {
    setCurrentAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setError('O nome do cliente é obrigatório.');
      return;
    }
    if (!errorReasonDC.trim()) {
      setError('O motivo do erro (DC) é obrigatório.');
      return;
    }
    try {
      setSubmitting(true);
      await resubmitByCSM(
        ticket.id,
        responseNotes.trim() || 'Informações e campos corrigidos pelo CSM conforme apontamento do Analista.',
        [],
        {
          analystCell: analystCell.trim(),
          analystName: analystName.trim(),
          clientName: clientName.trim(),
          clientSegment,
          severity,
          analysisDate,
          documentList: documentList.trim(),
          errorReasonDC: errorReasonDC.trim(),
          impactedEmployeesCount: impactedEmployeesCount === '' ? 0 : Number(impactedEmployeesCount),
          impactedCompetenciesCount: impactedCompetenciesCount === '' ? 0 : Number(impactedCompetenciesCount),
          description: description.trim(),
          reproductionSteps: reproductionSteps.trim(),
          attachments: currentAttachments,
          title: `${errorReasonDC.trim()} - ${clientName.trim()}`,
        }
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha ao gravar correções no Firebase.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-blue-50/50 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Editar Chamado Contestado & Devolver à Triagem
              </h3>
              <span className="text-[11px] text-blue-800">
                {ticket.code} · Edição e Correção de Informações pelo CSM
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Apontamento do Analista */}
          {(ticket.missingInfoRequest || ticket.contestJustification) && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Apontamento do Analista ({ticket.missingInfoRequest?.requestedBy || ticket.contestJustification?.contestedBy}):
                </span>
              </div>
              <p className="italic text-slate-800 leading-relaxed pl-5">
                "{ticket.missingInfoRequest?.question || ticket.contestJustification?.reason}"
              </p>
            </div>
          )}

          <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-lg text-xs text-blue-900 leading-snug">
            <strong>Modo de Edição Ativo:</strong> Você pode alterar quaisquer campos do chamado abaixo para corrigir as informações solicitadas pelo Analista antes de reenviar para a triagem.
          </div>

          {/* Grupo 1: Dados do Chamado (DC) */}
          <div className="space-y-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Dados do Erro (DC)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Célula do Analista */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Célula do Analista
                </label>
                <input
                  type="text"
                  value={analystCell}
                  onChange={(e) => setAnalystCell(e.target.value)}
                  placeholder="Ex: Célula Fiscal / Folha"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Nome do Analista */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Analista
                </label>
                <input
                  type="text"
                  value={analystName}
                  onChange={(e) => setAnalystName(e.target.value)}
                  placeholder="Ex: Carlos Mendes"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Cliente */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cliente *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nome do cliente"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Segmento */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Segmento do Cliente
                </label>
                <select
                  value={clientSegment}
                  onChange={(e) => setClientSegment(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Corporativo">Corporativo</option>
                  <option value="Enterprise">Enterprise</option>
                  <option value="PME">PME</option>
                  <option value="Governo">Governo</option>
                  <option value="Varejo">Varejo</option>
                  <option value="Financeiro">Financeiro</option>
                </select>
              </div>

              {/* Data da Análise */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data da Análise
                </label>
                <input
                  type="date"
                  value={analysisDate}
                  onChange={(e) => setAnalysisDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Severidade */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Severidade
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="BAIXA">Baixa</option>
                  <option value="MEDIA">Média</option>
                  <option value="ALTA">Alta</option>
                  <option value="CRITICA">Crítica</option>
                </select>
              </div>

              {/* Motivo do Erro - DC */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo do Erro - DC *
                </label>
                <input
                  type="text"
                  value={errorReasonDC}
                  onChange={(e) => setErrorReasonDC(e.target.value)}
                  placeholder="Ex: Divergência de Cálculo de Horas Extras"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Colaboradores Impactados */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Colaboradores Impactados
                </label>
                <input
                  type="number"
                  min="0"
                  value={impactedEmployeesCount}
                  onChange={(e) => setImpactedEmployeesCount(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  placeholder="0"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Competências Impactadas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Competências Impactadas
                </label>
                <input
                  type="number"
                  min="0"
                  value={impactedCompetenciesCount}
                  onChange={(e) => setImpactedCompetenciesCount(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  placeholder="0"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Grupo 2: Documentos e Descrição */}
          <div className="space-y-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Documentos & Descrição do Problema
            </span>

            {/* Listagem de Documentos */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Listagem de Documentos (Corrigida / Atualizada)
              </label>
              <textarea
                rows={3}
                value={documentList}
                onChange={(e) => setDocumentList(e.target.value)}
                placeholder="Relacione os documentos analisados (ex: Espelho de Ponto Março/2026, Holerites Lote 04, Relatório de Rubricas 102/103)..."
                className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
              />
            </div>

            {/* Descrição do Erro & Impacto */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descrição do Erro & Impacto
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes completos sobre o comportamento incorreto observado..."
                className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Passo a Passo de Reprodução */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Passo a Passo de Reprodução
              </label>
              <textarea
                rows={2}
                value={reproductionSteps}
                onChange={(e) => setReproductionSteps(e.target.value)}
                placeholder="1. Acessar tela X... 2. Filtrar por... 3. Clicar em calcular..."
                className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          {/* Grupo 3: Anexos e Evidências */}
          <div className="space-y-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Anexos & Evidências ({currentAttachments.length})
            </span>

            {/* Lista de anexos existentes */}
            {currentAttachments.length > 0 && (
              <div className="space-y-1.5">
                {currentAttachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Upload className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{att.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAtt(att.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remover anexo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Adicionar novo anexo */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome do novo arquivo (ex: print_erro.png, logs.txt)..."
                value={attName}
                onChange={(e) => setAttName(e.target.value)}
                className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddAtt}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {/* Grupo 4: Resposta / Esclarecimento para o Analista */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Esclarecimento sobre a Correção para o Analista *
            </label>
            <textarea
              rows={3}
              placeholder="Descreva o que foi corrigido ou complementado (ex: Documentos atualizados conforme solicitado, dados do cliente corrigidos, nova evidência anexada)..."
              value={responseNotes}
              onChange={(e) => {
                setResponseNotes(e.target.value);
                if (error) setError('');
              }}
              className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
            />
            {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
          </div>

          {/* Rodapé com botões de ação */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 sticky bottom-0 bg-white py-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Salvar Alterações e Reenviar à Triagem</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 4. Modal: Deliberação Conclusiva da Qualidade (Aprovar ou Reprovar)
export const QualityVerdictModal: React.FC<{
  isOpen: boolean;
  ticket: Ticket;
  verdictType: 'APROVAR' | 'REPROVAR';
  onClose: () => void;
  onSuccess: () => void;
}> = ({ isOpen, ticket, verdictType, onClose, onSuccess }) => {
  const { approveByQuality, rejectByQuality } = useWorkflow();
  const [report, setReport] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const isApproval = verdictType === 'APROVAR';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report.trim()) {
      setError('O parecer técnico e fundamentação da Qualidade são obrigatórios.');
      return;
    }

    try {
      setSubmitting(true);
      if (isApproval) {
        await approveByQuality(ticket.id, report.trim());
      } else {
        await rejectByQuality(ticket.id, report.trim());
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha ao registrar laudo final no Firebase.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        <div
          className={`flex items-center justify-between p-4 border-b border-slate-200 ${
            isApproval ? 'bg-teal-50/50' : 'bg-rose-50/50'
          }`}
        >
          <div className="flex items-center gap-2">
            {isApproval ? (
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600" />
            )}
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isApproval
                  ? 'Aprovação Conclusiva pela Qualidade'
                  : 'Reprovação Conclusiva pela Qualidade'}
              </h3>
              <span
                className={`text-[11px] ${
                  isApproval ? 'text-teal-800' : 'text-rose-800'
                }`}
              >
                {ticket.code} · Decisão Final de Auditoria
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {ticket.contestJustification && (
            <div className="p-2.5 bg-slate-100 rounded-lg text-xs text-slate-700 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-0.5">
                Contestação apresentada pelo Analista ({ticket.contestJustification.contestedBy}):
              </span>
              <p className="italic text-slate-600">
                "{ticket.contestJustification.reason}"
              </p>
            </div>
          )}

          <p className="text-xs text-slate-600 leading-relaxed">
            {isApproval ? (
              <span>
                Esta decisão tornará o chamado{' '}
                <strong className="text-teal-700">APROVADO_QUALIDADE</strong> (Estado
                Final). Confirma que a contestação foi indeferida e o defeito é
                legítimo.
              </span>
            ) : (
              <span>
                Esta decisão tornará o chamado{' '}
                <strong className="text-rose-700">REPROVADO_QUALIDADE</strong> (Estado
                Final). Confirma o encerramento por improcedência ou conformidade.
              </span>
            )}
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Laudo / Parecer Técnico Conclusivo da Qualidade *
            </label>
            <textarea
              rows={4}
              placeholder={
                isApproval
                  ? 'Fundamente por que a contestação do analista não se sustenta e o erro deve ser homologado para correção...'
                  : 'Fundamente por que o sistema operou conforme o esperado ou declare os motivos da improcedência do chamado...'
              }
              value={report}
              onChange={(e) => {
                setReport(e.target.value);
                if (error) setError('');
              }}
              className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
            />
            {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-1.5 text-xs font-semibold text-white rounded-lg shadow-xs flex items-center gap-1.5 ${
                isApproval
                  ? 'bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400'
                  : 'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400'
              }`}
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isApproval ? 'Emitir Aprovação Final' : 'Emitir Reprovação Final'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
