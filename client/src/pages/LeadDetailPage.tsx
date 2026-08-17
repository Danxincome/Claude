import { useParams, useNavigate } from 'react-router-dom';
import { useLead, useDeleteLead } from '../hooks/useLeads';
import { useActivities } from '../hooks/useActivities';
import { useInsights } from '../hooks/useInsights';
import { useToast } from '../lib/toast-context';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LeadHeader } from '../components/leads/LeadHeader';
import { LeadInfoPanel } from '../components/leads/LeadInfoPanel';
import { LeadScoreCard } from '../components/leads/LeadScoreCard';
import { AIInsightsPanel } from '../components/leads/AIInsightsPanel';
import { ActivityTimeline } from '../components/leads/ActivityTimeline';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useLead(id!);
  const { data: activitiesData } = useActivities(id!);
  const { data: insightsData } = useInsights(id!);
  const deleteLead = useDeleteLead();
  const { showToast } = useToast();
  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) return <LoadingSpinner size="lg" className="h-64" />;

  const lead = data?.data;
  if (!lead) return <div className="text-center py-16 text-gray-500">Lead not found</div>;

  const activities = activitiesData?.data || [];
  const insights = insightsData?.data || [];

  function handleDelete() {
    deleteLead.mutate(id!, {
      onSuccess: () => { showToast('Lead deleted'); navigate('/leads'); },
      onError: (err) => showToast(err.message, 'error'),
    });
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/leads')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Leads
      </button>

      <LeadHeader lead={lead} onDelete={() => setShowDelete(true)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <LeadInfoPanel lead={lead} />
          <ActivityTimeline leadId={lead.id} activities={activities} />
        </div>
        <div className="space-y-6">
          <LeadScoreCard lead={lead} />
          <AIInsightsPanel leadId={lead.id} insights={insights} />
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Lead"
        message={`Delete ${lead.firstName} ${lead.lastName}? This removes all activities and insights.`}
        loading={deleteLead.isPending}
      />
    </div>
  );
}
