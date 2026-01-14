'use client';

import AuthHome from '@/components/home/AuthHome';
import MobileSuggestionsDrawer from '@/components/home/MobileSuggestionsDrawer';

export default function HomePage() {
   return (
      <>
         <AuthHome />
         <MobileSuggestionsDrawer />
      </>
   );
}
