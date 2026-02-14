'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '@/lib/constants';

const AuthContext = createContext();

export function AuthProvider({ children }) {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);
   const [authError, setAuthError] = useState(null);

   // Check token and fetch current user data
   useEffect(() => {
      const token = localStorage.getItem('token');
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
               localStorage.removeItem('token'); // token invalid/expired
               setUser(null);
               setAuthError('Session expired, please log in again.');
            } else {
               const data = await res.json();
               setUser(data);
               setAuthError(null);
            }
         } catch (err) {
            localStorage.removeItem('token');
            setAuthError('Service temporarily unavailable. Please try again.');
            setUser(null);
         } finally {
            setLoading(false);
         }
      };

      fetchUser();
   }, []);

   // Register user function
   const register = async (username, realname, email, password) => {
      try {
         const res = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, realname, email, password }),
         });

         const data = await res.json();

         if (!res.ok) {
            throw new Error(data.error || 'Registration failed');
         }

         // success message
         return {
            success: true,
            message: 'Registration successful! You can now log in.',
         };
      } catch (err) {
         // error message
         return {
            success: false,
            message: err.message || 'Something went wrong. Please try again.',
         };
      }
   };

   // Login user function
   const login = async (username, password) => {
      try {
         const res = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
         });

         const data = await res.json();

         if (!res.ok) {
            return {
               success: false,
               message: data.error || 'Login failed',
               code: data.code || null,
            };
         }

         localStorage.setItem('token', data.token);
         setUser(data.user);

         return {
            success: true,
         };
      } catch (err) {
         return {
            success: false,
            message: err.message || 'Something went wrong. Please try again.',
         };
      }
   };

   // Logout user function
   const logout = () => {
      localStorage.removeItem('token');
      setUser(null);
      setAuthError(null);
   };

   // Central token validator inside context
   const getValidToken = () => {
      const token = localStorage.getItem('token');
      if (!token) {
         logout();
         return null;
      }

      try {
         const decoded = jwtDecode(token);
         const now = Date.now() / 1000;

         if (decoded.exp < now) {
            logout();
            return null;
         }

         return token;
      } catch {
         logout();
         return null;
      }
   };

   return (
      <AuthContext.Provider
         value={{
            user,
            loading,
            authError,
            register,
            login,
            logout,
            getValidToken,
         }}
      >
         {children}
      </AuthContext.Provider>
   );
}

// Custom hook for easy use
export function useAuth() {
   return useContext(AuthContext);
}
