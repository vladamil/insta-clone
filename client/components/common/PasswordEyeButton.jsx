'use client';

import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './PasswordEyeButton.module.css';

export default function PasswordEyeButton({
   showPassword,
   setShowPassword,
   style,
}) {
   return (
      <button
         style={style}
         type="button"
         onClick={() => setShowPassword((prev) => !prev)}
         aria-label={showPassword ? 'Hide password' : 'Show password'}
         className={styles.toggleBtn}
      >
         {showPassword ? <FaEye /> : <FaEyeSlash />}
      </button>
   );
}
