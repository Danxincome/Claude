import { Card } from '../ui/Card';
import { Phone, Mail, Calendar, FileText } from 'lucide-react';
import { formatRelativeTime, truncate } from '../../lib/format';
import type { Activity } from '@shared/index';

const typeIcons = {
  Call: Phone,
  Email: Mail,
  Meeting: Calendar,
  Note: FileText,
};

const typeColors = {
  Call: 'text-blue-500 bg-blue-50',
  Email: 'text-purple-500 bg-purple-50',
  Meeting: 'text-green-500 bg-green-50',
  Note: 'text-gray-500 bg-gray-50',
};

interface RecentActivityFeedProps {
  activities: (Activity & { leadName: string })[];
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  return (
    <Card padding="none">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto scrollbar-thin">
        {activities.map(activity => {
          const Icon = typeIcons[activity.type as keyof typeof typeIcons] || FileText;
          const colorClass = typeColors[activity.type as keyof typeof typeColors] || typeColors.Note;
          return (
            <div key={activity.id} className="px-6 py-3 flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.leadName}</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{truncate(activity.description, 60)}</p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{formatRelativeTime(activity.createdAt)}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
