'use client';

import { useState } from 'react';
import Image from 'next/image';
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
            <h1 className={styles.title}>InstaClone</h1>

            <div className={styles.fan}>
               <Image
                  src="/images/img0.jpg"
                  alt="Main"
                  className={`${styles.img} ${styles.center}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 400px"
               />
               <Image
                  src="/images/img1.jpg"
                  alt="Left 1"
                  className={`${styles.img} ${styles.left1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 400px"
               />
               <Image
                  src="/images/img2.jpg"
                  alt="Right 1"
                  className={`${styles.img} ${styles.right1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 400px"
               />
               <Image
                  src="/images/img3.jpg"
                  alt="Left 2"
                  className={`${styles.img} ${styles.left2}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 400px"
               />
               <Image
                  src="/images/img4.jpg"
                  alt="Right 2"
                  className={`${styles.img} ${styles.right2}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 400px"
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
