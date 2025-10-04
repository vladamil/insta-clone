'use client';

import { useAuth } from '@/context/AuthContext';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfilePosts from '@/components/profile/ProfilePosts';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
   const { user, logout, loading: authLoading } = useAuth();

   return (
      <div className={styles.container}>
         <ProfileInfo user={user} authLoading={authLoading} logout={logout} />
         <ProfilePosts user={user} authLoading={authLoading} />
      </div>
   );
}
