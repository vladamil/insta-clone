'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfilePosts from '@/components/profile/ProfilePosts';
import CreatePostModal from '@/components/posts/CreatePostModal';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
   const [showModal, setShowModal] = useState(false);

   const { user, logout, loading: authLoading } = useAuth();

   return (
      <div className={styles.container}>
         <ProfileInfo user={user} authLoading={authLoading} logout={logout} />
         <ProfilePosts
            user={user}
            authLoading={authLoading}
            onOpenModal={() => setShowModal(true)}
         />
         <CreatePostModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
         />
      </div>
   );
}
