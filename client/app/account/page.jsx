'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import UpdateProfilePic from '@/components/account/UpdateProfilePic';
import UpdateUsername from '@/components/account/UpdateUsername';
import UpdateEmail from '@/components/account/UpdateEmail';
import UpdateDescription from '@/components/account/UpdateDescription';
import DeleteAccount from '@/components/account/DeleteAccount';
import UpdatePassword from '@/components/account/UpdatePassword';

export default function AccountPage() {
   const { user, loading, authError } = useAuth();
   const router = useRouter();

   useEffect(() => {
      if (!loading && !user) {
         // Redirect to login if not authenticated
         router.replace('/login');
      }
   }, [user, loading]);

   if (loading && !user) return <div>LOADING...</div>;
   if (!loading && !user) return null;
   if (authError) return <div>authError: {authError.message}</div>;

   return (
      <div>
         <h1>ACCOUNT PAGE</h1>
         <UpdateProfilePic currentPic={user.profilePicUrl} />
         <UpdateUsername currentUsername={user.username} />
         <UpdateEmail currentEmail={user.email} />
         <UpdatePassword />
         <UpdateDescription currentDescription={user.description} />
         <DeleteAccount />
      </div>
   );
}
