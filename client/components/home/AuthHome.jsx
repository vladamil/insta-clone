'use client';

import Image from 'next/image';
import FeedPosts from './FeedPosts';

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
                     Welcome, <span>{user?.username || 'Friend'}</span>!
                  </h1>
                  <p>What’s inspiring you today?</p>
               </div>
            </div>
         </section>

         <div className={styles.container}>
            {/* LEFT SIDEBAR (optional, for future navigation) */}
            <aside className={styles.leftSidebar}>
               <div className={styles.leftBox}>
                  <h2>Menu</h2>
                  <ul>
                     <li>🏠 Home</li>
                     <li>🔍 Explore</li>
                     <li>💬 Messages</li>
                     <li>👤 Profile</li>
                  </ul>
               </div>
            </aside>

            {/* FEED SECTION */}
            <main className={styles.feed}>
               <div className={styles.feedHeader}>
                  <h1>Home Feed</h1>
               </div>
               <FeedPosts />
            </main>

            {/* SUGGESTIONS SIDEBAR */}
            <aside className={styles.rightSidebar}>
               <div className={styles.suggestionsBox}>
                  <h2>Suggestions</h2>
                  {[...Array(4)].map((_, i) => (
                     <div key={i} className={styles.suggestionItem}>
                        <div className={styles.suggestionAvatar}></div>
                        <div className={styles.suggestionInfo}>
                           <span>@suggested_user{i}</span>
                           <button>Follow</button>
                        </div>
                     </div>
                  ))}
               </div>
            </aside>
         </div>
      </>
   );
}
