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
              <span className="text-[11px] text-amber-800 font-mono">
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
              <span className="text-[11px] text-amber-800 font-mono">
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
              <span className="text-[11px] text-orange-800 font-mono">
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

// 3. Modal: CSM responde às informações faltantes e reenvia à triagem
export const ResubmitInfoModal: React.FC<{
  isOpen: boolean;
  ticket: Ticket;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ isOpen, ticket, onClose, onSuccess }) => {
  const { resubmitByCSM } = useWorkflow();
  const [responseNotes, setResponseNotes] = useState('');
  const [attName, setAttName] = useState('');
  const [attUrl, setAttUrl] = useState('');
  const [newAttachments, setNewAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddAtt = () => {
    if (!attName.trim()) return;
    setNewAttachments((prev) => [
      ...prev,
      {
        id: `att-resub-${Date.now()}`,
        name: attName.trim(),
        url: attUrl.trim() || 'https://exemplo.com/novolog.txt',
        size: '800 KB',
      },
    ]);
    setAttName('');
    setAttUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseNotes.trim()) {
      setError('Por favor responda aos apontamentos feitos pelo Analista.');
      return;
    }
    try {
      setSubmitting(true);
      await resubmitByCSM(ticket.id, responseNotes.trim(), newAttachments);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha ao reenviar ao Firebase.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-blue-50/50">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Complementar Informações & Reenviar à Triagem
              </h3>
              <span className="text-[11px] text-blue-800 font-mono">
                {ticket.code} · Ação do CSM
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {ticket.missingInfoRequest && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
              <span className="font-bold block mb-1">
                Solicitação enviada por {ticket.missingInfoRequest.requestedBy}:
              </span>
              <p className="italic text-slate-700">
                "{ticket.missingInfoRequest.question}"
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Sua Resposta / Informações Complementares *
            </label>
            <textarea
              rows={4}
              placeholder="Insira aqui as respostas fornecidas pelo cliente, IDs de transação adicionais, novos esclarecimentos..."
              value={responseNotes}
              onChange={(e) => {
                setResponseNotes(e.target.value);
                if (error) setError('');
              }}
              className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
            />
            {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
          </div>

          {/* New Attachments */}
          <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
            <span className="block text-xs font-semibold text-slate-800 mb-1.5">
              Anexar Novos Arquivos ou Logs
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome do arquivo adicional..."
                value={attName}
                onChange={(e) => setAttName(e.target.value)}
                className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddAtt}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
            {newAttachments.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-slate-700">
                {newAttachments.map((a) => (
                  <li key={a.id} className="flex items-center gap-1.5">
                    <Upload className="w-3 h-3 text-blue-600" />
                    <span>{a.name}</span>
                  </li>
                ))}
              </ul>
            )}
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
              className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg shadow-xs flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Reenviar à Fila de Triagem</span>
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
                className={`text-[11px] font-mono ${
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
