'use client';

import { useAuth } from '@/context/AuthContext';
import AuthHome from '@/components/home/AuthHome';
import MobileSuggestionsDrawer from '@/components/home/MobileSuggestionsDrawer';

export default function HomePage() {
   const { user, loading } = useAuth();

   if (loading) return;

   return (
      <>
         <AuthHome user={user} />
         <MobileSuggestionsDrawer />
      </>
   );
}
