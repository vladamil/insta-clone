import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

   console.log(profile);

   if (loading && !profile) return <p>Loading...</p>;
   if (error && !loading) return <div>ERROR: {error}</div>;
   if (!loading && !profile) return null;

   return (
      <div>
         <h1>PROFILE: {profile.username}</h1>
         <button onClick={logout}>Logout</button>
      </div>
   );
}
