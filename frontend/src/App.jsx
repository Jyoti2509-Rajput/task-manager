import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';

function Guard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-forge-bg">
      <div className="text-center">
        <div className="font-display text-acid text-5xl mb-4">TASKFORGE</div>
        <div className="font-mono text-forge-text text-xs tracking-widest">LOADING...</div>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function Public({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#111',
            color: '#fff',
            border: '1px solid #1e1e1e',
            fontFamily: 'Space Mono, monospace',
            fontSize: '12px',
            letterSpacing: '0.05em'
          },
          success: { iconTheme: { primary: '#CCFF00', secondary: '#000' } },
          error: { iconTheme: { primary: '#ff4444', secondary: '#000' } }
        }} />
        <Routes>
          <Route path="/login" element={<Public><LoginPage /></Public>} />
          <Route path="/register" element={<Public><RegisterPage /></Public>} />
          <Route path="/" element={<Guard><AppLayout /></Guard>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
