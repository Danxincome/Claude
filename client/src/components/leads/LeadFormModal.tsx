import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { useCreateLead, useUpdateLead, useLead } from '../../hooks/useLeads';
import { useToast } from '../../lib/toast-context';
import { LeadStatus, LeadSource } from '@shared/index';

interface LeadFormModalProps {
  open: boolean;
  onClose: () => void;
  editId?: string | null;
}

const statusOptions = Object.values(LeadStatus).map(s => ({ value: s, label: s }));
const sourceOptions = Object.values(LeadSource).map(s => ({ value: s, label: s }));

const initial = {
  firstName: '', lastName: '', email: '', phone: '', company: '', title: '',
  source: LeadSource.Website, status: LeadStatus.New, estimatedValue: 0, notes: '',
};

export function LeadFormModal({ open, onClose, editId }: LeadFormModalProps) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const { data: existingData } = useLead(editId || '');
  const { showToast } = useToast();

  const isEdit = !!editId;

  useEffect(() => {
    if (isEdit && existingData?.data) {
      const d = existingData.data;
      setForm({
        firstName: d.firstName, lastName: d.lastName, email: d.email,
        phone: d.phone, company: d.company, title: d.title,
        source: d.source, status: d.status,
        estimatedValue: d.estimatedValue, notes: d.notes,
      });
    } else if (!isEdit) {
      setForm(initial);
    }
  }, [isEdit, existingData]);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.company.trim()) e.company = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const data = { ...form, estimatedValue: Number(form.estimatedValue) };

    if (isEdit) {
      updateLead.mutate({ id: editId!, data }, {
        onSuccess: () => { showToast('Lead updated'); onClose(); },
        onError: (err) => showToast(err.message, 'error'),
      });
    } else {
      createLead.mutate(data as any, {
        onSuccess: () => { showToast('Lead created'); onClose(); setForm(initial); },
        onError: (err) => showToast(err.message, 'error'),
      });
    }
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const isPending = createLead.isPending || updateLead.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Lead' : 'Add New Lead'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="First Name" value={form.firstName} onChange={set('firstName')} error={errors.firstName} />
          <Input label="Last Name" value={form.lastName} onChange={set('lastName')} error={errors.lastName} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} />
          <Input label="Phone" value={form.phone} onChange={set('phone')} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Company" value={form.company} onChange={set('company')} error={errors.company} />
          <Input label="Job Title" value={form.title} onChange={set('title')} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select label="Source" options={sourceOptions} value={form.source} onChange={set('source')} />
          <Select label="Status" options={statusOptions} value={form.status} onChange={set('status')} />
          <Input label="Estimated Value ($)" type="number" value={String(form.estimatedValue)} onChange={set('estimatedValue')} />
        </div>
        <Textarea label="Notes" value={form.notes} onChange={set('notes')} placeholder="Additional notes..." />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isPending}>{isEdit ? 'Save Changes' : 'Create Lead'}</Button>
        </div>
      </form>
    </Modal>
  );
}
