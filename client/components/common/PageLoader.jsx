'use client';

import styles from './PageLoader.module.css';

export default function PageLoader() {
   return (
      <div className={styles.loadingContainer}>
         <span className={styles.loader}></span>
      </div>
   );
}
