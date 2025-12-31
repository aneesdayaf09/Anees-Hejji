import { supabase, isCloudEnabled } from './supabase';
import { User, RequestItem } from '../types';

// LOCAL STORAGE KEYS
const LS_USERS = 'apfiles_users';
const LS_REQUESTS = 'apfiles_requests';

// --- HELPERS FOR LOCAL STORAGE ---
const getLS = (key: string) => {
  const s = localStorage.getItem(key);
  return s ? JSON.parse(s) : [];
};
const setLS = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

// --- DATA OPERATIONS ---

export const dataStore = {
  // --- USERS ---
  
  // Create or Update User
  saveUser: async (user: User) => {
    if (isCloudEnabled && supabase) {
      // Upsert: Insert or Update if id exists
      await supabase.from('users').upsert(user);
    } else {
      const users = getLS(LS_USERS);
      const index = users.findIndex((u: User) => u.id === user.id);
      if (index >= 0) {
        users[index] = { ...users[index], ...user };
      } else {
        users.push(user);
      }
      setLS(LS_USERS, users);
    }
  },

  updateUserPartial: async (id: string, updates: Partial<User>) => {
    if (isCloudEnabled && supabase) {
      await supabase.from('users').update(updates).eq('id', id);
    } else {
      const users = getLS(LS_USERS);
      const updated = users.map((u: User) => u.id === id ? { ...u, ...updates } : u);
      setLS(LS_USERS, updated);
    }
  },

  deleteUser: async (id: string) => {
    if (isCloudEnabled && supabase) {
        // Delete requests first (though we could cascade in SQL, we do it explicitly here for safety)
        await supabase.from('requests').delete().eq('userId', id);
        // Delete user
        await supabase.from('users').delete().eq('id', id);
    } else {
      const users = getLS(LS_USERS).filter((u: User) => u.id !== id);
      const requests = getLS(LS_REQUESTS).filter((r: RequestItem) => r.userId !== id);
      setLS(LS_USERS, users);
      setLS(LS_REQUESTS, requests);
    }
  },

  // --- REQUESTS ---

  addRequest: async (request: RequestItem) => {
    if (isCloudEnabled && supabase) {
      await supabase.from('requests').insert(request);
    } else {
      const reqs = getLS(LS_REQUESTS);
      reqs.push(request);
      setLS(LS_REQUESTS, reqs);
    }
  },

  updateRequest: async (id: string, updates: Partial<RequestItem>) => {
    if (isCloudEnabled && supabase) {
      await supabase.from('requests').update(updates).eq('id', id);
    } else {
      const reqs = getLS(LS_REQUESTS);
      const updated = reqs.map((r: RequestItem) => r.id === id ? { ...r, ...updates } : r);
      setLS(LS_REQUESTS, updated);
    }
  },

  // Update denormalized user data in all their requests
  syncUserToRequests: async (userId: string, name: string, phone: string) => {
    if (isCloudEnabled && supabase) {
        await supabase
          .from('requests')
          .update({ userName: name, userPhone: phone })
          .eq('userId', userId);
    } else {
        const reqs = getLS(LS_REQUESTS);
        const updated = reqs.map((r: RequestItem) => {
            if (r.userId === userId) {
                return { ...r, userName: name, userPhone: phone };
            }
            return r;
        });
        setLS(LS_REQUESTS, updated);
    }
  }
};