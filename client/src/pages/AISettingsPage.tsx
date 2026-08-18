import { useState, useEffect } from 'react';
import { useAISettings, useUpdateAISettings } from '../hooks/useAISettings';
import { useToast } from '../lib/toast-context';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Plus, Trash2, Save, Building2, Clock, MapPin, HelpCircle, BookOpen, MessageSquare } from 'lucide-react';
import type { ServiceItem, FaqItem } from '@shared/index';

export function AISettingsPage() {
  const { data, isLoading } = useAISettings();
  const updateSettings = useUpdateAISettings();
  const { showToast } = useToast();

  const [businessName, setBusinessName] = useState('');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [businessHours, setBusinessHours] = useState('');
  const [location, setLocation] = useState('');
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [bookingInstructions, setBookingInstructions] = useState('');
  const [aiGreeting, setAiGreeting] = useState('');

  useEffect(() => {
    if (data?.data) {
      const s = data.data;
      setBusinessName(s.businessName);
      setServices(s.services);
      setBusinessHours(s.businessHours);
      setLocation(s.location);
      setFaqs(s.faqs);
      setBookingInstructions(s.bookingInstructions);
      setAiGreeting(s.aiGreeting);
    }
  }, [data]);

  const addService = () => setServices([...services, { name: '', description: '', price: '', duration: '' }]);
  const removeService = (i: number) => setServices(services.filter((_, idx) => idx !== i));
  const updateService = (i: number, field: keyof ServiceItem, value: string) => {
    const updated = [...services];
    updated[i] = { ...updated[i], [field]: value };
    setServices(updated);
  };

  const addFaq = () => setFaqs([...faqs, { question: '', answer: '' }]);
  const removeFaq = (i: number) => setFaqs(faqs.filter((_, idx) => idx !== i));
  const updateFaq = (i: number, field: keyof FaqItem, value: string) => {
    const updated = [...faqs];
    updated[i] = { ...updated[i], [field]: value };
    setFaqs(updated);
  };

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        businessName, services, businessHours, location, faqs, bookingInstructions, aiGreeting,
      });
      showToast('Settings saved successfully', 'success');
    } catch {
      showToast('Failed to save settings', 'error');
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Receptionist Settings</h1>
          <p className="text-gray-500 mt-1">Configure your business information for the AI receptionist</p>
        </div>
        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          <Save className="w-4 h-4 mr-2" />
          {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <Card>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Building2 className="w-5 h-5 text-primary-500" />
            Business Information
          </div>
          <Input label="Business Name" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Premium Auto Detailing" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" /> Business Hours
              </label>
              <Textarea value={businessHours} onChange={e => setBusinessHours(e.target.value)} placeholder="e.g. Mon-Fri 8am-6pm, Sat 9am-3pm, Closed Sunday" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" /> Location
              </label>
              <Textarea value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. 123 Main St, Springfield, IL 62701" rows={3} />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <span className="text-primary-500">$</span>
              Services & Pricing
            </div>
            <Button variant="secondary" size="sm" onClick={addService}>
              <Plus className="w-4 h-4 mr-1" /> Add Service
            </Button>
          </div>
          {services.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">No services configured. Add your first service above.</p>
          )}
          {services.map((svc, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-500">Service {i + 1}</span>
                <button onClick={() => removeService(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="Service name" value={svc.name} onChange={e => updateService(i, 'name', e.target.value)} />
                <Input placeholder="Price (e.g. $99)" value={svc.price} onChange={e => updateService(i, 'price', e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="Duration (e.g. 2-3 hours)" value={svc.duration} onChange={e => updateService(i, 'duration', e.target.value)} />
                <Input placeholder="Description" value={svc.description} onChange={e => updateService(i, 'description', e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <HelpCircle className="w-5 h-5 text-primary-500" />
              Frequently Asked Questions
            </div>
            <Button variant="secondary" size="sm" onClick={addFaq}>
              <Plus className="w-4 h-4 mr-1" /> Add FAQ
            </Button>
          </div>
          {faqs.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">No FAQs configured. Add common questions your customers ask.</p>
          )}
          {faqs.map((faq, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-500">FAQ {i + 1}</span>
                <button onClick={() => removeFaq(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
              <Input placeholder="Question" value={faq.question} onChange={e => updateFaq(i, 'question', e.target.value)} />
              <Textarea placeholder="Answer" value={faq.answer} onChange={e => updateFaq(i, 'answer', e.target.value)} rows={2} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <BookOpen className="w-5 h-5 text-primary-500" />
            Booking Instructions
          </div>
          <Textarea value={bookingInstructions} onChange={e => setBookingInstructions(e.target.value)} placeholder="e.g. Call us at (555) 123-4567 to schedule, or visit our website at..." rows={3} />
        </div>
      </Card>

      <Card>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <MessageSquare className="w-5 h-5 text-primary-500" />
            AI Greeting
          </div>
          <p className="text-sm text-gray-500">The first message the AI will send when a customer starts a chat.</p>
          <Textarea value={aiGreeting} onChange={e => setAiGreeting(e.target.value)} placeholder="e.g. Welcome! I'm the virtual assistant for Premium Auto Detailing. How can I help you today?" rows={3} />
        </div>
      </Card>

      <div className="flex justify-end pb-8">
        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          <Save className="w-4 h-4 mr-2" />
          {updateSettings.isPending ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
}
