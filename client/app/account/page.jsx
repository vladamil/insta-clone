'use client';

import useAuth from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
   const { user, checking } = useAuth();
   const router = useRouter();

   useEffect(() => {
      if (!checking && !user) {
         // Redirect to login if not authenticated
         router.replace('/login');
      }
   }, [user, checking]);

   if (checking && !user) return <p>Loading...</p>;
   if (!checking && !user) return null;

   return (
      <div>
         <h1>Welcome, {user?.username}</h1>
         <p>This is your private dashboard 👀</p>
      </div>
   );
}
