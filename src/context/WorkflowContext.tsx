import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Ticket,
  UserRole,
  UserProfile,
  TicketStatus,
  TicketSeverity,
  Attachment,
  TimelineEvent,
} from '../types/workflow';
import { USER_PROFILES } from '../data/statusConfig';

interface WorkflowContextType {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: UserProfile;
  metrics: {
    total: number;
    novoAguardandoTriagem: number;
    informacoesFaltando: number;
    emContestacaoQualidade: number;
    aprovadosAnalista: number;
    reprovadosAnalista: number;
    aprovadosQualidade: number;
    aprovadosTotal: number;
    reprovadosQualidade: number;
    finalizadosTotal: number;
    taxaAprovacao: number; // 0 - 100
    pendingForCurrentRole: number;
  };
  createTicket: (data: {
    analystCell: string;
    clientName: string;
    analysisDate: string;
    documentList: string;
    errorReasonDC: string;
    analystName: string;
    impactedEmployeesCount: number;
    impactedCompetenciesCount: number;
    title?: string;
    clientSegment?: string;
    category?: string;
    severity?: TicketSeverity;
    description?: string;
    reproductionSteps?: string;
    attachments?: Attachment[];
  }) => Promise<Ticket>;
  requestMoreInfo: (ticketId: string, question: string) => Promise<void>;
  approveByAnalyst: (ticketId: string, notes: string) => Promise<void>;
  contestByAnalyst: (ticketId: string, justification: string) => Promise<void>;
  rejectByAnalyst: (ticketId: string, justification: string) => Promise<void>;
  resubmitByCSM: (
    ticketId: string,
    responseNotes: string,
    additionalAttachments?: Attachment[],
    updatedFields?: {
      analystCell?: string;
      analystName?: string;
      clientName?: string;
      clientSegment?: string;
      category?: string;
      severity?: TicketSeverity;
      analysisDate?: string;
      documentList?: string;
      errorReasonDC?: string;
      impactedEmployeesCount?: number;
      impactedCompetenciesCount?: number;
      description?: string;
      reproductionSteps?: string;
      attachments?: Attachment[];
      title?: string;
    }
  ) => Promise<void>;
  approveByQuality: (ticketId: string, report: string) => Promise<void>;
  rejectByQuality: (ticketId: string, report: string) => Promise<void>;
  addComment: (ticketId: string, message: string) => Promise<void>;
  deleteTicket: (ticketId: string) => Promise<void>;
  getTicketById: (ticketId: string) => Ticket | undefined;
}

