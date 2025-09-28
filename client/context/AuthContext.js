'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '@/lib/constants';

const AuthContext = createContext();

export function AuthProvider({ children }) {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);
   const [authError, setAuthError] = useState(null);

   // check token and fetch current user
   useEffect(() => {
      const token = sessionStorage.getItem('token');
      if (!token) {
         setLoading(false);
         return;
      }

      const fetchUser = async () => {
         try {
            const res = await fetch(`${API_URL}/api/me`, {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });

            if (!res.ok) {
               sessionStorage.removeItem('token'); // token invalid/expired
               setUser(null);
               setAuthError('Session expired, please log in again.');
            } else {
               const data = await res.json();
               setUser(data);
               setAuthError(null);
            }
         } catch (err) {
            console.error('Auth error:', err);
            sessionStorage.removeItem('token');
            setAuthError('Failed to authenticate. Try again.');
            setUser(null);
         } finally {
            setLoading(false);
         }
      };

      fetchUser();
   }, []);

   return (
      <AuthContext.Provider value={{ user, loading, authError }}>
         {children}
      </AuthContext.Provider>
   );
}

// custom hook for easy use
export function useAuth() {
   return useContext(AuthContext);
}
