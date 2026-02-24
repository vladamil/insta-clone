'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
   FaHome,
   FaUser,
   FaCog,
   FaSearch,
   FaImage,
   FaSignOutAlt,
} from 'react-icons/fa';
import CreatePostModal from '../posts/CreatePostModal';
import SearchModal from './SearchModal';

import styles from './Navigation.module.css';

export default function Navigation({ logout }) {
   const [showCreatePostModal, setShowCreatePostModal] = useState(false);
   const [showSearchModal, setShowSearchModal] = useState(false);
   const pathname = usePathname();
   const router = useRouter();

   const navLinks = [
      { href: '/home', label: 'Home', icon: <FaHome size={20} /> },
      { href: '/profile', label: 'Profile', icon: <FaUser size={20} /> },
      { href: '/account', label: 'Account', icon: <FaCog size={20} /> },
   ];

   return (
      <>
         <nav className={styles.nav}>
            <div className={styles.logo}>
               <img src="/logo.png" width={170} alt="Logo" draggable="false" />
            </div>

            <ul className={styles.navList}>
               {navLinks.map(({ href, label, icon }) => (
                  <li
                     key={href}
                     className={`${styles.navItem} ${
                        pathname === href ? styles.active : ''
                     }`}
                  >
                     <Link href={href} className={styles.link}>
                        <span className={styles.icon}>{icon}</span>
                        <span>{label}</span>
                     </Link>
                  </li>
               ))}
               <li className={styles.navItem}>
                  <div
                     className={styles.link}
                     onClick={() => setShowSearchModal(true)}
                  >
                     <span className={styles.icon}>
                        <FaSearch size={20} />
                     </span>
                     <span>Search</span>
                  </div>
               </li>
               <li className={styles.navItem}>
                  <div
                     className={styles.link}
                     onClick={() => setShowCreatePostModal(true)}
                  >
                     <span className={styles.icon}>
                        <FaImage size={20} />
                     </span>
                     <span>Create</span>
                  </div>
               </li>
            </ul>

            <div className={`${styles.link} ${styles.logout}`} onClick={logout}>
               <FaSignOutAlt size={20} /> Logout
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
