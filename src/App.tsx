import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Pipeline from './pages/Pipeline';
import Contatos from './pages/Contatos';
import Ads from './pages/Ads';
import Metas from './pages/Metas';
import FollowUp from './pages/FollowUp';
import Apologia from './pages/Apologia';
import Comissao from './pages/Comissao';
import Settings from './pages/Settings';
import Login from './pages/Login';
import AgencyView from './pages/AgencyView';
import Agendamentos from './pages/Agendamentos';
import WhatsApp from './pages/WhatsApp';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { BusinessProvider } from './hooks/useBusiness';
import { useEffect } from 'react';

function AppContent() {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();

  // Handle invite links (dentist invite)
  const inviteCode = searchParams.get('invite');
  const inviteName = searchParams.get('name');
  const inviteEmail = searchParams.get('email');
  const inviteBusiness = searchParams.get('business');

  useEffect(() => {
    if (inviteCode && !user) {
      // Store invite info for use after login/signup
      sessionStorage.setItem('pending_invite', JSON.stringify({ 
        code: inviteCode, 
        name: inviteName, 
        email: inviteEmail,
        business: inviteBusiness 
      }));
    }
  }, [inviteCode, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-app flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-accent-secondary/20 border-b-accent-secondary rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <BusinessProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/agendamentos" element={<Agendamentos />} />
          <Route path="/whatsapp" element={<WhatsApp />} />
          <Route path="/contatos" element={<Contatos />} />
          <Route path="/ads" element={<Ads />} />
          <Route path="/metas" element={<Metas />} />
          <Route path="/follow-up" element={<FollowUp />} />
          <Route path="/apologia" element={<Apologia />} />
          <Route path="/comissao" element={<Comissao />} />
          <Route path="/agency" element={<AgencyView />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BusinessProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--background-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-card)',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}
