import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { StudentDashboard } from './components/StudentDashboard';
import { BuilderDashboard } from './components/BuilderDashboard';
import { User, RequestItem, Subject, UserRole, RequestType, MaterialCategory } from './types';

// Helper to save state for demo persistence
const loadRequests = (): RequestItem[] => {
  const saved = localStorage.getItem('apfiles_requests');
  return saved ? JSON.parse(saved) : [];
};

const loadUsers = (): User[] => {
  const saved = localStorage.getItem('apfiles_users');
  return saved ? JSON.parse(saved) : [];
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Load initial data
    setRequests(loadRequests());
    setUsers(loadUsers());
  }, []);

  useEffect(() => {
    localStorage.setItem('apfiles_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('apfiles_users', JSON.stringify(users));
  }, [users]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleRegister = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleStudentRequest = (
    subject: Subject, 
    unit: string, 
    type: RequestType, 
    materialCategory?: MaterialCategory, 
    attachedFile?: File,
    description?: string
  ) => {
    if (!user) return;
    
    const newRequest: RequestItem = {
      id: generateId(),
      userId: user.id,
      userName: user.fullName,
      userPhone: user.phoneNumber,
      subject,
      unit,
      type,
      materialCategory,
      attachedFileName: attachedFile ? attachedFile.name : undefined,
      description: description || undefined,
      status: 'PENDING',
      createdAt: Date.now()
    };
    
    setRequests(prev => [...prev, newRequest]);
  };

  const handleBuilderUpdate = (id: string, updates: Partial<RequestItem>) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, ...updates } : req
    ));
  };

  return (
    <Layout user={user} onLogout={handleLogout}>
      {!user ? (
        <Auth 
          onLogin={handleLogin} 
          onRegister={handleRegister}
          users={users}
        />
      ) : user.role === UserRole.BUILDER ? (
        <BuilderDashboard 
          requests={requests} 
          onUpdateRequest={handleBuilderUpdate} 
          users={users}
        />
      ) : (
        <StudentDashboard 
          user={user} 
          requests={requests} 
          onRequest={handleStudentRequest} 
        />
      )}
    </Layout>
  );
};

export default App;