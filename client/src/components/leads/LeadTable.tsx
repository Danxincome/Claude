import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { getScoreLabel } from '@shared/constants';
import { formatCurrency, formatDate } from '../../lib/format';
import type { Lead } from '@shared/index';

interface LeadTableProps {
  leads: Lead[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function ActionMenu({ lead, onEdit, onDelete }: { lead: Lead; onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(!open); }}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg border border-gray-200 shadow-lg z-10 py-1">
          <button onClick={e => { e.stopPropagation(); setOpen(false); onEdit(); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={e => { e.stopPropagation(); setOpen(false); onDelete(); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export function LeadTable({ leads, onEdit, onDelete }: LeadTableProps) {
  const navigate = useNavigate();

  return (
    <Card padding="none">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium hidden md:table-cell">Email</th>
              <th className="px-6 py-3 font-medium hidden lg:table-cell">Source</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Score</th>
              <th className="px-6 py-3 font-medium hidden sm:table-cell">Value</th>
              <th className="px-6 py-3 font-medium hidden xl:table-cell">Created</th>
              <th className="px-6 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.map(lead => (
              <tr
                key={lead.id}
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-3">
                  <p className="text-sm font-medium text-gray-900">{lead.firstName} {lead.lastName}</p>
                  <p className="text-xs text-gray-500">{lead.company}</p>
                </td>
                <td className="px-6 py-3 text-sm text-gray-600 hidden md:table-cell">{lead.email}</td>
                <td className="px-6 py-3 text-sm text-gray-600 hidden lg:table-cell">{lead.source}</td>
                <td className="px-6 py-3">
                  <Badge variant="status" value={lead.status}>{lead.status}</Badge>
                </td>
                <td className="px-6 py-3">
                  <Badge variant="score" value={getScoreLabel(lead.score)}>{lead.score}</Badge>
                </td>
                <td className="px-6 py-3 text-sm text-gray-700 hidden sm:table-cell">{formatCurrency(lead.estimatedValue)}</td>
                <td className="px-6 py-3 text-sm text-gray-500 hidden xl:table-cell">{formatDate(lead.createdAt)}</td>
                <td className="px-6 py-3">
                  <ActionMenu lead={lead} onEdit={() => onEdit(lead.id)} onDelete={() => onDelete(lead.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
