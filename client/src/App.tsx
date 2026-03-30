import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ContractListPage from './pages/ContractListPage';
import ContractDetailPage from './pages/ContractDetailPage';
import ContractFormPage from './pages/ContractFormPage';
import PartnerListPage from './pages/PartnerListPage';
import PartnerFormPage from './pages/PartnerFormPage';
import UserListPage from './pages/UserListPage';
import UserFormPage from './pages/UserFormPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/contracts" element={<ContractListPage />} />
                <Route path="/contracts/new" element={<ContractFormPage />} />
                <Route path="/contracts/:id" element={<ContractDetailPage />} />
                <Route path="/contracts/:id/edit" element={<ContractFormPage />} />
                <Route path="/partners" element={<PartnerListPage />} />
                <Route path="/partners/new" element={<PartnerFormPage />} />
                <Route path="/partners/:id/edit" element={<PartnerFormPage />} />
                <Route path="/users" element={<UserListPage />} />
                <Route path="/users/new" element={<UserFormPage />} />
                <Route path="/users/:id/edit" element={<UserFormPage />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
