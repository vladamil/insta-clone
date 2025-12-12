'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaCheck, FaExclamationCircle, FaSignOutAlt } from 'react-icons/fa';

import UpdateProfilePic from '@/components/account/UpdateProfilePic';
import UpdateUsername from '@/components/account/UpdateUsername';
import UpdateEmail from '@/components/account/UpdateEmail';
import UpdateDescription from '@/components/account/UpdateDescription';
import DeleteAccount from '@/components/account/DeleteAccount';
import UpdatePassword from '@/components/account/UpdatePassword';
import StatusPage from '@/components/common/StatusPage';
import Spinner from '@/components/common/Spinner';

import styles from './AccountPage.module.css';

export default function AccountPage() {
   const { user, loading, logout, getValidToken } = useAuth();
   const [userData, setUserData] = useState(user);
   const [loadData, setLoadData] = useState(false);
   const [error, setError] = useState(null);
   const router = useRouter();

   useEffect(() => {
      if (loading) return;

      const fetchUserData = async () => {
         try {
            setLoadData(true);
            const token = getValidToken();

            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?._id}`,
               {
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               }
            );

            const data = await res.json();
            if (!res.ok)
               throw new Error(data.error || 'Failed to fetch user data');
            setUserData(data);
         } catch (err) {
            setError(err.message);
         } finally {
            setLoadData(false);
         }
      };

      fetchUserData();
   }, [user, loading]);

   if (loadData) return <Spinner />;
   if (!user) return null;
   if (error)
      return (
         <StatusPage
            title={'Something Went Wrong'}
            text={`An unexpected error occurred (${error}). Please try again.`}
            icon={<FaExclamationCircle />}
         />
      );

   return (
      <div className={styles.accountContainer}>
         <div className={styles.header}>
            <h1 className={styles.title}>Account Settings</h1>
            <FaSignOutAlt
               className={styles.logoutBtn}
               size={18}
               onClick={logout}
            />
         </div>

         <div className={styles.sections}>
            <UpdateProfilePic currentPic={userData?.profilePicUrl} />
            <UpdateUsername currentUsername={userData?.username} />
            <UpdateEmail currentEmail={userData?.email} />
            <UpdatePassword />
            <UpdateDescription currentDescription={userData?.description} />
            <DeleteAccount />
         </div>
         <div className={styles.doneContainer}>
            <button
               className={styles.doneBtn}
               onClick={() => {
                  router.push('/profile');
               }}
            >
               <FaCheck size={20} />
               <span>Done</span>
            </button>
         </div>
      </div>
   );
}
