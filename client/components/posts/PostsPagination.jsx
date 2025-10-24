'use client';

import styles from './PostsPagination.module.css';

export default function PostsPagination({ page, setPage, totalPages }) {
   return (
      <div className={styles.pagination}>
         <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className={styles.pageBtn}
         >
            ← Prev
         </button>

         {[...Array(totalPages)].map((_, i) => (
            <button
               key={i}
               onClick={() => setPage(i + 1)}
               className={`${styles.pageBtn} ${
                  page === i + 1 ? styles.active : ''
               }`}
            >
               {i + 1}
            </button>
         ))}

         <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className={styles.pageBtn}
         >
            Next →
         </button>
      </div>
   );
}
