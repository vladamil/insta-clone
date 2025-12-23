'use client';

import Image from 'next/image';
import FeedPosts from './FeedPosts';
import Suggestions from './Suggestions';

import styles from './AuthHome.module.css';

export default function AuthHome({ user }) {
   return (
      <>
         {/* HERO SECTION */}
         <section className={styles.hero}>
            <div className={styles.banner}></div>

            <div className={styles.userInfo}>
               <div className={styles.avatarWrapper}>
                  <Image
                     src={user?.profilePicUrl || '/default-avatar.png'}
                     alt={user?.username || 'User avatar'}
                     fill
                     className={styles.avatar}
                  />
               </div>

               <div className={styles.text}>
                  <h1>
                     Welcome, <span>{user?.username || 'Guest'}</span>!
                  </h1>
                  <p>What’s inspiring you today?</p>
               </div>
            </div>
         </section>

         <div className={styles.container}>
            {/* FEED SECTION */}
            <main className={styles.feed}>
               <FeedPosts />
            </main>

            {/* SUGGESTIONS SIDEBAR */}
            <aside className={styles.sidebar}>
               <Suggestions />
            </aside>
         </div>
      </>
   );
}
