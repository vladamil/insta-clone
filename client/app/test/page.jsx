import StatusError from '@/components/common/StatusPage';
import { FaExclamationCircle } from 'react-icons/fa';

export default function Error() {
   return (
      <StatusError
         title={'Something Went Wrong'}
         text={'An unexpected error occurred. Please try again.'}
         icon={<FaExclamationCircle />}
      />
   );
}
