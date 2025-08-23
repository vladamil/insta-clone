export default function ProfileFollowButton({ profile, setProfile }) {
   const handleFollow = async () => {
      console.log(profile);

      try {
         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${profile.username}/follow`,
            {
               method: profile.isFollowing ? 'DELETE' : 'POST',

               headers: {
                  Authorization: `Bearer ${sessionStorage.getItem('token')}`,
               },
            }
         );

         const data = await res.json();
         console.log('DATA:', data);

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

   return (
      <button onClick={handleFollow}>
         {profile.isFollowing ? 'Unfollow' : 'Follow'}
      </button>
   );
}
