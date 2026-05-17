import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence } from 'framer-motion';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RoomManagement from './pages/RoomManagement';
import SectionManagement from './pages/SectionManagement';
import RoutineMaker from './pages/RoutineMaker';

// Components
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

// Redux
import { loadUser } from './redux/slices/authSlice';

// Styles
import './styles/components/navbar.css';
import './styles/components/sidebar.css';
import './styles/components/cards.css';
import './styles/components/routine.css';
import './styles/components/forms.css';
import './styles/components/buttons.css';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => {
  const { sidebarOpen } = useSelector((state) => state.ui);
  
  return (
    <div className="app-layout">
      <Navbar />
      <div className="app-container">
        <Sidebar />
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state) => state.ui);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/rooms"
          element={
            <PrivateRoute>
              <AppLayout>
                <RoomManagement />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/sections"
          element={
            <PrivateRoute>
              <AppLayout>
                <SectionManagement />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/routine"
          element={
            <PrivateRoute>
              <AppLayout>
                <RoutineMaker />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/routine/:id"
          element={
            <PrivateRoute>
              <AppLayout>
                <RoutineMaker />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;