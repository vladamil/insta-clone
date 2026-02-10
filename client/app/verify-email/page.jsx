'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaEnvelopeOpenText } from 'react-icons/fa';
import StatusPage from '@/components/common/StatusPage';
import Spinner from '@/components/common/Spinner';

export default function VerifyEmailPage() {
   const searchParams = useSearchParams();
   const token = searchParams.get('token');

   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [success, setSuccess] = useState(false);

   useEffect(() => {
      if (!token) {
         setError('Missing verification token.');
         setLoading(false);
         return;
      }

      const verifyEmail = async () => {
         try {
            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/api/verify-email?token=${token}`,
            );

            const data = await res.json();

            if (!res.ok) {
               throw new Error(data.error || 'Verification failed');
            }

            setSuccess(true);
         } catch (err) {
            setError(err.message);
         } finally {
            setLoading(false);
         }
      };

      verifyEmail();
   }, [token]);

   if (loading) {
      return <Spinner />;
   }

   if (error) {
      return (
         <StatusPage
            title={'Email is not verified'}
            text={error}
            icon={<FaEnvelopeOpenText />}
            action={<Link href="/login">Back to login</Link>}
         />
      );
   }

   if (success) {
      return (
         <StatusPage
            title={'Email verified'}
            text={'Your account is now active. You can log in.'}
            icon={<FaEnvelopeOpenText />}
            action={<Link href="/login">Go to login</Link>}
         />
      );
   }
}
