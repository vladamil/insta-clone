import { jwtDecode } from 'jwt-decode';

export function getValidToken() {
   const token = localStorage.getItem('token');
   if (!token) {
      window.location.href = '/';
      return null;
   }

   try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
         // token expired → logout user
         localStorage.removeItem('token');
         window.location.href = '/';
         return null;
      }

      return token;
   } catch {
      // token corrupted or invalid
      localStorage.removeItem('token');
      window.location.href = '/';
      return null;
   }
}
