import type { NextConfig } from "next";

const backendOrigin = process.env.BACKEND_ORIGIN || "http://localhost:3000";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Socket.IO polls "/socket.io/?EIO=4…"; the default trailing-slash redirect
  // would 308 that away before the rewrite below ever runs.
  skipTrailingSlashRedirect: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendOrigin}/api/v1/:path*`,
      },
      // Socket.IO is constructed without CORS options on the backend, so the
      // realtime connection has to look same-origin too. The exact-match rule
      // comes first because ":path*" collapses the trailing slash that
      // Socket.IO's own handler requires on the handshake request.
      {
        source: "/socket.io/",
        destination: `${backendOrigin}/socket.io/`,
      },
      {
        source: "/socket.io/:path*",
        destination: `${backendOrigin}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
