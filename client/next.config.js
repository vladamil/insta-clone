// next.config.js
// module.exports = {
//    images: {
//       remotePatterns: [
//          { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
//       ],
//    },
// };

module.exports = {
   images: {
      loader: 'custom',
      loaderFile: './lib/cloudinaryLoader.js', // global Cloudinary image loader
   },
};
