import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ActivityForm } from './ActivityForm';
import { Phone, Mail, Calendar, FileText, Plus } from 'lucide-react';
import { formatRelativeTime } from '../../lib/format';
import type { Activity } from '@shared/index';

const typeIcons: Record<string, typeof Phone> = {
  Call: Phone, Email: Mail, Meeting: Calendar, Note: FileText,
};

const typeColors: Record<string, string> = {
  Call: 'bg-blue-500', Email: 'bg-purple-500', Meeting: 'bg-green-500', Note: 'bg-gray-400',
};

interface ActivityTimelineProps {
  leadId: string;
  activities: Activity[];
}

export function ActivityTimeline({ leadId, activities }: ActivityTimelineProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <Card padding="none">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">Activity Timeline</h3>
        <Button variant="secondary" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" /> Log Activity
        </Button>
      </div>

      {showForm && (
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <ActivityForm leadId={leadId} onSuccess={() => setShowForm(false)} />
        </div>
      )}

      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto scrollbar-thin">
        {activities.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">No activities recorded</div>
        ) : (
          activities.map((activity, idx) => {
            const Icon = typeIcons[activity.type] || FileText;
            const dotColor = typeColors[activity.type] || 'bg-gray-400';
            return (
              <div key={activity.id} className="px-6 py-4 flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${dotColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {idx < activities.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-2" />}
                </div>
                <div className="flex-1 min-w-0 pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-900">{activity.type}</span>
                    <span className="text-xs text-gray-400">{formatRelativeTime(activity.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{activity.description}</p>
                  {activity.outcome && (
                    <p className="text-xs text-gray-500 mt-1 italic">Outcome: {activity.outcome}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
