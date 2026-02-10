'use client';

import { FaEnvelopeOpenText } from 'react-icons/fa';
import StatusPage from '@/components/common/StatusPage';

export default function CheckEmailPage() {
   return (
      <StatusPage
         icon={<FaEnvelopeOpenText />}
         title="Check your email"
         text="We’ve sent a verification link to your email address. Click the link to activate your account."
      />
   );
}
