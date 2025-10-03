'use client';

import { useAuth } from '@/context/AuthContext';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfilePosts from '@/components/profile/ProfilePosts';

export default function ProfilePage() {
   const { user, logout, loading: authLoading } = useAuth();

   return (
      <div>
         <ProfileInfo user={user} authLoading={authLoading} logout={logout} />
         <ProfilePosts user={user} authLoading={authLoading} />
      </div>
   );
}
