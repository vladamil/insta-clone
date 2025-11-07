'use client';
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from './SearchModal.module.css';
import { FaSearch, FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

export default function SearchModal({ isOpen, onClose }) {
   const [query, setQuery] = useState('');
   const [results, setResults] = useState([]);
   const [loading, setLoading] = useState(false);

   // Close modal on ESC
   useEffect(() => {
      const handleEsc = (e) => e.key === 'Escape' && onClose();
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
   }, [onClose]);

   // Fetch search results (debounced)
   useEffect(() => {
      if (!query.trim()) {
         setResults([]);
         return;
      }

      const delay = setTimeout(async () => {
         try {
            setLoading(true);
            const res = await fetch(
               `${
                  process.env.NEXT_PUBLIC_API_URL
               }/api/search?username=${encodeURIComponent(query)}`
            );
            const data = await res.json();
            setResults(data);
         } catch (error) {
            console.error('Search error:', error);
         } finally {
            setLoading(false);
         }
      }, 500);

      return () => clearTimeout(delay);
   }, [query]);

   if (!isOpen) return null;

   const modalContent = (
      <div className={styles.overlay} onClick={onClose}>
         <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
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
               <button className={styles.closeBtn} onClick={onClose}>
                  <FaTimes />
               </button>
            </div>

            {/* RESULTS */}
            <div className={styles.results}>
               {loading && <p className={styles.info}>Searching...</p>}
               {!loading && query && results.length === 0 && (
                  <p className={styles.info}>No users found</p>
               )}

               {!loading &&
                  results.map((user) => (
                     <Link
                        key={user._id}
                        href={`/users/${user.username}-${user._id}`}
                        className={styles.resultItem}
                        onClick={onClose}
                     >
                        <div className={styles.avatar}>
                           <Image
                              src={user.profilePicUrl || '/default-avatar.png'}
                              alt={user.username}
                              width={40}
                              height={40}
                           />
                        </div>
                        <div className={styles.userInfo}>
                           <p className={styles.username}>{user.username}</p>
                           <p className={styles.fullname}>Jelena Kerkez</p>
                        </div>
                     </Link>
                  ))}
            </div>
         </div>
      </div>
   );

   return ReactDOM.createPortal(modalContent, document.body);
}
