import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  allowedDevOrigins: ['192.168.0.197'],
  sassOptions: {
    // Lets any module do `@use 'variables' as *;` without relative paths.
    loadPaths: [path.join(process.cwd(), 'src/shared/styles')],
  },
};

export default nextConfig;
