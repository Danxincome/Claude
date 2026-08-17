import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { StatusSelector } from './StatusSelector';
import { getScoreLabel } from '@shared/constants';
import { formatCurrency } from '../../lib/format';
import { Trash2 } from 'lucide-react';
import type { Lead } from '@shared/index';

interface LeadHeaderProps {
  lead: Lead;
  onDelete: () => void;
}

export function LeadHeader({ lead, onDelete }: LeadHeaderProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-xl font-bold">
            {lead.firstName[0]}{lead.lastName[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {lead.firstName} {lead.lastName}
            </h1>
            <p className="text-sm text-gray-500">{lead.title} at {lead.company}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="score" value={getScoreLabel(lead.score)}>Score: {lead.score}</Badge>
              <span className="text-sm text-gray-500">{formatCurrency(lead.estimatedValue)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusSelector leadId={lead.id} currentStatus={lead.status} />
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}
