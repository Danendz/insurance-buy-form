import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  sassOptions: {
    // Lets any module do `@use 'variables' as *;` without relative paths.
    loadPaths: [path.join(process.cwd(), 'src/shared/styles')],
  },
};

export default nextConfig;
