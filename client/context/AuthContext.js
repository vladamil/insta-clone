'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '@/lib/constants';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);
   const [authError, setAuthError] = useState(null);

   const router = useRouter();

   // Check token and fetch current user data
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

   // Login user function
   const login = async (username, password) => {
      try {
         const res = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
         });

         const data = await res.json();

         if (!res.ok) {
            throw new Error(data.error || 'Login failed');
         }

         // save token
         sessionStorage.setItem('token', data.token);

         // set user from backend response directly and redirect
         setUser(data.user);
         setAuthError(null);
         router.replace('/profile');
      } catch (err) {
         setAuthError(err.message);
      }
   };

   // Logout user function
   const logout = () => {
      sessionStorage.removeItem('token');
      setUser(null);
      setAuthError(null);
   };

   return (
      <AuthContext.Provider value={{ user, loading, authError, login, logout }}>
         {children}
      </AuthContext.Provider>
   );
}

// custom hook for easy use
export function useAuth() {
   return useContext(AuthContext);
}
