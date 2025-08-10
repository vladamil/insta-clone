'use client';

import useAuth from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
   const { user, loading, error } = useAuth();
   const router = useRouter();

   useEffect(() => {
      if (!loading && !user) {
         // Redirect to login if not authenticated
         router.replace('/login');
      }
   }, [user, loading]);

   if (loading && !user) return <p>Loading...</p>;
   if (!loading && !user) return null;

   return (
      <div>
         <h1>Welcome, {user.username}</h1>
         <p>This is your private dashboard 👀</p>
         <p>Your email is {user.email}</p>
         <p>Joined at: {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>
   );
}
