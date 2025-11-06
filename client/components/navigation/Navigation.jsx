'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
   FaHome,
   FaUser,
   FaCog,
   FaSearch,
   FaImage,
   FaSignOutAlt,
} from 'react-icons/fa';

import styles from './Navigation.module.css';

export default function Navigation({ onCreate }) {
   const pathname = usePathname();

   const navLinks = [
      { href: '/home', label: 'Home', icon: <FaHome size={20} /> },
      { href: '/profile', label: 'Profile', icon: <FaUser size={20} /> },
      { href: '/account', label: 'Account', icon: <FaCog size={20} /> },
   ];

   return (
      <>
         <nav className={styles.nav}>
            <h2 className={styles.logo}>InstaClone</h2>

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
               <li
                  className={`${styles.navItem} ${false ? styles.active : ''}`}
               >
                  <div className={styles.link}>
                     <span className={styles.icon}>
                        <FaSearch size={20} />
                     </span>
                     <span>Search</span>
                  </div>
               </li>
               <li
                  className={`${styles.navItem} ${false ? styles.active : ''}`}
               >
                  <div className={styles.link} onClick={onCreate}>
                     <span className={styles.icon}>
                        <FaImage size={20} />
                     </span>
                     <span>Create</span>
                  </div>
               </li>
            </ul>

            <div className={styles.link}>
               <FaSignOutAlt size={20} /> Logout
            </div>
         </nav>
      </>
   );
}
