'use client';

import LoginForm from '@/components/auth/LoginForm';
import styles from './LoginPage.module.css';

export default function LoginPage() {
   return (
      <div className={styles.container}>
         <LoginForm />
      </div>
   );
}
