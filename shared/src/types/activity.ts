export const ActivityType = {
  Call: 'Call',
  Email: 'Email',
  Meeting: 'Meeting',
  Note: 'Note',
} as const;
export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];

export interface Activity {
  id: string;
  leadId: string;
  type: ActivityType;
  description: string;
  outcome: string;
  createdAt: string;
}

export type CreateActivityInput = Pick<Activity, 'type' | 'description' | 'outcome'>;
