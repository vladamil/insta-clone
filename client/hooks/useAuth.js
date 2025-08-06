import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export default function useAuth() {
   const [user, setUser] = useState(null);
   const [checking, setChecking] = useState(true);

   useEffect(() => {
      try {
         const token = sessionStorage.getItem('token');
         if (token) {
            const decoded = jwtDecode(token);
            setUser(decoded); // decoded contains { id, username, ... }
         }
      } catch (err) {
         console.error('Invalid token:', err);
         sessionStorage.removeItem('token');
         setUser(null);
      } finally {
         setChecking(false);
      }
   }, []);

   return { user, checking };
}
