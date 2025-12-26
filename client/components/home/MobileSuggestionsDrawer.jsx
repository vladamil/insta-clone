'use client';

import { useState } from 'react';
import { FaUserPlus, FaTimes } from 'react-icons/fa';
import Suggestions from './Suggestions';
import styles from './MobileSuggestionsDrawer.module.css';

export default function MobileSuggestionsDrawer() {
   const [open, setOpen] = useState(false);

   return (
      <>
         {/* Floating button */}
         <button className={styles.fab} onClick={() => setOpen(true)}>
            <FaUserPlus />
         </button>

         {/* Overlay */}
         {open && (
            <div className={styles.overlay} onClick={() => setOpen(false)} />
         )}

         {/* Drawer */}
         <aside className={`${styles.drawer} ${open ? styles.open : ''}`}>
            <header className={styles.header}>
               <h3>Suggestions</h3>
               <button onClick={() => setOpen(false)}>
                  <FaTimes />
               </button>
            </header>

            <div className={styles.content}>
               <Suggestions />
            </div>
         </aside>
      </>
   );
}
