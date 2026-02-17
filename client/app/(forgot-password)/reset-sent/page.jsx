'use client';

import { FaEnvelopeOpenText } from 'react-icons/fa';
import StatusPage from '@/components/common/StatusPage';

export default function ResetSentPage() {
   return (
      <StatusPage
         icon={<FaEnvelopeOpenText />}
         title="Check your email"
         text="We’ve sent a password reset link to your email address. Click the link to reset your password."
      />
   );
}
