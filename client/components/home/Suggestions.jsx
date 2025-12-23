'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import UserLink from '../user/UserLink';

import styles from './Suggestions.module.css';

export default function Suggestions() {
   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   const { getValidToken } = useAuth();

   useEffect(() => {
      const token = getValidToken();

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
         const token = getValidToken();

         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}/follow`,
            {
               method: isFollowing ? 'DELETE' : 'POST',
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            }
         );

         if (!res.ok) throw new Error('Failed to follow/unfollow user');

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

   if (loading) return;
   if (error)
      return (
         <div className={styles.suggestions}>
            <div className={styles.error}>Error: ⛔ {error}</div>
         </div>
      );

   return (
      <div className={styles.suggestions}>
         <h3>Suggested for you</h3>
         <div className={styles.list}>
            {users.length === 0 ? (
               <p className={styles.empty}>No suggestions yet</p>
            ) : (
               users.map((user) => (
                  <div key={user._id} className={styles.userItem}>
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
      </div>
   );
}
