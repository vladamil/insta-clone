'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function NavLayout({ children }) {
   const { user, loading } = useAuth();
   const router = useRouter();

   useEffect(() => {
      if (!loading && !user) {
         router.replace('/');
      }
   }, [loading, user]);

   if (loading) return <div>LOADING FROM LAYOUT...</div>;
   if (!user) return null;

   return (
      <>
         <h1>LAYOUT FOR NAVIGATION</h1>
         <main>{children}</main>
      </>
   );
}
