'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/navigation/Navigation';
import MobileNavigation from '@/components/navigation/MobileNavigation';
import PageLoader from '@/components/common/PageLoader';
import StatusPage from '@/components/common/StatusPage';

import styles from './Layout.module.css';

export default function NavLayout({ children }) {
   const { user, loading, logout, authError } = useAuth();
   const router = useRouter();

   useEffect(() => {
      if (!loading && !user) {
         router.replace('/');
      }
   }, [loading, user]);

   if (loading) return <PageLoader />;
   if (authError)
      return (
         <StatusPage
            title={'Something Went Wrong'}
            text={'Authentication error. Please try again.'}
            icon={<FaExclamationCircle />}
         />
      );
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
