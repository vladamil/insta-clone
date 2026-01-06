'use client';
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from './SearchModal.module.css';
import { FaSearch, FaTimes } from 'react-icons/fa';
import UserLink from '../user/UserLink';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

export default function SearchModal({ isOpen, onClose }) {
   const [query, setQuery] = useState('');
   const [results, setResults] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   const handleCloseSearch = () => {
      onClose();
      setQuery('');
   };

   useLockBodyScroll(isOpen);
   // Close modal on ESC
   useEffect(() => {
      const handleEsc = (e) => {
         if (e.key === 'Escape') {
            handleCloseSearch();
         }
      };

      document.addEventListener('keydown', handleEsc);

      return () => document.removeEventListener('keydown', handleEsc);
   }, [onClose]);

   // Fetch search results (debounced)
   useEffect(() => {
      if (!query.trim()) {
         setResults([]);
         setLoading(false);
         return;
      }

      setLoading(true);

      const delay = setTimeout(async () => {
         try {
            const res = await fetch(
               `${
                  process.env.NEXT_PUBLIC_API_URL
               }/api/search?q=${encodeURIComponent(query)}`
            );
            const data = await res.json();
            setResults(data);
         } catch (error) {
            setError(error.message);
         } finally {
            setLoading(false);
         }
      }, 500);

      return () => clearTimeout(delay);
   }, [query]);

   if (!isOpen) return null;

   const modalContent = (
      <div className={styles.overlay}>
         <div className={styles.modal}>
            {/* HEADER */}
            <div className={styles.header}>
               <div className={styles.inputWrapper}>
                  <FaSearch className={styles.searchIcon} />
                  <input
                     type="text"
                     placeholder="Search for users..."
                     value={query}
                     onChange={(e) => setQuery(e.target.value)}
                     autoFocus
                  />
               </div>
               <button className={styles.closeBtn} onClick={handleCloseSearch}>
                  <FaTimes />
               </button>
            </div>

            {/* RESULTS */}
            <div className={styles.results}>
               {loading && <p className={styles.info}>Searching...</p>}
               {!loading && query && results.length === 0 && (
                  <p className={styles.info}>No users found</p>
               )}
               {error && <p className={styles.info}>{error}</p>}
               {!loading &&
                  results.map((user) => (
                     <UserLink
                        key={user._id}
                        user={user}
                        showFullInfo={true}
                        onClick={handleCloseSearch}
                        className={styles.resultItem}
                     />
                  ))}
            </div>
         </div>
      </div>
   );

   return ReactDOM.createPortal(modalContent, document.body);
}
