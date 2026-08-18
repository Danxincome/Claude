import { Routes, Route, useLocation } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { LeadDetailPage } from './pages/LeadDetailPage';
import { PipelinePage } from './pages/PipelinePage';
import { AIReceptionistPage } from './pages/AIReceptionistPage';
import { ConversationsPage } from './pages/ConversationsPage';
import { AISettingsPage } from './pages/AISettingsPage';
import { ChatWidgetPage } from './pages/ChatWidgetPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/leads" element={<LeadsPage />} />
      <Route path="/leads/:id" element={<LeadDetailPage />} />
      <Route path="/pipeline" element={<PipelinePage />} />
      <Route path="/receptionist" element={<AIReceptionistPage />} />
      <Route path="/conversations" element={<ConversationsPage />} />
      <Route path="/ai-settings" element={<AISettingsPage />} />
    </Routes>
  );
}

export default function App() {
  const location = useLocation();

  if (location.pathname === '/chat') {
    return <ChatWidgetPage />;
  }

  return (
    <MainLayout>
      <AppRoutes />
    </MainLayout>
  );
}
