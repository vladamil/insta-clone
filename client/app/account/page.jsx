'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

import UpdateProfilePic from '@/components/account/UpdateProfilePic';
import UpdateUsername from '@/components/account/UpdateUsername';
import UpdateEmail from '@/components/account/UpdateEmail';

export default function AccountPage() {
   const { user, loading, error } = useAuth();
   const router = useRouter();

   useEffect(() => {
      if (!loading && !user) {
         // Redirect to login if not authenticated
         router.replace('/login');
      }
   }, [user, loading]);

   if (loading && !user) return <div>LOADING...</div>;
   if (!loading && !user) return null;
   if (error) return <div>ERROR: {error.message}</div>;

   return (
      <div>
         <h1>ACCOUNT PAGE</h1>
         <UpdateProfilePic currentPic={user.profilePicUrl} />
         <UpdateUsername currentUsername={user.username} />
         <UpdateEmail currentEmail={user.email} />
      </div>
   );
}
