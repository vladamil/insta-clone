'use client';

import { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import styles from './GuestHome.module.css';

export default function HomePage() {
   const [showRegister, setShowRegister] = useState(false);
   const [showHomeBanner, setShowHomeBanner] = useState(true);

   return (
      <div className={styles.container}>
         <div
            className={`${styles.left} ${!showHomeBanner ? styles.hidden : ''}`}
         >
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

            {/* MOBILE ONLY BUTTON */}
            <button
               className={styles.mobileContinueBtn}
               onClick={() => setShowHomeBanner(false)}
            >
               Continue →
            </button>
         </div>

         <div className={styles.right}>
            {showRegister ? (
               <RegisterForm
                  fromHome={true}
                  onToggle={() => setShowRegister(false)}
               />
            ) : (
               <LoginForm
                  fromHome={true}
                  onToggle={() => setShowRegister(true)}
               />
            )}
         </div>
      </div>
   );
}
