'use client';

import Link from 'next/link';
import { FaEnvelopeOpenText } from 'react-icons/fa';
import StatusPage from '@/components/common/StatusPage';

export default function CheckEmailPage() {
   return (
      <StatusPage
         icon={<FaEnvelopeOpenText />}
         title="Change email request"
         text="We've sent a verification link to your new email address.
                Please check your inbox and click the link to complete the change. 
                Your current email will remain active until the new one is confirmed."
         action={<Link href="/home">Continue</Link>}
      />
   );
}
