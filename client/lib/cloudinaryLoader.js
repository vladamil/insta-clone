const isCloudinaryUrl = (src) =>
   typeof src === 'string' &&
   src.includes('res.cloudinary.com') &&
   src.includes('/upload/');

export default function cloudinaryLoader({ src, width }) {
   // If it's NOT a Cloudinary image → return as-is
   if (!isCloudinaryUrl(src)) {
      return src;
   }

   // Inject Cloudinary transformations
   return src.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
}
