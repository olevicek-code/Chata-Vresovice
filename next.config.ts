import type { NextConfig } from "next";

const SECURITY_HEADERS = [
  // No third-party can embed this site in an <iframe> (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Stops browsers guessing content types away from the declared one.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only send the origin (not full path/query) to other sites on outbound links.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disables browser features this site never uses.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
