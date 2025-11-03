'use client';

import { useParams } from 'next/navigation';

import UserHeader from '@/components/user/UserHeader';
import UserPosts from '@/components/user/UserPosts';

import styles from './UserPage.module.css';

export default function ProfilePage() {
   const { slug } = useParams();

   const id = slug.split('-').pop();

   return (
      <div className={styles.container}>
         <UserHeader id={id} />
         <UserPosts id={id} />
      </div>
   );
}
