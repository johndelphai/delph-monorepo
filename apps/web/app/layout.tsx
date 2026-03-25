import { RootLayout } from '@repo/common/components';
import { ReactQueryProvider, RootProvider, WalletAuthProvider } from '@repo/common/context';
import { TooltipProvider, cn } from '@repo/ui';
import { GeistMono } from 'geist/font/mono';
import type { Viewport } from 'next';
import { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import localFont from 'next/font/local';

const bricolage = Bricolage_Grotesque({
    subsets: ['latin'],
    variable: '--font-bricolage',
});

import './globals.css';

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://delph.tech'),
    title: {
        default: 'Delph - Go Deeper with AI-Powered Research & Agentic Workflows',
        template: '%s | Delph',
    },
    description:
        'Experience deep, AI-powered research with agentic workflows and a wide variety of models for advanced productivity.',
    applicationName: 'Delph',
    keywords: [
        'AI chat',
        'LLM',
        'language models',
        'AI research',
        'agentic workflows',
        'privacy',
        'ollama',
        'chatgpt',
    ],
    authors: [{ name: 'Trendy design', url: 'https://trendy.design' }],
    creator: 'Trendy design',
    publisher: 'Trendy design',
    category: 'technology',
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: 'any' },
            { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        ],
        apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    openGraph: {
        title: 'Delph - Go Deeper with AI-Powered Research & Agentic Workflows',
        siteName: 'Delph',
        description:
            'Experience deep, AI-powered research with agentic workflows and a wide variety of models for advanced productivity.',
        url: 'https://delph.tech',
        type: 'website',
        locale: 'en_US',
        images: [
            {
                url: 'https://delph.tech/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Delph - AI-Powered Research',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Delph - Go Deeper with AI-Powered Research & Agentic Workflows',
        site: '@delph_tech',
        creator: '@delph_tech',
        description:
            'Experience deep, AI-powered research with agentic workflows and a wide variety of models for advanced productivity.',
        images: ['https://delph.tech/og-image.jpg'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: 'https://delph.tech',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
};

const inter = localFont({
    src: './InterVariable.woff2',
    variable: '--font-inter',
});

const clash = localFont({
    src: './ClashGrotesk-Variable.woff2',
    variable: '--font-clash',
});

export default function ParentLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={cn(GeistMono.variable, inter.variable, clash.variable, bricolage.variable, 'dark')}
            suppressHydrationWarning
        >
            <head>
                <meta name="theme-color" content="#000000" />

                {/* <script
                    crossOrigin="anonymous"
                    src="//unpkg.com/react-scan/dist/auto.global.js"
                ></script> */}
            </head>
            <body>
                {/* <PostHogProvider> */}
                <WalletAuthProvider>
                    <RootProvider>
                        {/* <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          > */}
                        <TooltipProvider>
                            <ReactQueryProvider>
                                <RootLayout>{children}</RootLayout>
                            </ReactQueryProvider>
                        </TooltipProvider>
                        {/* </ThemeProvider> */}
                    </RootProvider>
                </WalletAuthProvider>
                {/* </PostHogProvider> */}
            </body>
        </html>
    );
}
