import { withPayload } from "@payloadcms/next/withPayload"

/** @type {import("next").NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default withPayload(nextConfig)

