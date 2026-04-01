import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options aqui */
  output: 'standalone', // <-- ESSA É A LINHA QUE FALTAVA
  webpack: (config, { isServer }) => {
    config.plugins = config.plugins || [];
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const webpack = require('webpack');
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(@opentelemetry\/exporter-jaeger|@genkit-ai\/firebase|handlebars)$/,
      })
    );
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;