import { withSentryConfig } from '@sentry/nextjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
    transpilePackages: ['next-mdx-remote'],
    images: {
        remotePatterns: [
            { hostname: 'www.google.com' },
            { hostname: 'img.clerk.com' },
            { hostname: 'zyqdiwxgffuy8ymd.public.blob.vercel-storage.com' },
        ],
    },

    experimental: {
        externalDir: true,
        serverComponentsExternalPackages: [],
    },
    webpack: (config, options) => {
        if (!options.isServer) {
            config.resolve.fallback = { fs: false, module: false, path: false };
        }

        // Allow monorepo packages to resolve dependencies from the web app's node_modules
        config.resolve.modules = [
            path.resolve(__dirname, 'node_modules'),
            'node_modules',
            ...(config.resolve.modules || []),
        ];

        // Experimental features
        config.experiments = {
            ...config.experiments,
            topLevelAwait: true,
            layers: true,
        };

        // Suppress critical dependency warnings for import.meta property access
        config.module.exprContextCritical = false;

        return config;
    },
};

export default withSentryConfig(nextConfig, {
    // Sentry configuration (unchanged)
    org: 'saascollect',
    project: 'javascript-nextjs',
    silent: !process.env.CI,
    widenClientFileUpload: true,
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
});
