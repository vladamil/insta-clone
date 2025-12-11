import StatusNotFound from '@/components/common/StatusPage';
import { FaSearchMinus } from 'react-icons/fa';

export default function NotFound() {
   return (
      <StatusNotFound
         title={'Page Not Found'}
         text={
            'The page you are looking for doesn’t exist or has been removed.'
         }
         icon={<FaSearchMinus />}
         button={true}
      />
   );
}
