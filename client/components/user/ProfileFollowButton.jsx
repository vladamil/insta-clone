import { useRouter } from 'next/navigation';

export default function ProfileFollowButton({ profile, setProfile }) {
   const router = useRouter();
   console.log(profile);
   const handleFollow = async () => {
      try {
         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${profile.id}/follow`,
            {
               method: profile.isFollowing ? 'DELETE' : 'POST',

               headers: {
                  Authorization: `Bearer ${sessionStorage.getItem('token')}`,
               },
            }
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
            onClick={() => {
               router.push('/account');
            }}
         >
            Edit Profile
         </button>
      );

   return (
      <button onClick={handleFollow}>
         {profile.isFollowing ? 'Unfollow' : 'Follow'}
      </button>
   );
}
