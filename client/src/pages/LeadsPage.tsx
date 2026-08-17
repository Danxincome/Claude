import { useState } from 'react';
import { useLeads, useDeleteLead } from '../hooks/useLeads';
import { useToast } from '../lib/toast-context';
import { LeadTable } from '../components/leads/LeadTable';
import { LeadFormModal } from '../components/leads/LeadFormModal';
import { LeadFilters } from '../components/leads/LeadFilters';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Plus, SlidersHorizontal } from 'lucide-react';
import type { LeadFilters as LeadFiltersType } from '@shared/index';

export function LeadsPage() {
  const [filters, setFilters] = useState<LeadFiltersType>({ page: 1, pageSize: 15 });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useLeads(filters);
  const deleteLead = useDeleteLead();
  const { showToast } = useToast();

  function handleEdit(id: string) {
    setEditingId(id);
    setShowForm(true);
  }

  function handleDelete() {
    if (!deletingId) return;
    deleteLead.mutate(deletingId, {
      onSuccess: () => {
        showToast('Lead deleted');
        setDeletingId(null);
      },
      onError: (err) => showToast(err.message, 'error'),
    });
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingId(null);
  }

  const leads = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">{pagination?.total || 0} total leads</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="w-4 h-4 mr-1" />
            Filters
          </Button>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Lead
          </Button>
        </div>
      </div>

      {showFilters && (
        <LeadFilters filters={filters} onChange={f => setFilters({ ...f, page: 1 })} />
      )}

      {isLoading ? (
        <LoadingSpinner size="lg" className="h-64" />
      ) : leads.length === 0 ? (
        <EmptyState
          title="No leads found"
          description="Add your first lead or adjust filters to see results."
          actionLabel="Add Lead"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <>
          <LeadTable leads={leads} onEdit={handleEdit} onDelete={setDeletingId} />
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <LeadFormModal open={showForm} onClose={handleFormClose} editId={editingId} />
      <ConfirmDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone."
        loading={deleteLead.isPending}
      />
    </div>
  );
}
