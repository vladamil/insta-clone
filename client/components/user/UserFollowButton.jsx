import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import styles from './UserFollowButton.module.css';

export default function UserFollowButton({ profile, setProfile, desktop }) {
   const router = useRouter();
   const { getValidToken } = useAuth();

   const handleFollow = async () => {
      try {
         const token = getValidToken();

         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${profile._id}/follow`,
            {
               method: profile.isFollowing ? 'DELETE' : 'POST',

               headers: {
                  Authorization: `Bearer ${token}`,
               },
            },
         );

         const data = await res.json();

         if (!res.ok) {
            throw new Error(data.error);
         }

         setProfile((prev) => ({
            ...prev,
            isFollowing: data.isFollowing,
            stats: {
               ...prev.stats,
               followers: data.followersCount,
               following: data.followingCount,
            },
         }));
      } catch (error) {
         console.error(error);
      }
   };

   if (profile.isSelf)
      return (
         <button
            className={`${styles.button} ${styles.edit} ${
               desktop ? styles.btnDesktop : styles.btnMobile
            }`}
            onClick={() => {
               router.push('/account');
            }}
         >
            Edit Profile
         </button>
      );

   return (
      <button
         className={`${styles.button} ${
            profile.isFollowing ? styles.unfollow : styles.follow
         } ${desktop ? styles.btnDesktop : styles.btnMobile}`}
         onClick={handleFollow}
      >
         {profile.isFollowing ? 'Unfollow' : 'Follow'}
      </button>
   );
}
