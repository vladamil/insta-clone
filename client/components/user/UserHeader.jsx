'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import UserFollowButton from './UserFollowButton';
import UserListModal from '../common/UserListModal';

import styles from '../profile/ProfileInfo.module.css'; // SHARED STYLES WITH PROFILE

export default function UserHeader({ id }) {
   const [profile, setProfile] = useState(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   // for users list search
   const [type, setType] = useState('');
   const [openUserList, setOpenUserList] = useState(false);

   useEffect(() => {
      const fetchUserData = async () => {
         try {
            setLoading(true);
            const token = sessionStorage.getItem('token');
            if (!token) return;

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
                  `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}/${type}`,
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
