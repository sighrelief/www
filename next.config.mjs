/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import './src/env.js'
import { createMDX } from 'fumadocs-mdx/next'
import createNextIntlPlugin from 'next-intl/plugin'

const withMDX = createMDX()
/** @type {import("next").NextConfig} */
const config = {
  output: 'standalone',
}
const withNextIntl = createNextIntlPlugin()
export default withNextIntl(withMDX(config))
