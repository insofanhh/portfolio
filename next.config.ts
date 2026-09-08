import type { NextConfig } from "next";
// Short links require live API routes; run next start instead of static export.
const config: NextConfig = { images: { unoptimized: true } };
export default config;
