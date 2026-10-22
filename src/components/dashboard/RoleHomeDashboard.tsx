import React from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import { Ticket } from '../../types/workflow';
import { AppPage } from '../Sidebar';
import { CSMHomeDashboard } from './CSMHomeDashboard';
import { AnalistaHomeDashboard } from './AnalistaHomeDashboard';
import { GestorHomeDashboard } from './GestorHomeDashboard';
import { QualidadeHomeDashboard } from './QualidadeHomeDashboard';

interface RoleHomeDashboardProps {
  onSelectTicket: (ticketId: string) => void;
  onNavigateToPage: (page: AppPage) => void;
  onOpenNewTicket: () => void;
  onEditTicket: (ticket: Ticket) => void;
}

export const RoleHomeDashboard: React.FC<RoleHomeDashboardProps> = ({
  onSelectTicket,
  onNavigateToPage,
  onOpenNewTicket,
  onEditTicket,
}) => {
  const { currentRole } = useWorkflow();

  if (currentRole === 'CSM') {
    return (
      <CSMHomeDashboard
        onSelectTicket={onSelectTicket}
        onNavigateToPage={onNavigateToPage}
        onOpenNewTicket={onOpenNewTicket}
        onEditTicket={onEditTicket}
      />
    );
  }

  if (currentRole === 'ANALISTA') {
    return (
      <AnalistaHomeDashboard
        onSelectTicket={onSelectTicket}
        onNavigateToPage={onNavigateToPage}
      />
    );
  }

  if (currentRole === 'GESTOR_ANALISTA') {
    return (
      <GestorHomeDashboard
        onSelectTicket={onSelectTicket}
        onNavigateToPage={onNavigateToPage}
      />
    );
  }

  return (
    <QualidadeHomeDashboard
      onSelectTicket={onSelectTicket}
      onNavigateToPage={onNavigateToPage}
    />
  );
};
