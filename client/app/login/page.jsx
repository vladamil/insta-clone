'use client';

import { useAuth } from '@/context/AuthContext';
import AuthForm from '@/components/auth/LoginForm';
import styles from './LoginPage.module.css';

export default function LoginPage() {
   const { login, authError } = useAuth();

   return (
      <div className={styles.container}>
         <AuthForm login={login} authError={authError} styles={styles} />
      </div>
   );
}
