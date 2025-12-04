import StatusNotFound from '@/components/common/StatusNotFound';

export default function NotFound() {
   return (
      <StatusNotFound
         tittle={'Page Not Found'}
         text={
            'The page you are looking for doesn’t exist or has been removed.'
         }
      />
   );
}
