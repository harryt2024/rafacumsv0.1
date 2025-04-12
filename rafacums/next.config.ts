// next.config.ts
import type { NextConfig } from 'next'; // Import the NextConfig type

const nextConfig: NextConfig = { // Type the configuration object
  reactStrictMode: true, // Or other options you might have
  // ... other configurations ...

  async redirects() {
    return [
      // Redirect root path to /uniform
      {
        source: '/',
        destination: '/uniform',
        permanent: true, // Set to true for a 308 permanent redirect
                         // Set to false for a 307 temporary redirect
      },
      // You can add more redirect objects here if needed
      // Example:
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ];
  },
};

export default nextConfig; // Use export default