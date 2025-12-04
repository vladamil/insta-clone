import Link from 'next/link';
import styles from './StatusPage.module.css';

export default function NotFound({ tittle, text }) {
   return (
      <div className={styles.wrapper}>
         <div className={styles.card}>
            <div className={styles.icon}></div>

            <h1 className={styles.title}>{tittle}</h1>
            <p className={styles.message}>{text}</p>

            <Link href="/" className={styles.button}>
               Go Home
            </Link>
         </div>
      </div>
   );
}
