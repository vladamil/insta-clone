'use client';

import { useAuth } from '@/context/AuthContext';
import GuestHome from '@/components/home/GuestHome';

export default function HomePage() {
   const { user, loading } = useAuth();
   if (loading) return <p>Loading...</p>;
   return user ? <h1>Hello {user.username}</h1> : <GuestHome />;
}
