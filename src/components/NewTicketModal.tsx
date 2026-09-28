import React, { useState } from 'react';
import {
  X,
  Plus,
  AlertCircle,
  Upload,
  Calendar,
  Building2,
  User,
  FileSpreadsheet,
  Users,
  Layers,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';
import { Attachment } from '../types/workflow';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated?: (ticketId: string) => void;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({
  isOpen,
  onClose,
  onTicketCreated,
}) => {
  const { createTicket, currentRole, setCurrentRole, currentUser } = useWorkflow();

  // Os 8 campos obrigatórios solicitados:
  // 1. Célula do Analista
  // 2. Cliente
  // 3. Data da Análise
  // 4. Listagem de documentos
  // 5. Motivo do Erro - DC
  // 6. Nome do Analista
  // 7. Quantidade de colaboradores impactados
  // 8. Quantidade de competências impactadas

  const [analystCell, setAnalystCell] = useState('');
  const [clientName, setClientName] = useState('');
  const [analysisDate, setAnalysisDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [documentList, setDocumentList] = useState('');
  const [errorReasonDC, setErrorReasonDC] = useState('');
  const [analystName, setAnalystName] = useState('');
  const [impactedEmployeesCount, setImpactedEmployeesCount] = useState<number | ''>('');
  const [impactedCompetenciesCount, setImpactedCompetenciesCount] = useState<number | ''>('');

  // Anexos adicionais (opcional)
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddAttachment = () => {
    if (!attachmentName.trim()) return;
    const newAtt: Attachment = {
      id: `att-${Date.now()}`,
      name: attachmentName.trim(),
      url: attachmentUrl.trim() || 'https://exemplo.com/documento.pdf',
      size: '1.2 MB',
      type: attachmentName.includes('.txt') || attachmentName.includes('.log') ? 'log' : 'doc',
    };
    setAttachments((prev) => [...prev, newAtt]);
    setAttachmentName('');
    setAttachmentUrl('');
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!analystCell.trim()) newErrors.analystCell = 'Célula do analista é obrigatória.';
    if (!clientName.trim()) newErrors.clientName = 'Nome do cliente é obrigatório.';
    if (!analysisDate.trim()) newErrors.analysisDate = 'Data da análise é obrigatória.';
    if (!documentList.trim()) newErrors.documentList = 'Listagem de documentos é obrigatória.';
    if (!errorReasonDC.trim()) newErrors.errorReasonDC = 'Motivo do Erro - DC é obrigatório.';
    if (!analystName.trim()) newErrors.analystName = 'Nome do analista é obrigatório.';
    if (impactedEmployeesCount === '' || Number(impactedEmployeesCount) < 0) {
      newErrors.impactedEmployeesCount = 'Informe a quantidade de colaboradores impactados.';
    }
    if (impactedCompetenciesCount === '' || Number(impactedCompetenciesCount) < 0) {
      newErrors.impactedCompetenciesCount = 'Informe a quantidade de competências impactadas.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await createTicket({
        analystCell: analystCell.trim(),
        clientName: clientName.trim(),
        analysisDate,
        documentList: documentList.trim(),
        errorReasonDC: errorReasonDC.trim(),
        analystName: analystName.trim(),
        impactedEmployeesCount: Number(impactedEmployeesCount),
        impactedCompetenciesCount: Number(impactedCompetenciesCount),
        title: `${errorReasonDC.trim()} - ${clientName.trim()}`,
        attachments,
      });

      onClose();
      if (onTicketCreated) {
        onTicketCreated(created.id);
      }
    } catch (err) {
      console.error('Falha ao salvar ticket no Firestore:', err);
      setErrors({ form: 'Erro ao gravar o chamado no banco Firebase.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Abertura de Chamado - Reporte de Erro (DC)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning if current role is not CSM */}
        {currentRole !== 'CSM' && (
          <div className="mx-5 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Você está atualmente no perfil <strong>{currentRole}</strong>. A abertura de chamados pertence ao perfil <strong>CSM/RELACIONAMENTO</strong>.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCurrentRole('CSM')}
              className="text-xs font-semibold text-amber-900 hover:underline shrink-0 ml-2"
            >
              Mudar para CSM
            </button>
          </div>
        )}

        {errors.form && (
          <div className="mx-5 mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {errors.form}
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Seção 1: Célula e Analista */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Célula do Analista */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Célula do Analista <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="celula-sugestoes"
                  placeholder="Ex: Folha de Pagamento, Benefícios, Ponto..."
                  value={analystCell}
                  onChange={(e) => {
                    setAnalystCell(e.target.value);
                    if (errors.analystCell) setErrors((prev) => ({ ...prev, analystCell: '' }));
                  }}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                />
                <datalist id="celula-sugestoes">
                  <option value="Folha de Pagamento" />
                  <option value="Benefícios" />
                  <option value="Ponto Eletrônico" />
                  <option value="Férias & Afastamentos" />
                  <option value="Rescisão & Homologação" />
                  <option value="Fiscal / Tributário" />
                  <option value="Admissão & Cadastro" />
                  <option value="Suporte N2" />
                </datalist>
              </div>
              {errors.analystCell && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.analystCell}</p>
              )}
            </div>

            {/* Nome do Analista */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Nome do Analista <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ex: Rodrigo Santos"
                  value={analystName}
                  onChange={(e) => {
                    setAnalystName(e.target.value);
                    if (errors.analystName) setErrors((prev) => ({ ...prev, analystName: '' }));
                  }}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                />
              </div>
              {errors.analystName && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.analystName}</p>
              )}
            </div>
          </div>

          {/* Seção 2: Cliente e Data da Análise */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Cliente */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Cliente <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Grupo Carrefour Brasil"
                value={clientName}
                onChange={(e) => {
                  setClientName(e.target.value);
                  if (errors.clientName) setErrors((prev) => ({ ...prev, clientName: '' }));
                }}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
              />
              {errors.clientName && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.clientName}</p>
              )}
            </div>

            {/* Data da Análise */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Data da Análise <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={analysisDate}
                  onChange={(e) => {
                    setAnalysisDate(e.target.value);
                    if (errors.analysisDate) setErrors((prev) => ({ ...prev, analysisDate: '' }));
                  }}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                />
              </div>
              {errors.analysisDate && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.analysisDate}</p>
              )}
            </div>
          </div>

          {/* Seção 3: Motivo do Erro - DC */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Motivo do Erro - DC <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              list="motivo-dc-sugestoes"
              placeholder="Ex: Divergência de Cálculo de Horas Extras, Rubrica não parametrizada, Inconsistência de INSS..."
              value={errorReasonDC}
              onChange={(e) => {
                setErrorReasonDC(e.target.value);
                if (errors.errorReasonDC) setErrors((prev) => ({ ...prev, errorReasonDC: '' }));
              }}
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
            />
            <datalist id="motivo-dc-sugestoes">
              <option value="Divergência de Cálculo de Horas Extras" />
              <option value="Divergência no Desconto de INSS / FGTS" />
              <option value="Rubrica não parametrizada na Folha" />
              <option value="Erro no Fechamento de Ponto" />
              <option value="Incompatibilidade de Layout de Importação" />
              <option value="Diferença na Apuração de DSR" />
              <option value="Falta de Integração Bancária" />
            </datalist>
            {errors.errorReasonDC && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.errorReasonDC}</p>
            )}
          </div>

          {/* Seção 4: Quantidades de Impacto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Quantidade de colaboradores impactados */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Quantidade de colaboradores impactados <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Ex: 45"
                value={impactedEmployeesCount}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                  setImpactedEmployeesCount(val);
                  if (errors.impactedEmployeesCount) {
                    setErrors((prev) => ({ ...prev, impactedEmployeesCount: '' }));
                  }
                }}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
              />
              {errors.impactedEmployeesCount && (
                <p className="text-[11px] text-rose-600 mt-1">
                  {errors.impactedEmployeesCount}
                </p>
              )}
            </div>

            {/* Quantidade de competências impactadas */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Quantidade de competências impactadas <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Ex: 2 (Ex: 01/2026 e 02/2026)"
                value={impactedCompetenciesCount}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                  setImpactedCompetenciesCount(val);
                  if (errors.impactedCompetenciesCount) {
                    setErrors((prev) => ({ ...prev, impactedCompetenciesCount: '' }));
                  }
                }}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
              />
              {errors.impactedCompetenciesCount && (
                <p className="text-[11px] text-rose-600 mt-1">
                  {errors.impactedCompetenciesCount}
                </p>
              )}
            </div>
          </div>

          {/* Seção 5: Listagem de documentos */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Listagem de documentos <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Relacione os documentos analisados (ex: Espelho de Ponto Março/2026, Holerites Lote 04, Relatório de Rubricas 102/103, TRCT colaborador João da Silva)..."
              value={documentList}
              onChange={(e) => {
                setDocumentList(e.target.value);
                if (errors.documentList) setErrors((prev) => ({ ...prev, documentList: '' }));
              }}
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white leading-relaxed"
            />
            {errors.documentList && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.documentList}</p>
            )}
          </div>

          {/* Seção 6: Anexos e Evidências Opcionais */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-800">
                Anexos & Links de Evidências (Opcional)
              </span>
              <span className="text-[10px] text-slate-500">
                {attachments.length} anexo(s) adicionado(s)
              </span>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-1.5 mb-2.5">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2 bg-white rounded border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Upload className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">
                        {att.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                placeholder="Nome do arquivo ou descrição (ex: holerite_divergente.pdf)"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Link/URL ou hash (opcional)"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddAttachment}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg shadow-xs transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Salvando no Firebase...</span>
                </>
              ) : (
                <span>Abrir Chamado de Erro</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
