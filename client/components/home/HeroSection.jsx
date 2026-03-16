'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Greetings from './Greetings';

import styles from './HeroSection.module.css';

export default function Hero() {
   const [profile, setProfile] = useState(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   const { user, getValidToken } = useAuth();

   useEffect(() => {
      setLoading(true);
      const token = getValidToken();

      const fetchProfile = async () => {
         try {
            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user._id}`,
               {
                  headers: { Authorization: `Bearer ${token}` },
               },
            );
            const data = await res.json();

            if (!res.ok) {
               throw new Error(data.error);
            }

            setProfile(data);
         } catch (error) {
            setError('Failed to load profile data.');
            setProfile(null);
         } finally {
            setLoading(false);
         }
      };

      fetchProfile();
   }, [user]);

   if (loading) return;
   if (error && !loading)
      return <div className={styles.error}>ERROR: ⛔ {error}</div>;
   if (!loading && !profile) return null;

   return (
      <div className={styles.userInfo}>
         <div className={styles.avatarWrapper}>
            <Image
               src={profile.profilePicUrl || '/default-avatar.png'}
               alt={profile.username || 'User avatar'}
               width={90}
               height={90}
            />
         </div>
         <Greetings profile={profile} />
      </div>
   );
}
