import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Simulations from './pages/Simulations';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import SimulationDetail from './pages/SimulationDetail';
import NewSimulation from './pages/NewSimulation';

import { Box } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
  },
});

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          pt: 8, // Account for header height
          pl: sidebarOpen ? 30 : 8, // Account for sidebar width
          transition: 'padding-left 0.3s ease',
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/simulations" 
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <Simulations />
                    </AppLayout>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/simulations/new" 
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <NewSimulation />
                    </AppLayout>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/simulations/:id" 
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <SimulationDetail />
                    </AppLayout>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <AppLayout>
                      <Profile />
                    </AppLayout>
                  </PrivateRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;