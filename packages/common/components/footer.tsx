import { IconBrandGithub, IconBrandX } from '@tabler/icons-react';
import Link from 'next/link';

export const Footer = () => {
    const links = [
        {
            href: '/terms',
            label: 'Terms',
        },
        {
            href: '/privacy',
            label: 'Privacy',
        },
    ];

    return (
        <div className="flex w-full flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 p-3">
            <Link
                href="https://x.com/delphdotai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground opacity-50 hover:opacity-100"
            >
                <IconBrandX size={14} strokeWidth={2} />
            </Link>
            <Link
                href="https://github.com/johndelphai/delph-monorepo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground opacity-50 hover:opacity-100"
            >
                <IconBrandGithub size={14} strokeWidth={2} />
            </Link>
            {links.map(link => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="text-muted-foreground text-xs opacity-50 hover:opacity-100"
                >
                    {link.label}
                </Link>
            ))}
        </div>
    );
};
