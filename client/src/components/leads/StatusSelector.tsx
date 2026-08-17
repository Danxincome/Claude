import { useUpdateLeadStatus } from '../../hooks/useLeads';
import { useToast } from '../../lib/toast-context';
import { LeadStatus } from '@shared/index';
import { STATUS_COLORS } from '@shared/constants';

interface StatusSelectorProps {
  leadId: string;
  currentStatus: string;
}

export function StatusSelector({ leadId, currentStatus }: StatusSelectorProps) {
  const updateStatus = useUpdateLeadStatus();
  const { showToast } = useToast();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    updateStatus.mutate({ id: leadId, status: e.target.value }, {
      onSuccess: () => showToast(`Status updated to ${e.target.value}`),
      onError: (err) => showToast(err.message, 'error'),
    });
  }

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={updateStatus.isPending}
      className="text-sm font-medium rounded-lg px-3 py-2 border-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
      style={{ borderColor: STATUS_COLORS[currentStatus] || '#9CA3AF' }}
    >
      {Object.values(LeadStatus).map(status => (
        <option key={status} value={status}>{status}</option>
      ))}
    </select>
  );
}
