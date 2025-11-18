'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaHome, FaUser, FaCog, FaImage, FaSearch } from 'react-icons/fa';
import CreatePostModal from '../posts/CreatePostModal';
import SearchModal from './SearchModal';

import styles from './MobileNavigation.module.css';

export default function MobileNavigation() {
   const [showCreatePostModal, setShowCreatePostModal] = useState(false);
   const [showSearchModal, setShowSearchModal] = useState(false);

   const pathname = usePathname();
   const router = useRouter();

   return (
      <>
         <nav className={styles.mobileNav}>
            <div className={styles.mobileNavItem}>
               <Link
                  href="/home"
                  className={pathname === '/home' ? styles.active : ''}
               >
                  <FaHome />
               </Link>
            </div>
            <div className={styles.mobileNavItem}>
               <Link
                  href="/profile"
                  className={pathname === '/profile' ? styles.active : ''}
               >
                  <FaUser />
               </Link>
            </div>
            <div className={styles.mobileNavItem}>
               <button onClick={() => setShowCreatePostModal(true)}>
                  <FaImage />
               </button>
            </div>
            <div className={styles.mobileNavItem}>
               <button onClick={() => setShowSearchModal(true)}>
                  <FaSearch />
               </button>
            </div>
            <div className={styles.mobileNavItem}>
               <Link
                  href="/account"
                  className={pathname === '/account' ? styles.active : ''}
               >
                  <FaCog />
               </Link>
            </div>
         </nav>

         {/* SEARCH MODAL */}
         <SearchModal
            isOpen={showSearchModal}
            onClose={() => {
               setShowSearchModal(false);
            }}
         />
         {/* CREATE MODAL */}
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
