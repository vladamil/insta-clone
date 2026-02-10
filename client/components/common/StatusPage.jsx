import styles from './StatusPage.module.css';

export default function StatusPage({ title, text, icon, action = false }) {
   return (
      <div className={styles.wrapper}>
         <div className={styles.card}>
            <div className={styles.icon}>{icon}</div>

            <h1 className={styles.title}>{title}</h1>
            <p className={styles.message}>{text}</p>

            {action && <div className={styles.button}>{action}</div>}
         </div>
      </div>
   );
}
