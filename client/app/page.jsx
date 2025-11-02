'use client';

import { useAuth } from '@/context/AuthContext';
import GuestHome from '@/components/home/GuestHome';
import AuthHome from '@/components/home/AuthHome';

export default function HomePage() {
   const { user, loading } = useAuth();

   if (loading) return <p>Loading...</p>;

   return user ? <AuthHome user={user} /> : <GuestHome />;
}
