'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/navigation/Navigation';
import MobileNavigation from '@/components/navigation/MobileNavigation';
import PageLoader from '@/components/common/PageLoader';

import styles from './Layout.module.css';

export default function NavLayout({ children }) {
   const { user, loading, logout } = useAuth();
   const router = useRouter();

   useEffect(() => {
      if (!loading && !user) {
         router.replace('/');
      }
   }, [loading, user]);

   if (loading) return <PageLoader />;
   if (!user) return null;

   return (
      <div className={styles.container}>
         <aside className={styles.sidebar}>
            <Navigation logout={logout} />
         </aside>

         <main className={styles.main}>{children}</main>
         <MobileNavigation />
      </div>
   );
}
