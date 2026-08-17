import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { LeadStatus, LeadSource } from '@shared/index';
import type { LeadFilters as LeadFiltersType } from '@shared/index';

interface LeadFiltersProps {
  filters: LeadFiltersType;
  onChange: (filters: LeadFiltersType) => void;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  ...Object.values(LeadStatus).map(s => ({ value: s, label: s })),
];

const sourceOptions = [
  { value: '', label: 'All Sources' },
  ...Object.values(LeadSource).map(s => ({ value: s, label: s })),
];

const sortOptions = [
  { value: 'created_at', label: 'Date Created' },
  { value: 'score', label: 'Score' },
  { value: 'name', label: 'Name' },
  { value: 'value', label: 'Deal Value' },
  { value: 'company', label: 'Company' },
];

export function LeadFilters({ filters, onChange }: LeadFiltersProps) {
  return (
    <Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Input
          placeholder="Search leads..."
          value={filters.search || ''}
          onChange={e => onChange({ ...filters, search: e.target.value })}
        />
        <Select
          options={statusOptions}
          value={filters.status || ''}
          onChange={e => onChange({ ...filters, status: e.target.value || undefined })}
        />
        <Select
          options={sourceOptions}
          value={filters.source || ''}
          onChange={e => onChange({ ...filters, source: e.target.value || undefined })}
        />
        <Select
          options={sortOptions}
          value={filters.sortBy || 'created_at'}
          onChange={e => onChange({ ...filters, sortBy: e.target.value })}
        />
        <Select
          options={[
            { value: 'desc', label: 'Descending' },
            { value: 'asc', label: 'Ascending' },
          ]}
          value={filters.sortOrder || 'desc'}
          onChange={e => onChange({ ...filters, sortOrder: e.target.value as 'asc' | 'desc' })}
        />
      </div>
    </Card>
  );
}
