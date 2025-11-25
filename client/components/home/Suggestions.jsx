'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import UserLink from '../user/UserLink';

import styles from './Suggestions.module.css';

export default function Suggestions() {
   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const fetchSuggestions = async () => {
         setLoading(true);
         try {
            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/api/discover`,
               {
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               }
            );

            if (!res.ok)
               throw new Error(res.message || 'Failed to fetch suggestions');

            const data = await res.json();
            setUsers(data);
         } catch (error) {
            setError(error.message);
         } finally {
            setLoading(false);
         }
      };

      fetchSuggestions();
   }, []);

   const handleFollow = async (id, isFollowing) => {
      try {
         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}/follow`,
            {
               method: isFollowing ? 'DELETE' : 'POST',
               headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
               },
            }
         );

         if (!res.ok) throw new Error();

         // Optimistic update:
         setUsers((prev) =>
            prev.map((user) =>
               user._id === id ? { ...user, isFollowing: !isFollowing } : user
            )
         );
      } catch (err) {
         setError(err.message);
      }
   };

   if (loading) return <div>LOADING...</div>;
   if (error) return <div>{error}</div>;

   return (
      <aside className={styles.suggestions}>
         <h3>Suggested for you</h3>

         <div className={styles.list}>
            {users.length === 0 ? (
               <p className={styles.empty}>No suggestions yet</p>
            ) : (
               users.map((user) => (
                  <div key={user._id} className={styles.userItem}>
                     {/* <div className={styles.userInfo}>
                        <Image
                           src={user.profilePicUrl || '/default-avatar.png'}
                           alt={user.username}
                           width={40}
                           height={40}
                           className={styles.avatar}
                        />
                        <div className={styles.names}>
                           <p className={styles.username}>{user.username}</p>
                           <p className={styles.realname}>Jelena Kerkez</p>
                        </div>
                     </div> */}
                     <UserLink user={user} showFullInfo={true} />

                     <button
                        onClick={() => handleFollow(user._id, user.isFollowing)}
                        className={`${styles.followBtn} ${
                           user.isFollowing ? styles.following : ''
                        }`}
                     >
                        {user.isFollowing ? 'Following' : 'Follow'}
                     </button>
                  </div>
               ))
            )}
         </div>
      </aside>
   );
}
