import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import UserListModal from '../common/UserListModal';
import styles from './ProfileInfo.module.css';

export default function ProfileInfo({ user, authLoading, refresh }) {
   const [profile, setProfile] = useState(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   // for users list search
   const [type, setType] = useState('');
   const [openUserList, setOpenUserList] = useState(false);

   const router = useRouter();

   useEffect(() => {
      if (authLoading) return;

      const token = sessionStorage.getItem('token');
      if (!token) return;

      const fetchUserData = async () => {
         try {
            setLoading(true);
            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?._id}`,
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
   }, [user, authLoading, refresh]);

   if (loading && !profile) return <p>Loading...</p>;
   if (error && !loading) return <div>ERROR: {error}</div>;
   if (!loading && !profile) return null;

   return (
      <>
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
                  <h2 className={styles.username}>{profile.username}</h2>
                  <button
                     className={styles.settingsBtn}
                     onClick={() => {
                        router.push('/account');
                     }}
                  >
                     ⚙️
                     <span>Settings</span>
                  </button>
               </div>
               {!profile.fullName && (
                  <p className={styles.fullname}>Jelena Kerkez</p>
               )}
               {profile.description && (
                  <p className={styles.bio}>{profile.description}</p>
               )}

               <div className={styles.stats}>
                  <span>
                     <strong>{profile.stats.posts}</strong> Posts
                  </span>
                  <span
                     className={styles.followList}
                     onClick={() => {
                        setType('followers');
                        setOpenUserList(true);
                     }}
                  >
                     <strong>{profile.stats.followers}</strong> Followers
                  </span>
                  <span
                     className={styles.followList}
                     onClick={() => {
                        setType('followings');
                        setOpenUserList(true);
                     }}
                  >
                     <strong>{profile.stats.following}</strong> Following
                  </span>
               </div>
            </div>
         </div>

         {/* MODAL FOR SHOWING LIST OF FOLLOWERS/FOLLOWINGS */}
         <UserListModal
            isOpen={openUserList}
            title={type}
            onClose={() => {
               setOpenUserList(false);
               setType('');
            }}
            fetchUsers={() => {
               return fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user._id}/${type}`,
                  {
                     headers: {
                        Authorization: `Bearer ${sessionStorage.getItem(
                           'token'
                        )}`,
                     },
                  }
               );
            }}
         />
      </>
   );
}
