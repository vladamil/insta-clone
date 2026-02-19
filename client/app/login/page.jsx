'use client';

import LoginForm from '@/components/auth/LoginForm';
import styles from './LoginPage.module.css';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function LoginPage() {
   const searchParams = useSearchParams();
   const resetSuccess = searchParams.get('reset');

   const router = useRouter();

   const [successMessage, setSuccessMessage] = useState('');

   // Effect for successfuly changed forgot password
   useEffect(() => {
      if (resetSuccess === 'success') {
         setSuccessMessage(
            'Your password has been successfully reset. You can now log in.',
         );
      }
      router.replace('/login');
   }, [resetSuccess]);

   return (
      <div className={styles.container}>
         {successMessage && <p className={styles.success}>{successMessage}</p>}
         <LoginForm />
      </div>
   );
}
