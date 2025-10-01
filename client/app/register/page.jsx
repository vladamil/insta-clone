'use client';

import RegisterForm from '@/components/auth/RegisterForm';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
   return (
      <div className={styles.container}>
         <RegisterForm />
      </div>
   );
}
