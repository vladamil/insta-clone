'use client';

import Hero from './HeroSection';
import FeedPosts from './FeedPosts';
import Suggestions from './Suggestions';

import styles from './AuthHome.module.css';

export default function AuthHome() {
   return (
      <>
         {/* HERO SECTION */}
         <section className={styles.hero}>
            <div className={styles.banner}></div>
            <Hero />
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
