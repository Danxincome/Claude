import { useLeads, useUpdateLeadStatus } from '../hooks/useLeads';
import { useToast } from '../lib/toast-context';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import { getScoreLabel, STATUS_COLORS, PIPELINE_STAGES } from '@shared/constants';
import { formatCurrency } from '../lib/format';
import { LeadStatus, type Lead } from '@shared/index';
import { useState } from 'react';
import { GripVertical } from 'lucide-react';

export function PipelinePage() {
  const { data, isLoading } = useLeads({ pageSize: 100 });
  const updateStatus = useUpdateLeadStatus();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  if (isLoading) return <LoadingSpinner size="lg" className="h-64" />;

  const allLeads = data?.data || [];
  const columns = [...PIPELINE_STAGES, 'Won', 'Lost'] as const;

  const leadsByStatus: Record<string, Lead[]> = {};
  for (const col of columns) leadsByStatus[col] = [];
  for (const lead of allLeads) {
    if (leadsByStatus[lead.status]) {
      leadsByStatus[lead.status].push(lead);
    }
  }

  function handleDragStart(e: React.DragEvent, lead: Lead) {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: lead.id, status: lead.status }));
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent, status: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  }

  function handleDragLeave() {
    setDragOverColumn(null);
  }

  function handleDrop(e: React.DragEvent, newStatus: string) {
    e.preventDefault();
    setDragOverColumn(null);

    try {
      const { id, status: oldStatus } = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (oldStatus === newStatus) return;

      updateStatus.mutate({ id, status: newStatus }, {
        onSuccess: () => showToast(`Moved to ${newStatus}`),
        onError: (err) => showToast(err.message, 'error'),
      });
    } catch { /* ignore */ }
  }

  const pipelineTotal = allLeads
    .filter(l => !['Won', 'Lost'].includes(l.status))
    .reduce((sum, l) => sum + l.estimatedValue, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">
            {formatCurrency(pipelineTotal)} total pipeline value
          </p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
        {columns.map(status => {
          const leads = leadsByStatus[status] || [];
          const columnValue = leads.reduce((sum, l) => sum + l.estimatedValue, 0);
          const isDragOver = dragOverColumn === status;

          return (
            <div
              key={status}
              className={`flex-shrink-0 w-72 flex flex-col rounded-xl transition-colors ${
                isDragOver ? 'bg-primary-50' : 'bg-gray-100'
              }`}
              onDragOver={e => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, status)}
            >
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] }} />
                  <span className="text-sm font-semibold text-gray-700">{status}</span>
                  <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full">{leads.length}</span>
                </div>
                <span className="text-xs text-gray-500">{formatCurrency(columnValue)}</span>
              </div>

              <div className="flex-1 px-2 pb-2 space-y-2 min-h-[200px] max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-thin">
                {leads.map(lead => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={e => handleDragStart(e, lead)}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className="bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {lead.firstName} {lead.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{lead.company}</p>
                      </div>
                      <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-400 flex-shrink-0" />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="score" value={getScoreLabel(lead.score)} className="text-xs">{lead.score}</Badge>
                      <span className="text-xs text-gray-500">{formatCurrency(lead.estimatedValue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
