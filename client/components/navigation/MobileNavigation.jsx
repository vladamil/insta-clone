'use client';

import Link from 'next/link';
import { FaHome, FaUser, FaImage, FaSearch } from 'react-icons/fa';

import styles from './MobileNavigation.module.css';

export default function MobileNavigation({ onOpenSearch, onOpenMoreMenu }) {
   return (
      <nav className={styles.mobileNav}>
         <button onClick={() => (window.location.href = '/')}>
            <FaHome />
         </button>

         <button onClick={onOpenSearch}>
            <FaSearch />
         </button>

         <button onClick={() => (window.location.href = '/create')}>
            <FaImage />
         </button>

         <button onClick={() => (window.location.href = '/profile')}>
            <FaUser />
         </button>

         {/* Overflow / More menu */}
         <button className="more" onClick={onOpenMoreMenu}>
            ⋮
         </button>
      </nav>
   );
}
