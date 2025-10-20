'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfilePosts from '@/components/profile/ProfilePosts';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
   const [refresh, setRefresh] = useState(0);
   const { user, logout, loading: authLoading } = useAuth();

   const triggerRefresh = () => {
      setRefresh((prev) => prev + 0.01);
   };

   return (
      <div className={styles.container}>
         <ProfileInfo
            user={user}
            authLoading={authLoading}
            logout={logout}
            refresh={refresh}
         />
         <ProfilePosts
            user={user}
            authLoading={authLoading}
            triggerRefresh={triggerRefresh}
            refresh={refresh}
         />
      </div>
   );
}
