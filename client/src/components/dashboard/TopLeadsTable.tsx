import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { getScoreLabel } from '@shared/constants';
import { formatCurrency } from '../../lib/format';
import type { Lead } from '@shared/index';

interface TopLeadsTableProps {
  leads: Lead[];
}

export function TopLeadsTable({ leads }: TopLeadsTableProps) {
  const navigate = useNavigate();

  return (
    <Card padding="none">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">Top Scoring Leads</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Score</th>
              <th className="px-6 py-3 font-medium hidden sm:table-cell">Status</th>
              <th className="px-6 py-3 font-medium hidden md:table-cell">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">
                  No leads yet
                </td>
              </tr>
            )}
            {leads.map(lead => (
              <tr
                key={lead.id}
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{lead.firstName} {lead.lastName}</p>
                    <p className="text-xs text-gray-500">{lead.company}</p>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <Badge variant="score" value={getScoreLabel(lead.score)}>{lead.score}</Badge>
                </td>
                <td className="px-6 py-3 hidden sm:table-cell">
                  <Badge variant="status" value={lead.status}>{lead.status}</Badge>
                </td>
                <td className="px-6 py-3 text-sm text-gray-700 hidden md:table-cell">
                  {formatCurrency(lead.estimatedValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
