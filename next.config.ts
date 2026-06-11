import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // A stray lockfile in the user home directory otherwise confuses
  // workspace-root inference.
  outputFileTracingRoot: process.cwd(),
};

export default withNextIntl(nextConfig);
