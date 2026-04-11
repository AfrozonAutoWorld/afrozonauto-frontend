/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Hostnames must be listed here or next/image will refuse the URL. Add any new
    // backend/storage domains (S3, Cloudinary, listing CDNs, etc.) when you introduce them.
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pexels.com', pathname: '/**' },
      { protocol: 'https', hostname: 'retail.photos.vin', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    ],
  },
};

module.exports = nextConfig;
