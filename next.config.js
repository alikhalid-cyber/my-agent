/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/chain',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig 