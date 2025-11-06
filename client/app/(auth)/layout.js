'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/navigation/Navigation';
import CreatePostModal from '@/components/posts/CreatePostModal';

import styles from './Layout.module.css';

export default function NavLayout({ children }) {
   const [showCreatePostModal, setShowCreatePostModal] = useState(false);
   const { user, loading, logout } = useAuth();
   const router = useRouter();

   useEffect(() => {
      if (!loading && !user) {
         router.replace('/');
      }
   }, [loading, user]);

   if (loading) return <div>LOADING FROM LAYOUT...</div>;
   if (!user) return null;

   return (
      <>
         <div className={styles.container}>
            <aside className={styles.sidebar}>
               <Navigation
                  onCreate={() => setShowCreatePostModal(true)}
                  logout={logout}
               />
            </aside>

            <main className={styles.main}>{children}</main>
         </div>
         <CreatePostModal
            isOpen={showCreatePostModal}
            onClose={() => {
               setShowCreatePostModal(false);
            }}
            onPostCreated={() => {
               router.replace('/');
            }}
         />
      </>
   );
}
