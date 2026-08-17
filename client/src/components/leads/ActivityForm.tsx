import { useState } from 'react';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { useCreateActivity } from '../../hooks/useActivities';
import { useToast } from '../../lib/toast-context';
import { ActivityType } from '@shared/index';

interface ActivityFormProps {
  leadId: string;
  onSuccess: () => void;
}

const typeOptions = Object.values(ActivityType).map(t => ({ value: t, label: t }));

export function ActivityForm({ leadId, onSuccess }: ActivityFormProps) {
  const [type, setType] = useState(ActivityType.Call);
  const [description, setDescription] = useState('');
  const [outcome, setOutcome] = useState('');
  const createActivity = useCreateActivity();
  const { showToast } = useToast();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;

    createActivity.mutate(
      { leadId, data: { type, description, outcome } },
      {
        onSuccess: () => {
          showToast('Activity logged');
          setDescription('');
          setOutcome('');
          onSuccess();
        },
        onError: (err) => showToast(err.message, 'error'),
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Select
        label="Type"
        options={typeOptions}
        value={type}
        onChange={e => setType(e.target.value as ActivityType)}
      />
      <Textarea
        label="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="What happened?"
      />
      <Textarea
        label="Outcome (optional)"
        value={outcome}
        onChange={e => setOutcome(e.target.value)}
        placeholder="What was the result?"
      />
      <div className="flex justify-end gap-2">
        <Button type="submit" size="sm" loading={createActivity.isPending}>Log Activity</Button>
      </div>
    </form>
  );
}
