import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocFromServer,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import {
  Ticket,
  UserRole,
  UserProfile,
  TicketStatus,
  TicketSeverity,
  Attachment,
  TimelineEvent,
  SystemUser,
  ClientRecord,
  CategoryRecord,
} from '../types/workflow';
import { USER_PROFILES, DEFAULT_CLIENTS, DEFAULT_CATEGORIES } from '../data/statusConfig';
import { SIMULATED_ACCOUNTS, DEFAULT_SYSTEM_USERS } from '../data/authUsers';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface WorkflowContextType {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: UserProfile;
  isAuthenticated: boolean;
  login: (emailOrRole: string, password?: string) => Promise<boolean>;
  logout: () => void;
  // Admin State & Management
  systemUsers: SystemUser[];
  clients: ClientRecord[];
  categories: CategoryRecord[];
  clientsList: string[];
  categoriesList: string[];
  saveUser: (user: Partial<SystemUser> & { id?: string }) => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  getSupervisedAnalysts: (managerNameOrId?: string) => string[];
  saveClient: (client: Partial<ClientRecord> & { id?: string }) => Promise<void>;
  deleteClient: (clientId: string) => Promise<void>;
  saveCategory: (category: Partial<CategoryRecord> & { id?: string }) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  metrics: {
    total: number;
    abertosTotal: number;
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
const AUTH_KEY = 'kapy_auth_session_v1';
const TICKETS_CACHE_KEY = 'kapy_tickets_cache_v2';
const TICKETS_COLLECTION = 'tickets';

const USERS_COLLECTION = 'system_users';
const CLIENTS_COLLECTION = 'clients';
const CATEGORIES_COLLECTION = 'categories';

const USERS_CACHE_KEY = 'kapy_users_cache_v1';
const CLIENTS_CACHE_KEY = 'kapy_clients_cache_v1';
const CATEGORIES_CACHE_KEY = 'kapy_categories_cache_v1';

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const WorkflowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial tickets from local cache immediately so the UI is never empty on boot
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const cached = localStorage.getItem(TICKETS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Falha ao carregar cache de chamados:', e);
    }
    return [];
  });

  // System Users state for Administrator management
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(() => {
    try {
      const cached = localStorage.getItem(USERS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_SYSTEM_USERS;
  });

  // Clients state for Administrator management
  const [clients, setClients] = useState<ClientRecord[]>(() => {
    try {
      const cached = localStorage.getItem(CLIENTS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_CLIENTS;
  });

  // Categories state for Administrator management
  const [categories, setCategories] = useState<CategoryRecord[]>(() => {
    try {
      const cached = localStorage.getItem(CATEGORIES_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_CATEGORIES;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(ROLE_KEY) as UserRole;
      if (
        saved &&
        (saved === 'CSM' ||
          saved === 'ANALISTA' ||
          saved === 'QUALIDADE' ||
          saved === 'ADMIN' ||
          saved === 'GESTOR_ANALISTA')
      ) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'ANALISTA';
  });

  // Save tickets to local cache whenever they change
  const saveToCache = (list: Ticket[]) => {
    try {
      localStorage.setItem(TICKETS_CACHE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Falha ao gravar cache de chamados:', e);
    }
  };

  const saveUsersToCache = (list: SystemUser[]) => {
    try {
      localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Falha ao gravar cache de usuários:', e);
    }
  };

  const saveClientsToCache = (list: ClientRecord[]) => {
    try {
      localStorage.setItem(CLIENTS_CACHE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Falha ao gravar cache de clientes:', e);
    }
  };

  const saveCategoriesToCache = (list: CategoryRecord[]) => {
    try {
      localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Falha ao gravar cache de categorias:', e);
    }
  };



  // Real-time synchronization with Firebase Firestore and automatic reconnection
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;
    let isMounted = true;

    const setupListener = () => {
      try {
        const ticketsRef = collection(db, TICKETS_COLLECTION);
        const q = query(ticketsRef, orderBy('createdAt', 'desc'));

        unsubscribeSnapshot = onSnapshot(
          q,
          (snapshot) => {
            if (!isMounted) return;
            const list: Ticket[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as Ticket;
              list.push({
                ...data,
                id: docSnap.id,
                attachments: data.attachments || [],
                timeline: data.timeline || [],
              });
            });

            setTickets(list);
            saveToCache(list);
            setError(null);
            setLoading(false);
          },
          (err) => {
            if (!isMounted) return;
            console.warn('Aviso de conexão do Firestore:', err);

            // Handle offline / unavailable without breaking UI
            if (
              err?.code === 'unavailable' ||
              err?.message?.includes('offline') ||
              err?.message?.includes('unavailable')
            ) {
              // The client will operate with cached data seamlessly.
              // Schedule automatic retry to reconnect
              if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
              }
              reconnectTimeoutRef.current = setTimeout(() => {
                if (isMounted) {
                  setupListener();
                }
              }, 4000);
            } else if (err?.code === 'permission-denied') {
              handleFirestoreError(err, OperationType.LIST, TICKETS_COLLECTION);
            } else {
              setError(err.message || 'Falha ao sincronizar com o Firebase');
            }
            setLoading(false);
          }
        );
      } catch (err: any) {
        if (!isMounted) return;
        console.warn('Falha ao registrar listener do Firestore:', err);
        setLoading(false);
      }
    };

    setupListener();

    // 2. Real-time synchronization for System Users
    let unsubscribeUsers: (() => void) | null = null;
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      unsubscribeUsers = onSnapshot(
        usersRef,
        (snapshot) => {
          if (!isMounted) return;
          if (!snapshot.empty) {
            const list: SystemUser[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ ...docSnap.data(), id: docSnap.id } as SystemUser);
            });
            setSystemUsers(list);
            saveUsersToCache(list);
          }
        },
        (err) => {
          console.warn('Aviso de conexão do Firestore (system_users):', err);
        }
      );
    } catch (e) {
      console.warn('Erro ao configurar listener de system_users:', e);
    }

    // 3. Real-time synchronization for Clients
    let unsubscribeClients: (() => void) | null = null;
    try {
      const clientsRef = collection(db, CLIENTS_COLLECTION);
      unsubscribeClients = onSnapshot(
        clientsRef,
        (snapshot) => {
          if (!isMounted) return;
          if (!snapshot.empty) {
            const list: ClientRecord[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ ...docSnap.data(), id: docSnap.id } as ClientRecord);
            });
            setClients(list);
            saveClientsToCache(list);
          }
        },
        (err) => {
          console.warn('Aviso de conexão do Firestore (clients):', err);
        }
      );
    } catch (e) {
      console.warn('Erro ao configurar listener de clients:', e);
    }

    // 4. Real-time synchronization for Categories
    let unsubscribeCategories: (() => void) | null = null;
    try {
      const categoriesRef = collection(db, CATEGORIES_COLLECTION);
      unsubscribeCategories = onSnapshot(
        categoriesRef,
        (snapshot) => {
          if (!isMounted) return;
          if (!snapshot.empty) {
            const list: CategoryRecord[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ ...docSnap.data(), id: docSnap.id } as CategoryRecord);
            });
            setCategories(list);
            saveCategoriesToCache(list);
          }
        },
        (err) => {
          console.warn('Aviso de conexão do Firestore (categories):', err);
        }
      );
    } catch (e) {
      console.warn('Erro ao configurar listener de categories:', e);
    }

    return () => {
      isMounted = false;
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeClients) unsubscribeClients();
      if (unsubscribeCategories) unsubscribeCategories();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    try {
      localStorage.setItem(ROLE_KEY, role);
    } catch {
      // ignore
    }
  };

  const login = async (emailOrRole: string, password?: string): Promise<boolean> => {
    const input = emailOrRole.trim().toLowerCase();
    let targetRole: UserRole | null = null;

    if (
      input === 'admin' ||
      input === 'administrador' ||
      input === 'admin@kapy.com' ||
      input === 'admin@empresa.com' ||
      input.includes('henrique')
    ) {
      targetRole = 'ADMIN';
    } else if (
      input === 'csm' ||
      input === 'csm@kapy.com' ||
      input === 'mariana.silva@empresa.com' ||
      input.includes('mariana')
    ) {
      targetRole = 'CSM';
    } else if (
      input === 'analista' ||
      input === 'analista@kapy.com' ||
      input === 'carlos.mendes@empresa.com' ||
      input.includes('carlos')
    ) {
      targetRole = 'ANALISTA';
    } else if (
      input === 'qualidade' ||
      input === 'qa' ||
      input === 'qualidade@kapy.com' ||
      input === 'beatriz.lima@empresa.com' ||
      input.includes('beatriz')
    ) {
      targetRole = 'QUALIDADE';
    } else if (
      input === 'gestor' ||
      input === 'gestor_analista' ||
      input === 'gestor de analista' ||
      input === 'gestor.analista@kapy.com' ||
      input === 'roberto.mendes@empresa.com' ||
      input.includes('roberto')
    ) {
      targetRole = 'GESTOR_ANALISTA';
    } else {
      // Check registered system users by email
      const matchedUser = systemUsers.find(
        (u) => u.email.toLowerCase() === input || u.name.toLowerCase().includes(input)
      );
      if (matchedUser && matchedUser.status !== 'INATIVO') {
        targetRole = matchedUser.role;
      }
    }

    if (!targetRole) {
      return false;
    }

    if (password && password.trim() !== '') {
      const expectedPassword = SIMULATED_ACCOUNTS[targetRole]?.passwordHint || '123';
      if (
        password.trim() !== expectedPassword &&
        password.trim() !== '123' &&
        password.trim() !== 'admin'
      ) {
        return false;
      }
    }

    setCurrentRoleState(targetRole);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(ROLE_KEY, targetRole);
      localStorage.setItem(AUTH_KEY, 'true');
    } catch {
      // ignore
    }
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch {
      // ignore
    }
  };

  const currentUser = useMemo(() => USER_PROFILES[currentRole], [currentRole]);

  // Derived unique active clients list for selectors and forms
  const clientsList = useMemo(() => {
    const set = new Set<string>();
    clients.forEach((c) => {
      if (c.status !== 'INATIVO' && c.name?.trim()) set.add(c.name.trim());
    });
    tickets.forEach((t) => {
      if (t.clientName?.trim()) set.add(t.clientName.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [clients, tickets]);

  // Derived active categories list for selectors and forms
  const categoriesList = useMemo(() => {
    const list = categories
      .filter((c) => c.status !== 'INATIVO' && c.name?.trim())
      .map((c) => c.name.trim());
    return list.length > 0 ? list : DEFAULT_CATEGORIES.map((c) => c.name);
  }, [categories]);

  // Admin Management Methods: Users, Roles, Clients, Categories
  const saveUser = async (userData: Partial<SystemUser> & { id?: string }) => {
    const id = userData.id || `user-${Date.now()}`;
    const newUser: SystemUser = {
      id,
      name: userData.name || 'Novo Usuário',
      email: userData.email || `usuario-${id}@kapy.com`,
      role: userData.role || 'CSM',
      title: userData.title || 'Operador',
      team: userData.team || 'Operações',
      avatar:
        userData.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: userData.status || 'ATIVO',
      supervisedAnalysts: userData.supervisedAnalysts || [],
      managerId: userData.managerId || '',
      managerName: userData.managerName || '',
      createdAt: userData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSystemUsers((prev) => {
      const exists = prev.some((u) => u.id === id);
      const updated = exists ? prev.map((u) => (u.id === id ? { ...u, ...newUser } : u)) : [newUser, ...prev];
      saveUsersToCache(updated);
      return updated;
    });

    try {
      const docRef = doc(db, USERS_COLLECTION, id);
      await setDoc(docRef, newUser, { merge: true });
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.WRITE, `${USERS_COLLECTION}/${id}`);
      } else {
        console.warn('Gravação em buffer offline (users):', err);
      }
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    setSystemUsers((prev) => {
      const updated = prev.map((u) => (u.id === userId ? { ...u, role: newRole, updatedAt: new Date().toISOString() } : u));
      saveUsersToCache(updated);
      return updated;
    });

    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(docRef, {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.UPDATE, `${USERS_COLLECTION}/${userId}`);
      } else {
        console.warn('Atualização em buffer offline (user role):', err);
      }
    }
  };

  const deleteUser = async (userId: string) => {
    setSystemUsers((prev) => {
      const updated = prev.filter((u) => u.id !== userId);
      saveUsersToCache(updated);
      return updated;
    });

    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      await deleteDoc(docRef);
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.DELETE, `${USERS_COLLECTION}/${userId}`);
      } else {
        console.warn('Exclusão em buffer offline (users):', err);
      }
    }
  };

  const getSupervisedAnalysts = (managerNameOrId?: string): string[] => {
    const targetName = managerNameOrId || currentUser?.name || 'Roberto Mendes';
    const managerUser = systemUsers.find(
      (u) =>
        u.role === 'GESTOR_ANALISTA' &&
        (u.name.toLowerCase() === targetName.toLowerCase() || u.id === managerNameOrId)
    );
    const names = new Set<string>();

    if (managerUser?.supervisedAnalysts && managerUser.supervisedAnalysts.length > 0) {
      managerUser.supervisedAnalysts.forEach((n) => names.add(n));
    }

    systemUsers.forEach((u) => {
      if (
        u.role === 'ANALISTA' &&
        u.status !== 'INATIVO' &&
        ((managerUser && u.managerId === managerUser.id) ||
          u.managerName?.toLowerCase() === targetName.toLowerCase())
      ) {
        names.add(u.name);
      }
    });

    if (names.size === 0) {
      const defaultAnalysts = systemUsers
        .filter((u) => u.role === 'ANALISTA' && u.status !== 'INATIVO')
        .map((u) => u.name);
      if (defaultAnalysts.length > 0) return defaultAnalysts;
      return ['Carlos Mendes', 'Juliana Costa'];
    }

    return Array.from(names);
  };

  const saveClient = async (clientData: Partial<ClientRecord> & { id?: string }) => {
    const id = clientData.id || `cli-${Date.now()}`;
    const newClient: ClientRecord = {
      id,
      name: clientData.name || 'Novo Cliente',
      segment: clientData.segment || 'Corporativo',
      code: clientData.code || `CLI-${id.slice(-4).toUpperCase()}`,
      contactName: clientData.contactName || '',
      contactEmail: clientData.contactEmail || '',
      status: clientData.status || 'ATIVO',
      notes: clientData.notes || '',
      createdAt: clientData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setClients((prev) => {
      const exists = prev.some((c) => c.id === id);
      const updated = exists ? prev.map((c) => (c.id === id ? { ...c, ...newClient } : c)) : [newClient, ...prev];
      saveClientsToCache(updated);
      return updated;
    });

    try {
      const docRef = doc(db, CLIENTS_COLLECTION, id);
      await setDoc(docRef, newClient, { merge: true });
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.WRITE, `${CLIENTS_COLLECTION}/${id}`);
      } else {
        console.warn('Gravação em buffer offline (clients):', err);
      }
    }
  };

  const deleteClient = async (clientId: string) => {
    setClients((prev) => {
      const updated = prev.filter((c) => c.id !== clientId);
      saveClientsToCache(updated);
      return updated;
    });

    try {
      const docRef = doc(db, CLIENTS_COLLECTION, clientId);
      await deleteDoc(docRef);
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.DELETE, `${CLIENTS_COLLECTION}/${clientId}`);
      } else {
        console.warn('Exclusão em buffer offline (clients):', err);
      }
    }
  };

  const saveCategory = async (catData: Partial<CategoryRecord> & { id?: string }) => {
    const id = catData.id || `cat-${Date.now()}`;
    const newCategory: CategoryRecord = {
      id,
      name: catData.name || 'Nova Categoria',
      description: catData.description || '',
      color: catData.color || 'blue',
      status: catData.status || 'ATIVO',
      createdAt: catData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCategories((prev) => {
      const exists = prev.some((c) => c.id === id);
      const updated = exists ? prev.map((c) => (c.id === id ? { ...c, ...newCategory } : c)) : [newCategory, ...prev];
      saveCategoriesToCache(updated);
      return updated;
    });

    try {
      const docRef = doc(db, CATEGORIES_COLLECTION, id);
      await setDoc(docRef, newCategory, { merge: true });
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.WRITE, `${CATEGORIES_COLLECTION}/${id}`);
      } else {
        console.warn('Gravação em buffer offline (categories):', err);
      }
    }
  };

  const deleteCategory = async (categoryId: string) => {
    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== categoryId);
      saveCategoriesToCache(updated);
      return updated;
    });

    try {
      const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);
      await deleteDoc(docRef);
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.DELETE, `${CATEGORIES_COLLECTION}/${categoryId}`);
      } else {
        console.warn('Exclusão em buffer offline (categories):', err);
      }
    }
  };

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
    const finalizadosTotal = aprovadosAnalista + aprovadosQualidade + reprovadosQualidade;
    const abertosTotal = total - finalizadosTotal;
    const taxaAprovacao =
      finalizadosTotal > 0 ? Math.round((aprovadosTotal / finalizadosTotal) * 100) : 0;

    let pendingForCurrentRole = 0;
    if (currentRole === 'ANALISTA') {
      pendingForCurrentRole = novoAguardandoTriagem;
    } else if (currentRole === 'GESTOR_ANALISTA') {
      const supervised = getSupervisedAnalysts();
      pendingForCurrentRole = tickets.filter(
        (t) =>
          t.status === 'NOVO_AGUARDANDO_TRIAGEM' &&
          (!t.analystName || supervised.length === 0 || supervised.includes(t.analystName))
      ).length;
    } else if (currentRole === 'CSM') {
      pendingForCurrentRole = informacoesFaltando;
    } else if (currentRole === 'QUALIDADE') {
      pendingForCurrentRole = reprovadosAnalista;
    } else if (currentRole === 'ADMIN') {
      pendingForCurrentRole = 0;
    }

    return {
      total,
      abertosTotal,
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

  // 1. Create ticket (CSM) -> Persists in Firebase + Optimistic local update
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

    // Optimistic local update
    const updatedList = [newTicket, ...tickets];
    setTickets(updatedList);
    saveToCache(updatedList);

    try {
      await setDoc(newDocRef, newTicket);
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.CREATE, `${TICKETS_COLLECTION}/${id}`);
      } else {
        console.warn('Gravação em buffer offline do Firestore:', err);
      }
    }

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

    const updatePayload = {
      status: 'INFORMACOES_FALTANDO' as TicketStatus,
      updatedAt: timestamp,
      missingInfoRequest: {
        requestedAt: timestamp,
        requestedBy: currentUser.name,
        question,
      },
      timeline: [event, ...ticket.timeline],
    };

    // Optimistic update
    const updatedList = tickets.map((t) =>
      t.id === ticketId ? { ...t, ...updatePayload } : t
    );
    setTickets(updatedList);
    saveToCache(updatedList);

    try {
      const docRef = doc(db, TICKETS_COLLECTION, ticketId);
      await updateDoc(docRef, updatePayload);
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.UPDATE, `${TICKETS_COLLECTION}/${ticketId}`);
      } else {
        console.warn('Gravação em buffer offline do Firestore:', err);
      }
    }
  };

  // 2b. Approve error by Analyst (Analista -> Concluído)
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
      title: 'Erro Aprovado pelo Analista · Concluído',
      description:
        'O Analista/Supervisor validou e aprovou tecnicamente o erro. Chamado concluído diretamente, sem necessidade de homologação da Qualidade.',
      previousStatus: ticket.status,
      newStatus: 'APROVADO_ANALISTA',
      notes,
    };

    const updatePayload = {
      status: 'APROVADO_ANALISTA' as TicketStatus,
      updatedAt: timestamp,
      analystReview: {
        reviewedAt: timestamp,
        analystName: currentUser.name,
        decision: 'APROVADO' as const,
        notes,
      },
      timeline: [event, ...ticket.timeline],
    };

    const updatedList = tickets.map((t) =>
      t.id === ticketId ? { ...t, ...updatePayload } : t
    );
    setTickets(updatedList);
    saveToCache(updatedList);

    try {
      const docRef = doc(db, TICKETS_COLLECTION, ticketId);
      await updateDoc(docRef, updatePayload);
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.UPDATE, `${TICKETS_COLLECTION}/${ticketId}`);
      } else {
        console.warn('Gravação em buffer offline do Firestore:', err);
      }
    }
  };

  // 2c. Contest error by Analyst (Analista -> Retorna para CSM)
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

    const updatePayload = {
      status: 'INFORMACOES_FALTANDO' as TicketStatus,
      updatedAt: timestamp,
      analystReview: {
        reviewedAt: timestamp,
        analystName: currentUser.name,
        decision: 'CONTESTADO' as const,
        notes: justification,
      },
      missingInfoRequest: {
        requestedAt: timestamp,
        requestedBy: currentUser.name,
        question: justification,
      },
      timeline: [event, ...ticket.timeline],
    };

    const updatedList = tickets.map((t) =>
      t.id === ticketId ? { ...t, ...updatePayload } : t
    );
    setTickets(updatedList);
    saveToCache(updatedList);

    try {
      const docRef = doc(db, TICKETS_COLLECTION, ticketId);
      await updateDoc(docRef, updatePayload);
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.UPDATE, `${TICKETS_COLLECTION}/${ticketId}`);
      } else {
        console.warn('Gravação em buffer offline do Firestore:', err);
      }
    }
  };

  // 2d. Reprove error by Analyst (Analista -> Qualidade)
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

    const updatePayload = {
      status: 'REPROVADO_ANALISTA' as TicketStatus,
      updatedAt: timestamp,
      analystReview: {
        reviewedAt: timestamp,
        analystName: currentUser.name,
        decision: 'REPROVADO' as const,
        notes: justification,
      },
      timeline: [event, ...ticket.timeline],
    };

    const updatedList = tickets.map((t) =>
      t.id === ticketId ? { ...t, ...updatePayload } : t
    );
    setTickets(updatedList);
    saveToCache(updatedList);

    try {
      const docRef = doc(db, TICKETS_COLLECTION, ticketId);
      await updateDoc(docRef, updatePayload);
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.UPDATE, `${TICKETS_COLLECTION}/${ticketId}`);
      } else {
        console.warn('Gravação em buffer offline do Firestore:', err);
      }
    }
  };

  // 3. CSM edits contested ticket and returns to triage
  const resubmitByCSM = async (
    ticketId: string,
    responseNotes: string,
    additionalAttachments: Attachment[] = [],
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
    const mergedAttachments = [
      ...(updatedFields?.attachments !== undefined
        ? updatedFields.attachments
        : ticket.attachments),
      ...additionalAttachments,
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
      attachments: additionalAttachments,
    };

    const updatePayload: any = {
      status: 'NOVO_AGUARDANDO_TRIAGEM',
      updatedAt: timestamp,
      attachments: mergedAttachments,
      missingInfoRequest: null,
      timeline: [event, ...ticket.timeline],
    };

    if (updatedFields) {
      if (updatedFields.analystCell !== undefined)
        updatePayload.analystCell = updatedFields.analystCell;
      if (updatedFields.analystName !== undefined)
        updatePayload.analystName = updatedFields.analystName;
      if (updatedFields.clientName !== undefined)
        updatePayload.clientName = updatedFields.clientName;
      if (updatedFields.clientSegment !== undefined)
        updatePayload.clientSegment = updatedFields.clientSegment;
      if (updatedFields.category !== undefined)
        updatePayload.category = updatedFields.category;
      if (updatedFields.severity !== undefined)
        updatePayload.severity = updatedFields.severity;
      if (updatedFields.analysisDate !== undefined)
        updatePayload.analysisDate = updatedFields.analysisDate;
      if (updatedFields.documentList !== undefined)
        updatePayload.documentList = updatedFields.documentList;
      if (updatedFields.errorReasonDC !== undefined)
        updatePayload.errorReasonDC = updatedFields.errorReasonDC;
      if (updatedFields.impactedEmployeesCount !== undefined)
        updatePayload.impactedEmployeesCount = updatedFields.impactedEmployeesCount;
      if (updatedFields.impactedCompetenciesCount !== undefined)
        updatePayload.impactedCompetenciesCount =
          updatedFields.impactedCompetenciesCount;
      if (updatedFields.description !== undefined)
        updatePayload.description = updatedFields.description;
      if (updatedFields.reproductionSteps !== undefined)
        updatePayload.reproductionSteps = updatedFields.reproductionSteps;

      const newTitle =
        updatedFields.title ||
        (updatedFields.errorReasonDC && updatedFields.clientName
          ? `${updatedFields.errorReasonDC} - ${updatedFields.clientName}`
          : ticket.title);
      updatePayload.title = newTitle;
    }

    const updatedList = tickets.map((t) =>
      t.id === ticketId ? { ...t, ...updatePayload } : t
    );
    setTickets(updatedList);
    saveToCache(updatedList);

    try {
      const docRef = doc(db, TICKETS_COLLECTION, ticketId);
      await updateDoc(docRef, updatePayload);
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.UPDATE, `${TICKETS_COLLECTION}/${ticketId}`);
      } else {
        console.warn('Gravação em buffer offline do Firestore:', err);
      }
    }
  };

  // 4a. Quality Approves (Qualidade -> Final)
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

    const updatePayload = {
      status: 'APROVADO_QUALIDADE' as TicketStatus,
      updatedAt: timestamp,
      qualityReview: {
        reviewedAt: timestamp,
        qualitySpecialistName: currentUser.name,
        verdict: 'APROVADO' as const,
        technicalReport: report,
      },
      timeline: [event, ...ticket.timeline],
    };

    const updatedList = tickets.map((t) =>
      t.id === ticketId ? { ...t, ...updatePayload } : t
    );
    setTickets(updatedList);
    saveToCache(updatedList);

    try {
      const docRef = doc(db, TICKETS_COLLECTION, ticketId);
      await updateDoc(docRef, updatePayload);
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.UPDATE, `${TICKETS_COLLECTION}/${ticketId}`);
      } else {
        console.warn('Gravação em buffer offline do Firestore:', err);
      }
    }
  };

  // 4b. Quality Rejects (Qualidade -> Final)
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

    const updatePayload = {
      status: 'REPROVADO_QUALIDADE' as TicketStatus,
      updatedAt: timestamp,
      qualityReview: {
        reviewedAt: timestamp,
        qualitySpecialistName: currentUser.name,
        verdict: 'REPROVADO' as const,
        technicalReport: report,
      },
      timeline: [event, ...ticket.timeline],
    };

    const updatedList = tickets.map((t) =>
      t.id === ticketId ? { ...t, ...updatePayload } : t
    );
    setTickets(updatedList);
    saveToCache(updatedList);

    try {
      const docRef = doc(db, TICKETS_COLLECTION, ticketId);
      await updateDoc(docRef, updatePayload);
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.UPDATE, `${TICKETS_COLLECTION}/${ticketId}`);
      } else {
        console.warn('Gravação em buffer offline do Firestore:', err);
      }
    }
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

    const updatePayload = {
      updatedAt: timestamp,
      timeline: [event, ...ticket.timeline],
    };

    const updatedList = tickets.map((t) =>
      t.id === ticketId ? { ...t, ...updatePayload } : t
    );
    setTickets(updatedList);
    saveToCache(updatedList);

    try {
      const docRef = doc(db, TICKETS_COLLECTION, ticketId);
      await updateDoc(docRef, updatePayload);
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.UPDATE, `${TICKETS_COLLECTION}/${ticketId}`);
      } else {
        console.warn('Gravação em buffer offline do Firestore:', err);
      }
    }
  };

  // 6. Delete ticket
  const deleteTicket = async (ticketId: string) => {
    const updatedList = tickets.filter((t) => t.id !== ticketId);
    setTickets(updatedList);
    saveToCache(updatedList);

    try {
      const docRef = doc(db, TICKETS_COLLECTION, ticketId);
      await deleteDoc(docRef);
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.DELETE, `${TICKETS_COLLECTION}/${ticketId}`);
      } else {
        console.warn('Exclusão em buffer offline do Firestore:', err);
      }
    }
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
        isAuthenticated,
        login,
        logout,
        metrics,
        // Admin State & Management
        systemUsers,
        clients,
        categories,
        clientsList,
        categoriesList,
        saveUser,
        updateUserRole,
        deleteUser,
        getSupervisedAnalysts,
        saveClient,
        deleteClient,
        saveCategory,
        deleteCategory,
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
