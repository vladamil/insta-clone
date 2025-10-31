'use client';

import Image from 'next/image';
import LoginForm from '@/components/auth/LoginForm';
import styles from './page.module.css';

export default function HomePage() {
   return (
      <div className={styles.container}>
         <div className={styles.left}>
            <h1 className={styles.title}>Instaclone</h1>

            <div className={styles.fan}>
               <img
                  src="images/img0.jpg"
                  alt="Main"
                  className={`${styles.img} ${styles.center}`}
               />
               <img
                  src="images/img1.jpg"
                  alt="Left 1"
                  className={`${styles.img} ${styles.left1}`}
               />
               <img
                  src="images/img2.jpg"
                  alt="Right 1"
                  className={`${styles.img} ${styles.right1}`}
               />
               <img
                  src="images/img3.jpg"
                  alt="Left 2"
                  className={`${styles.img} ${styles.left2}`}
               />
               <img
                  src="images/img4.jpg"
                  alt="Right 2"
                  className={`${styles.img} ${styles.right2}`}
               />
            </div>
         </div>

         <div className={styles.right}>
            <LoginForm />
         </div>
      </div>
   );
}
