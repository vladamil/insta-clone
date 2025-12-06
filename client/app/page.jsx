'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import GuestHome from '@/components/home/GuestHome';
import PageLoader from '@/components/common/PageLoader';

export default function HomePage() {
   const { user, loading } = useAuth();

   const router = useRouter();

   // Redirect to /Home if there is a User
   useEffect(() => {
      if (!loading && user) {
         router.replace('/home');
      }
   }, [loading, user, router]);

   if (loading) return <PageLoader />;
   if (user) return null;

   return <GuestHome />;
}