const ROLE_KEY = 'nexus_qa_active_role_v1';
const TICKETS_COLLECTION = 'tickets';

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const WorkflowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(ROLE_KEY) as UserRole;
      if (saved && (saved === 'CSM' || saved === 'ANALISTA' || saved === 'QUALIDADE')) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'ANALISTA';
  });

  // Real-time synchronization with Firebase Firestore
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Remove any legacy mock localStorage data to keep store clean
    try {
      localStorage.removeItem('nexus_qa_tickets_v1');
    } catch {
      // ignore
    }

    try {
      const ticketsRef = collection(db, TICKETS_COLLECTION);
      const q = query(ticketsRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: Ticket[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Ticket;
            list.push({
              ...data,
              id: docSnap.id,
              // sanitize arrays and fields
              attachments: data.attachments || [],
              timeline: data.timeline || [],
            });
          });
          setTickets(list);
          setError(null);
          setLoading(false);
        },
        (err) => {
          console.error('Erro na conexão com o Firestore:', err);
          if (err?.code === 'unavailable') {
            // Em modo offline ou reconectando
            setError('Conexão temporariamente instável. O sistema tentará reconectar automaticamente.');
          } else {
            setError(err.message || 'Falha ao sincronizar com o Firebase');
          }
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      console.error('Falha ao instanciar listener do Firestore:', err);
      setError(err?.message || 'Erro inesperado no banco de dados');
      setLoading(false);
    }
  }, []);

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    try {
      localStorage.setItem(ROLE_KEY, role);
    } catch {
      // ignore
    }
  };

  const currentUser = useMemo(() => USER_PROFILES[currentRole], [currentRole]);

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = tickets.length;
    const novoAguardandoTriagem = tickets.filter(
      (t) => t.status === 'NOVO_AGUARDANDO_TRIAGEM'
    ).length;
    const informacoesFaltando = tickets.filter(
      (t) => t.status === 'INFORMACOES_FALTANDO'
    ).length;
    const emContestacaoQualidade = tickets.filter(
      (t) => t.status === 'EM_CONTESTACAO_QUALIDADE'
    ).length;
    const aprovadosAnalista = tickets.filter(
      (t) => t.status === 'APROVADO_ANALISTA'
    ).length;
    const reprovadosAnalista = tickets.filter(
      (t) => t.status === 'REPROVADO_ANALISTA' || t.status === 'EM_CONTESTACAO_QUALIDADE'
    ).length;
    const aprovadosQualidade = tickets.filter(
      (t) => t.status === 'APROVADO_QUALIDADE'
    ).length;
    const reprovadosQualidade = tickets.filter(
      (t) => t.status === 'REPROVADO_QUALIDADE'
    ).length;

    const aprovadosTotal = aprovadosAnalista + aprovadosQualidade;
    const finalizadosTotal = aprovadosQualidade + reprovadosQualidade;
    const taxaAprovacao =
      finalizadosTotal > 0 ? Math.round((aprovadosQualidade / finalizadosTotal) * 100) : 0;

    let pendingForCurrentRole = 0;
    if (currentRole === 'ANALISTA') {
      pendingForCurrentRole = novoAguardandoTriagem;
    } else if (currentRole === 'CSM') {
      pendingForCurrentRole = informacoesFaltando;
    } else if (currentRole === 'QUALIDADE') {
      pendingForCurrentRole = aprovadosAnalista + reprovadosAnalista;
    }

    return {
      total,
      novoAguardandoTriagem,
      informacoesFaltando,
      emContestacaoQualidade,
      aprovadosAnalista,
      reprovadosAnalista,
      aprovadosQualidade,
      aprovadosTotal,
      reprovadosQualidade,
      finalizadosTotal,
      taxaAprovacao,
      pendingForCurrentRole,
    };
  }, [tickets, currentRole]);

  // 1. Create ticket (CSM) -> Persists in Firebase
  const createTicket = async (data: {
    analystCell: string;
    clientName: string;
    analysisDate: string;
    documentList: string;
    errorReasonDC: string;
    analystName: string;
    impactedEmployeesCount: number;
    impactedCompetenciesCount: number;
    title?: string;
    clientSegment?: string;
    category?: string;
    severity?: TicketSeverity;
    description?: string;
    reproductionSteps?: string;
    attachments?: Attachment[];
  }): Promise<Ticket> => {
    const timestamp = new Date().toISOString();
    const nextNumber = tickets.length + 1;
    const code = `ERR-2026-${String(nextNumber).padStart(4, '0')}`;
    const newDocRef = doc(collection(db, TICKETS_COLLECTION));
    const id = newDocRef.id;

    const chosenSeverity = data.severity || 'MEDIA';
    const chosenCategory = data.category || 'Geral';
    const chosenSegment = data.clientSegment || 'Corporativo';
    const finalTitle =
      data.title?.trim() || `${data.errorReasonDC} - ${data.clientName}`;
    const finalDescription =
      data.description?.trim() ||
      `Erro apontado na célula ${data.analystCell} pelo analista ${data.analystName}.\nMotivo DC: ${data.errorReasonDC}\nDocumentos: ${data.documentList}\nColaboradores impactados: ${data.impactedEmployeesCount} | Competências impactadas: ${data.impactedCompetenciesCount}`;

    const initialEvent: TimelineEvent = {
      id: `evt-${Date.now()}-1`,
      timestamp,
      authorRole: currentRole,
      authorName: currentUser.name,
      actionType: 'CRIACAO',
      title: 'Chamado Aberto pelo CSM',
      description: `Reporte de erro cadastrado para o cliente ${data.clientName} (Célula: ${data.analystCell}, Analista: ${data.analystName}, Motivo: ${data.errorReasonDC}).`,
      newStatus: 'NOVO_AGUARDANDO_TRIAGEM',
      attachments: data.attachments || [],
    };

    const newTicket: Ticket = {
      id,
      code,
      title: finalTitle,
      clientName: data.clientName,
      clientSegment: chosenSegment,
      category: chosenCategory,
      severity: chosenSeverity,
      description: finalDescription,
      analystCell: data.analystCell,
      analysisDate: data.analysisDate,
      documentList: data.documentList,
      errorReasonDC: data.errorReasonDC,
      analystName: data.analystName,
      impactedEmployeesCount: Number(data.impactedEmployeesCount) || 0,
      impactedCompetenciesCount: Number(data.impactedCompetenciesCount) || 0,
      reproductionSteps: data.reproductionSteps || '',
      attachments: data.attachments || [],
      status: 'NOVO_AGUARDANDO_TRIAGEM',
      createdAt: timestamp,
      updatedAt: timestamp,
      createdByName: currentUser.name,
      createdByRole: currentRole,
      timeline: [initialEvent],
    };

    await setDoc(newDocRef, newTicket);
    return newTicket;
  };

  // 2a. Request more info (Analista -> CSM) -> Updates Firebase
  const requestMoreInfo = async (ticketId: string, question: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const timestamp = new Date().toISOString();
    const event: TimelineEvent = {
      id: `evt-${Date.now()}`,
      timestamp,
      authorRole: 'ANALISTA',
      authorName: currentUser.name,
      actionType: 'SOLICITACAO_INFO',
      title: 'Solicitação de Informações Adicionais',
      description:
        'O Analista/Supervisor analisou a triagem e identificou dados pendentes antes de prosseguir.',
      previousStatus: ticket.status,
      newStatus: 'INFORMACOES_FALTANDO',
      notes: question,
    };

    const docRef = doc(db, TICKETS_COLLECTION, ticketId);
    await updateDoc(docRef, {
      status: 'INFORMACOES_FALTANDO',
      updatedAt: timestamp,
      missingInfoRequest: {
        requestedAt: timestamp,
        requestedBy: currentUser.name,
        question,
      },
      timeline: [event, ...ticket.timeline],
    });
  };

  // 2b. Approve error by Analyst (Analista -> Qualidade analisar o erro)
  const approveByAnalyst = async (ticketId: string, notes: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const timestamp = new Date().toISOString();
    const event: TimelineEvent = {
      id: `evt-${Date.now()}`,
      timestamp,
      authorRole: 'ANALISTA',
      authorName: currentUser.name,
      actionType: 'APROVACAO_ANALISTA',
      title: 'Erro Aprovado pelo Analista · Encaminhado à Qualidade',
      description:
        'O Analista/Supervisor validou e aprovou tecnicamente o erro. Encaminhado para análise e validação da equipe de Qualidade.',
      previousStatus: ticket.status,
      newStatus: 'APROVADO_ANALISTA',
      notes,
    };

    const docRef = doc(db, TICKETS_COLLECTION, ticketId);
    await updateDoc(docRef, {
      status: 'APROVADO_ANALISTA',
      updatedAt: timestamp,
      analystReview: {
        reviewedAt: timestamp,
        analystName: currentUser.name,
        decision: 'APROVADO',
        notes,
      },
      timeline: [event, ...ticket.timeline],
    });
  };

  // 2c. Contest error by Analyst (Analista -> Retorna para CSM informando falta de informações)
  const contestByAnalyst = async (ticketId: string, justification: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const timestamp = new Date().toISOString();
    const event: TimelineEvent = {
      id: `evt-${Date.now()}`,
      timestamp,
      authorRole: 'ANALISTA',
      authorName: currentUser.name,
      actionType: 'CONTESTACAO_ANALISTA',
      title: 'Chamado Contestado pelo Analista · Informações Faltando',
      description:
        'O Analista/Supervisor contestou o chamado informando que faltam informações essenciais. Retornado para o CSM na tela de Erros Contestados.',
      previousStatus: ticket.status,
      newStatus: 'INFORMACOES_FALTANDO',
      notes: justification,
    };

    const docRef = doc(db, TICKETS_COLLECTION, ticketId);
    await updateDoc(docRef, {
      status: 'INFORMACOES_FALTANDO',
      updatedAt: timestamp,
      analystReview: {
        reviewedAt: timestamp,
        analystName: currentUser.name,
        decision: 'CONTESTADO',
        notes: justification,
      },
      missingInfoRequest: {
        requestedAt: timestamp,
        requestedBy: currentUser.name,
        question: justification,
      },
      timeline: [event, ...ticket.timeline],
    });
  };

  // 2d. Reprove error by Analyst (Analista -> Qualidade dar o parecer final)
  const rejectByAnalyst = async (ticketId: string, justification: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const timestamp = new Date().toISOString();
    const event: TimelineEvent = {
      id: `evt-${Date.now()}`,
      timestamp,
      authorRole: 'ANALISTA',
      authorName: currentUser.name,
      actionType: 'REPROVACAO_ANALISTA',
      title: 'Erro Reprovado pelo Analista · Encaminhado à Qualidade',
      description:
        'O Analista/Supervisor reprovou o erro e enviou para o perfil da Qualidade emitir o parecer final (se aprova ou se reprova definitivamente).',
      previousStatus: ticket.status,
      newStatus: 'REPROVADO_ANALISTA',
      notes: justification,
    };

    const docRef = doc(db, TICKETS_COLLECTION, ticketId);
    await updateDoc(docRef, {
      status: 'REPROVADO_ANALISTA',
      updatedAt: timestamp,
      analystReview: {
        reviewedAt: timestamp,
        analystName: currentUser.name,
        decision: 'REPROVADO',
        notes: justification,
      },
      contestJustification: {
        contestedAt: timestamp,
        contestedBy: currentUser.name,
        reason: justification,
      },
      timeline: [event, ...ticket.timeline],
    });
  };

  // 3. CSM responds to missing info (CSM -> Analista) -> Updates Firebase
  const resubmitByCSM = async (
    ticketId: string,
    responseNotes: string,
    additionalAttachments?: Attachment[],
    updatedFields?: {
      analystCell?: string;
      analystName?: string;
      clientName?: string;
      clientSegment?: string;
      category?: string;
      severity?: TicketSeverity;
      analysisDate?: string;
      documentList?: string;
      errorReasonDC?: string;
      impactedEmployeesCount?: number;
      impactedCompetenciesCount?: number;
      description?: string;
      reproductionSteps?: string;
      attachments?: Attachment[];
      title?: string;
    }
  ) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const timestamp = new Date().toISOString();
    const finalAttachments = updatedFields?.attachments !== undefined
      ? updatedFields.attachments
      : [
          ...ticket.attachments,
          ...(additionalAttachments || []),
        ];

    const event: TimelineEvent = {
      id: `evt-${Date.now()}`,
      timestamp,
      authorRole: 'CSM',
      authorName: currentUser.name,
      actionType: 'RETORNO_INFO',
      title: 'Chamado Editado & Reenviado pelo CSM',
      description:
        'O CSM editou os campos do chamado, ajustou as informações solicitadas pelo Analista e reenviou para a fila de triagem.',
      previousStatus: ticket.status,
      newStatus: 'NOVO_AGUARDANDO_TRIAGEM',
      notes: responseNotes,
      attachments: additionalAttachments || [],
    };

    const docRef = doc(db, TICKETS_COLLECTION, ticketId);
    const updatePayload: Record<string, any> = {
      status: 'NOVO_AGUARDANDO_TRIAGEM',
      updatedAt: timestamp,
      attachments: finalAttachments,
      missingInfoRequest: null,
      contestJustification: null,
      timeline: [event, ...ticket.timeline],
    };

    if (updatedFields) {
      if (updatedFields.analystCell !== undefined) updatePayload.analystCell = updatedFields.analystCell;
      if (updatedFields.analystName !== undefined) updatePayload.analystName = updatedFields.analystName;
      if (updatedFields.clientName !== undefined) updatePayload.clientName = updatedFields.clientName;
      if (updatedFields.clientSegment !== undefined) updatePayload.clientSegment = updatedFields.clientSegment;
      if (updatedFields.category !== undefined) updatePayload.category = updatedFields.category;
      if (updatedFields.severity !== undefined) updatePayload.severity = updatedFields.severity;
      if (updatedFields.analysisDate !== undefined) updatePayload.analysisDate = updatedFields.analysisDate;
      if (updatedFields.documentList !== undefined) updatePayload.documentList = updatedFields.documentList;
      if (updatedFields.errorReasonDC !== undefined) updatePayload.errorReasonDC = updatedFields.errorReasonDC;
      if (updatedFields.impactedEmployeesCount !== undefined) updatePayload.impactedEmployeesCount = updatedFields.impactedEmployeesCount;
      if (updatedFields.impactedCompetenciesCount !== undefined) updatePayload.impactedCompetenciesCount = updatedFields.impactedCompetenciesCount;
      if (updatedFields.description !== undefined) updatePayload.description = updatedFields.description;
      if (updatedFields.reproductionSteps !== undefined) updatePayload.reproductionSteps = updatedFields.reproductionSteps;

      const newTitle = updatedFields.title || (
        updatedFields.errorReasonDC && updatedFields.clientName
          ? `${updatedFields.errorReasonDC} - ${updatedFields.clientName}`
          : ticket.title
      );
      updatePayload.title = newTitle;
    }

    await updateDoc(docRef, updatePayload);
  };

  // 4a. Quality Approves (Qualidade -> Final) -> Updates Firebase
  const approveByQuality = async (ticketId: string, report: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const timestamp = new Date().toISOString();
    const event: TimelineEvent = {
      id: `evt-${Date.now()}`,
      timestamp,
      authorRole: 'QUALIDADE',
      authorName: currentUser.name,
      actionType: 'APROVACAO_QUALIDADE',
      title: 'Qualidade Aprovou o Erro Reportado (Decisão Final)',
      description:
        'A equipe de Garantia da Qualidade revisou o caso contestado e julgou procedente o erro de sistema.',
      previousStatus: ticket.status,
      newStatus: 'APROVADO_QUALIDADE',
      notes: report,
    };

    const docRef = doc(db, TICKETS_COLLECTION, ticketId);
    await updateDoc(docRef, {
      status: 'APROVADO_QUALIDADE',
      updatedAt: timestamp,
      qualityReview: {
        reviewedAt: timestamp,
        qualitySpecialistName: currentUser.name,
        verdict: 'APROVADO',
        technicalReport: report,
      },
      timeline: [event, ...ticket.timeline],
    });
  };

  // 4b. Quality Rejects (Qualidade -> Final) -> Updates Firebase
  const rejectByQuality = async (ticketId: string, report: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const timestamp = new Date().toISOString();
    const event: TimelineEvent = {
      id: `evt-${Date.now()}`,
      timestamp,
      authorRole: 'QUALIDADE',
      authorName: currentUser.name,
      actionType: 'REPROVACAO_QUALIDADE',
      title: 'Qualidade Reprovou Definitivamente (Decisão Final)',
      description:
        'A equipe de Qualidade emitiu laudo atestando improcedência ou comportamento esperado. Erro definitivamente reprovado.',
      previousStatus: ticket.status,
      newStatus: 'REPROVADO_QUALIDADE',
      notes: report,
    };

    const docRef = doc(db, TICKETS_COLLECTION, ticketId);
    await updateDoc(docRef, {
      status: 'REPROVADO_QUALIDADE',
      updatedAt: timestamp,
      qualityReview: {
        reviewedAt: timestamp,
        qualitySpecialistName: currentUser.name,
        verdict: 'REPROVADO',
        technicalReport: report,
      },
      timeline: [event, ...ticket.timeline],
    });
  };

  // 5. Add general audit comment -> Updates Firebase
  const addComment = async (ticketId: string, message: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const timestamp = new Date().toISOString();
    const event: TimelineEvent = {
      id: `evt-${Date.now()}`,
      timestamp,
      authorRole: currentRole,
      authorName: currentUser.name,
      actionType: 'COMENTARIO',
      title: `Comentário registrado por ${currentUser.name}`,
      description: message,
    };

    const docRef = doc(db, TICKETS_COLLECTION, ticketId);
    await updateDoc(docRef, {
      updatedAt: timestamp,
      timeline: [event, ...ticket.timeline],
    });
  };

  // 6. Delete ticket
  const deleteTicket = async (ticketId: string) => {
    const docRef = doc(db, TICKETS_COLLECTION, ticketId);
    await deleteDoc(docRef);
  };

  const getTicketById = (ticketId: string) => {
    return tickets.find((t) => t.id === ticketId);
  };

  return (
    <WorkflowContext.Provider
      value={{
        tickets,
        loading,
        error,
        currentRole,
        setCurrentRole,
        currentUser,
        metrics,
        createTicket,
        requestMoreInfo,
        approveByAnalyst,
        contestByAnalyst,
        rejectByAnalyst,
        resubmitByCSM,
        approveByQuality,
        rejectByQuality,
        addComment,
        deleteTicket,
        getTicketById,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};
