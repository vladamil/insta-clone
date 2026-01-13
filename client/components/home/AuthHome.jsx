'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import FeedPosts from './FeedPosts';
import Suggestions from './Suggestions';

import styles from './AuthHome.module.css';

export default function AuthHome({ user, getValidToken }) {
   const [profile, setProfile] = useState(null);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      setLoading(true);
      const token = getValidToken();

      const fetchProfile = async () => {
         try {
            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user._id}`,
               {
                  headers: { Authorization: `Bearer ${token}` },
               }
            );
            const data = await res.json();

            if (!res.ok) {
               throw new Error(data.error);
            }

            setProfile(data);
         } catch (error) {
            console.log(error);
            setProfile(null);
         } finally {
            setLoading(false);
         }
      };

      fetchProfile();
   }, [user]);

   if (loading || !profile) return;

   return (
      <>
         {/* HERO SECTION */}
         <section className={styles.hero}>
            <div className={styles.banner}></div>

            <div className={styles.userInfo}>
               <div className={styles.avatarWrapper}>
                  <Image
                     src={profile.profilePicUrl || '/default-avatar.png'}
                     alt={profile.username || 'User avatar'}
                     fill
                     className={styles.avatar}
                  />
               </div>

               <div className={styles.text}>
                  <h1>
                     Welcome, <span>{profile.username || 'Guest'}</span>!
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
