'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import styles from './Navigation.module.css';

export default function Navigation() {
   const pathname = usePathname();

   const navLinks = [
      { href: '/home', label: 'Home' },
      { href: '/explore', label: 'Explore' },
      { href: '/profile', label: 'Profile' },
   ];

   return (
      <nav className={styles.nav}>
         <h2 className={styles.logo}>MyApp</h2>

         <ul className={styles.navList}>
            {navLinks.map(({ href, label, icon }) => (
               <li
                  key={href}
                  className={`${styles.navItem} ${
                     pathname === href ? styles.active : ''
                  }`}
               >
                  <Link href={href} className={styles.link}>
                     <span className={styles.icon}>ICON</span>
                     <span>{label}</span>
                  </Link>
               </li>
            ))}
         </ul>
      </nav>
   );
}
