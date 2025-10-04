import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './ProfileInfo.module.css';

export default function ProfileInfo({ user, authLoading, logout }) {
   const [profile, setProfile] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   const router = useRouter();

   useEffect(() => {
      if (authLoading) return;

      if (!user) {
         router.replace('/login');
         return;
      }

      const token = sessionStorage.getItem('token');
      if (!token) return router.replace('/login');

      const fetchUserData = async () => {
         try {
            setLoading(true);
            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.username}`,
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
   }, [user, authLoading]);

   if (loading && !profile) return <p>Loading...</p>;
   if (error && !loading) return <div>ERROR: {error}</div>;
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
            <h2>{profile.username}</h2>
            {/* {profile.fullName && <p>{profile.fullName}</p>} */}
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
