import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

export function useGetInfinitePosts({ buildUrl }) {
   const [posts, setPosts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   // pagination states
   const [page, setPage] = useState(1);
   const [hasMore, setHasMore] = useState(true);
   const [refresh, setRefresh] = useState(0);

   const { getValidToken } = useAuth();

   const loadMoreRef = useRef(null);
   // REF for preventing scroll too fast on mobile and cause multiple/double fetches at once
   const loadingFlagRef = useRef(false);

   const url = buildUrl(page);

   useEffect(() => {
      async function fetchPosts() {
         try {
            setLoading(true);

            const token = getValidToken();

            const res = await fetch(url, {
               headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (!res.ok) {
               throw new Error(data.error);
            }

            setPosts((prev) =>
               page === 1 ? data.posts : [...prev, ...data.posts],
            );

            setHasMore(data.hasMore);
         } catch (err) {
            setError(err.message);
         } finally {
            loadingFlagRef.current = false;
            setLoading(false);
         }
      }
      fetchPosts();
   }, [page, refresh]);

   // useEffect for Intersection Observer
   useEffect(() => {
      if (!loadMoreRef.current) return;

      const observer = new IntersectionObserver(
         (entries) => {
            const firstEntry = entries[0];

            if (
               firstEntry.isIntersecting &&
               hasMore &&
               !loadingFlagRef.current
            ) {
               loadingFlagRef.current = true;
               setPage((prev) => prev + 1);
            }
         },
         {
            root: null, // viewport
            rootMargin: '50px', // preload earlier
            threshold: 0,
         },
      );

      observer.observe(loadMoreRef.current);

      return () => {
         observer.disconnect();
      };
   }, [hasMore, posts.length]);

   // Function for Single Post Modal to fetch new 'batch' of posts
   function nextPostsBatch() {
      if (loadingFlagRef.current || !hasMore) return;

      loadingFlagRef.current = true;
      setPage((prev) => prev + 1);
   }

   // Refresh Posts states for add and delete post purposes
   function refreshPosts() {
      setPosts([]);
      setPage(1);
      setHasMore(true);
      setRefresh((prev) => prev + 1);
   }

   return {
      posts,
      loading,
      page,
      error,
      hasMore,
      loadMoreRef,
      nextPostsBatch,
      refreshPosts,
   };
}
