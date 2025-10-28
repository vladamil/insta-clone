'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import UserFollowButton from './UserFollowButton';

import styles from '../profile/ProfileInfo.module.css'; // SHARED STYLES WITH PROFILE

export default function UserHeader({ id }) {
   const [profile, setProfile] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   const router = useRouter();

   useEffect(() => {
      const fetchUserData = async () => {
         try {
            setLoading(true);
            const token = sessionStorage.getItem('token');
            if (!token) return router.replace('/login');

            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`,
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
            setError(error.message);
            setProfile(null);
         } finally {
            setLoading(false);
         }
      };

      fetchUserData();
   }, [id]);

   if (loading) return <p>Loading DATA</p>;
   if (error) return <div>ERROR: {error}</div>;
   if (!loading && !profile) return null;

   return (
      <div className={styles.header}>
         <div className={styles.avatar}>
            <Image
               src={profile.profilePicUrl || '/default-avatar.png'}
               alt={profile.username}
               width={120}
               height={120}
            />
         </div>
         <div className={styles.info}>
            <div className={styles.topRow}>
               <h2>{profile.username}</h2>

               <UserFollowButton profile={profile} setProfile={setProfile} />
            </div>
            {profile.fullName && <p>{profile.fullName}</p>}
            {profile.description && (
               <p className={styles.bio}>{profile.description}</p>
            )}

            <div className={styles.stats}>
               <span>
                  <strong>{profile.stats.posts}</strong> Posts
               </span>
               <span>
                  <strong>{profile.stats.followers}</strong> Followers
               </span>
               <span>
                  <strong>{profile.stats.following}</strong> Following
               </span>
            </div>
         </div>
      </div>
   );
}
