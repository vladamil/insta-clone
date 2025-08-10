import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/constants';

export default function useAuth() {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchUser = async () => {
         try {
            const token = sessionStorage.getItem('token');
            if (!token) return;

            const res = await fetch(`${API_URL}/api/me`, {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });

            const data = await res.json();

            if (!res.ok) {
               sessionStorage.removeItem('token'); // token invalid/expired
               throw new Error(data.error || 'Failed to authenticate');
               setUser(null);
            } else {
               setUser(data);
            }
         } catch (err) {
            sessionStorage.removeItem('token');
            setUser(null);
            setError(err.message);
         } finally {
            setLoading(false);
         }
      };

      fetchUser();
   }, []);

   return { user, loading, error };
}
