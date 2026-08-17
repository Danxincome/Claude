import { Card } from '../ui/Card';
import { Mail, Phone, Building2, Briefcase, Globe, Calendar } from 'lucide-react';
import { formatDate } from '../../lib/format';
import type { Lead } from '@shared/index';

interface LeadInfoPanelProps {
  lead: Lead;
}

const fields = [
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'phone', label: 'Phone', icon: Phone },
  { key: 'company', label: 'Company', icon: Building2 },
  { key: 'title', label: 'Title', icon: Briefcase },
  { key: 'source', label: 'Source', icon: Globe },
] as const;

export function LeadInfoPanel({ lead }: LeadInfoPanelProps) {
  return (
    <Card>
      <h3 className="text-base font-semibold text-gray-900 mb-4">Contact Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-start gap-3">
            <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-sm text-gray-900">{(lead as any)[key] || '-'}</p>
            </div>
          </div>
        ))}
        <div className="flex items-start gap-3">
          <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Created</p>
            <p className="text-sm text-gray-900">{formatDate(lead.createdAt)}</p>
          </div>
        </div>
      </div>
      {lead.notes && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Notes</p>
          <p className="text-sm text-gray-700">{lead.notes}</p>
        </div>
      )}
    </Card>
  );
}
