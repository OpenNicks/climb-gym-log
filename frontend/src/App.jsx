import React, { useState, useEffect } from 'react';
import { mockGyms } from './mockData';
import BoulderPage from './pages/BoulderPage';
import RoutePage from './pages/RoutePage';
import StatsPage from './pages/StatsPage';
import Navigation from './components/Navigation';
import LogAscentForm from './components/LogAscentForm';
import MyAscents from './components/MyAscents';
import Auth from './components/Auth';
import { useNotification } from './components/NotificationProvider';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AscentsProvider, useAscents } from './contexts/AscentsContext';
import './styles/App.css';

/**
 * Main App component wrapped in context providers
 */
function AppWithProviders() {
  return (
    <AuthProvider>
      <AscentsProvider>
        <App />
      </AscentsProvider>
    </AuthProvider>
  );
}

/**
 * Core application component using context hooks
 */
function App() {
  // Navigation and page state
  const [currentPage, setCurrentPage] = useState('boulders');
  // Show/hide log ascent form
  const [showLogForm, setShowLogForm] = useState(false);
  const [logFormType, setLogFormType] = useState('boulder');
  // For editing ascents
  const [editAscent, setEditAscent] = useState(null);
  
  // Auth and ascents from context
  const { user, isAuthenticated } = useAuth();
  const { ascents, loading, error, addAscent, updateAscent, deleteAscent } = useAscents();
  
  // Notifications system
  const { showNotification } = useNotification();

  // For single-gym MVP, we'll use the first gym from mock data
  const singleGym = mockGyms[0];

  // Welcome notification when page loads
  useEffect(() => {
    showNotification(`Welcome to ${singleGym.name} Climbing Tracker`, 'info');
  }, [showNotification, singleGym.name]);

  // Handle navigation between pages
  const handleNavigate = (page) => {
    if (!['boulders', 'routes', 'myascents', 'stats'].includes(page)) {
      showNotification('Invalid navigation target', 'error');
      return;
    }
    setCurrentPage(page);
    showNotification(`Viewing ${page}`, 'success');
  };

  // Handle ascent logging using context
  const handleLogAscent = async (ascent) => {
    const result = editAscent 
      ? await updateAscent(editAscent.id, ascent)
      : await addAscent(ascent);
      
    if (result.success) {
      setShowLogForm(false);
      setEditAscent(null);
    }
  };
  
  // Handle delete with confirmation
  const handleDeleteAscent = async (id) => {
    await deleteAscent(id);
  };
  
  // Handle edit ascent
  const handleEditAscent = (ascent) => {
    setLogFormType(ascent.climb_type);
    setShowLogForm(true);
    setEditAscent(ascent);
  };

  return (
    <div className="app-container">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      <Auth />
      {loading && <div>Loading...</div>}
      {error && <div className="form-error">{error}</div>}
      
      {isAuthenticated && currentPage === 'boulders' && (
        <BoulderPage 
          gym={singleGym} 
          onLogAscent={() => { setShowLogForm(true); setLogFormType('boulder'); }} 
        />
      )}
      
      {isAuthenticated && currentPage === 'routes' && (
        <RoutePage 
          gym={singleGym} 
          onLogAscent={() => { setShowLogForm(true); setLogFormType('route'); }} 
        />
      )}
      
      {isAuthenticated && (currentPage === 'boulders' || currentPage === 'routes') && showLogForm && (
        <LogAscentForm 
          climbType={logFormType} 
          onSubmit={handleLogAscent}
          editAscent={editAscent}
        />
      )}
      
      {isAuthenticated && currentPage === 'myascents' && (
        <MyAscents 
          ascents={ascents.filter(a => a.user_id === user.id)} 
          onDeleteAscent={handleDeleteAscent}
          onEditAscent={handleEditAscent}
        />
      )}
      
      {!isAuthenticated && <div style={{marginTop:'2rem'}}>Please log in to track your ascents.</div>}
      
      {currentPage === 'stats' && <StatsPage />}
    </div>
  );
}

export default AppWithProviders;
