'use client';

import { useUser } from '@repo/common/context';
import { useChatStore } from '@repo/common/store';
import { Badge, Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui';
import {
    IconBook2,
    IconClockHour4,
    IconCopy,
    IconCreditCard,
    IconKey,
    IconPlayerPlay,
    IconRefresh,
    IconRocket,
    IconTerminal2,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://delph.tech';

const formatResetLabel = (reset: string | undefined) => {
    if (!reset) {
        return 'Unavailable';
    }

    const resetDate = new Date(reset);
    if (Number.isNaN(resetDate.getTime())) {
        return 'Unavailable';
    }

    return resetDate.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

const copyText = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
};

export default function DeveloperApiPage() {
    const router = useRouter();
    const { isLoaded, isSignedIn, user } = useUser();
    const creditLimit = useChatStore(state => state.creditLimit);
    const fetchRemainingCredits = useChatStore(state => state.fetchRemainingCredits);

    const [apiKey, setApiKey] = useState<string | null>(null);
    const [maskedKey, setMaskedKey] = useState<string | null>(null);
    const [hasKey, setHasKey] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const quickStartCommand = useMemo(
        () => `curl ${DEFAULT_BASE_URL}/api/v1/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gemini-flash-2.5","messages":[{"role":"user","content":"Hello!"}]}'`,
        []
    );

    const fetchStatus = async () => {
        if (!isSignedIn) {
            setApiKey(null);
            setMaskedKey(null);
            setHasKey(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/v1/keys', {
                method: 'GET',
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch API key status');
            }

            const data = (await response.json()) as {
                hasKey?: boolean;
                maskedKey?: string;
            };

            setHasKey(Boolean(data.hasKey));
            setMaskedKey(data.maskedKey ?? null);
        } catch (error) {
            console.error(error);
            toast.error('Unable to load API key status');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isLoaded) {
            return;
        }

        if (isSignedIn) {
            fetchRemainingCredits();
            fetchStatus();
            return;
        }

        setApiKey(null);
        setMaskedKey(null);
        setHasKey(false);
    }, [fetchRemainingCredits, isLoaded, isSignedIn]);

    const generateKey = async () => {
        if (!isSignedIn) {
            router.push('/sign-in');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/v1/keys', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to generate API key');
            }

            const data = (await response.json()) as { apiKey: string };
            setApiKey(data.apiKey);
            setMaskedKey(null);
            setHasKey(true);
            toast.success(hasKey ? 'API key regenerated' : 'API key created');
        } catch (error) {
            console.error(error);
            toast.error('Unable to generate API key');
        } finally {
            setIsLoading(false);
        }
    };

    const revokeKey = async () => {
        if (!isSignedIn) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/v1/keys', {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to revoke API key');
            }

            setApiKey(null);
            setMaskedKey(null);
            setHasKey(false);
            toast.success('API key revoked');
        } catch (error) {
            console.error(error);
            toast.error('Unable to revoke API key');
        } finally {
            setIsLoading(false);
        }
    };

    const usageCards = [
        {
            title: 'Credits remaining',
            value:
                creditLimit.isFetched && typeof creditLimit.remaining === 'number'
                    ? creditLimit.remaining.toString()
                    : '--',
            hint:
                creditLimit.isFetched && typeof creditLimit.maxLimit === 'number'
                    ? `${creditLimit.maxLimit} daily`
                    : 'Daily allowance',
        },
        {
            title: 'Next reset',
            value: formatResetLabel(creditLimit.reset),
            hint: 'Local time',
        },
        {
            title: 'API key',
            value: hasKey ? 'Active' : 'Not created',
            hint: hasKey ? 'Ready for requests' : 'Generate one to start',
        },
    ];

    return (
        <div className="min-h-full bg-background mt-10">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-semibold tracking-tight">API Settings</h1>
                            <Badge variant={hasKey ? 'tertiary' : 'outline'}>
                                {hasKey ? 'Live' : 'Setup'}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground max-w-2xl text-sm">
                            Manage your API key, monitor your available daily credits, and get your
                            first request running quickly.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="secondary" rounded="lg" disabled>
                            <IconCreditCard size={14} strokeWidth={2} />
                            Purchase Credits
                        </Button>
                        <Button variant="bordered" rounded="lg" onClick={() => router.push('/docs')}>
                            <IconBook2 size={14} strokeWidth={2} />
                            Resources
                        </Button>
                        <Button rounded="lg" onClick={generateKey} disabled={isLoading || !isLoaded}>
                            <IconKey size={14} strokeWidth={2} />
                            {hasKey ? 'Regenerate API Key' : 'Generate API Key'}
                        </Button>
                    </div>
                </div>

                <section className="border-border bg-secondary/30 overflow-hidden rounded-2xl border">
                    <div className="border-border/70 flex items-center justify-between border-b px-5 py-4">
                        <div>
                            <p className="text-sm font-semibold">Quick Start</p>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Create a key, make your first request, and browse the docs.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6 px-5 py-5">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="text-muted-foreground text-sm">1.</span>
                                <span className="text-sm font-medium">Generate an API Key</span>
                                <Button size="xs" rounded="lg" onClick={generateKey} disabled={isLoading}>
                                    Generate Key
                                </Button>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-muted-foreground text-sm">2.</span>
                                <span className="text-sm font-medium">Make your first request</span>
                            </div>

                            <div className="relative overflow-hidden rounded-xl border border-white/5 bg-black/30">
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="absolute right-3 top-3 z-10"
                                    onClick={() => copyText(quickStartCommand, 'Quick start command')}
                                >
                                    <IconCopy size={14} strokeWidth={2} />
                                </Button>
                                <pre className="overflow-x-auto p-4 pr-14 text-xs leading-6 text-[#d4d4d4]">
                                    {quickStartCommand}
                                </pre>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-muted-foreground text-sm">3.</span>
                                <span className="text-sm font-medium">Explore the docs</span>
                                <Button
                                    variant="bordered"
                                    size="xs"
                                    rounded="lg"
                                    onClick={() => router.push('/docs')}
                                >
                                    Getting Started
                                </Button>
                                <Button
                                    variant="bordered"
                                    size="xs"
                                    rounded="lg"
                                    onClick={() => router.push('/docs')}
                                >
                                    API Reference
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="h-auto rounded-xl border border-border bg-secondary/40 p-1">
                        <TabsTrigger
                            value="overview"
                            className="rounded-lg border-0 px-4 py-2 data-[state=active]:border-0 data-[state=active]:bg-background"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="keys"
                            className="rounded-lg border-0 px-4 py-2 data-[state=active]:border-0 data-[state=active]:bg-background"
                        >
                            Keys
                        </TabsTrigger>
                        <TabsTrigger
                            value="playground"
                            className="rounded-lg border-0 px-4 py-2 data-[state=active]:border-0 data-[state=active]:bg-background"
                        >
                            Playground
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            {usageCards.map(card => (
                                <div
                                    key={card.title}
                                    className="border-border bg-secondary/30 rounded-2xl border px-5 py-4"
                                >
                                    <p className="text-muted-foreground text-[11px] uppercase tracking-[0.18em]">
                                        {card.title}
                                    </p>
                                    <p className="mt-3 text-3xl font-semibold tracking-tight">
                                        {card.value}
                                    </p>
                                    <p className="text-muted-foreground mt-2 text-xs">{card.hint}</p>
                                </div>
                            ))}
                        </div>

                        <div className="border-border bg-secondary/30 rounded-2xl border">
                            <div className="border-border/70 flex items-center justify-between border-b px-5 py-4">
                                <div>
                                    <h2 className="text-lg font-semibold">API Usage</h2>
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        Usage tracking will appear here once you start making API
                                        requests.
                                    </p>
                                </div>
                                <Badge variant="outline">Last 7 days</Badge>
                            </div>

                            <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                                <div className="bg-background flex size-12 items-center justify-center rounded-full border border-border">
                                    <IconRocket size={20} strokeWidth={2} className="text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-base font-medium">No usage data yet</p>
                                    <p className="text-muted-foreground max-w-md text-sm">
                                        Try sending a request with your API key and your request
                                        history will show up here.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="keys" className="space-y-6">
                        {!isSignedIn ? (
                            <div className="border-border bg-secondary/30 rounded-2xl border px-5 py-6">
                                <div className="space-y-3">
                                    <h2 className="text-lg font-semibold">Sign in to manage keys</h2>
                                    <p className="text-muted-foreground max-w-xl text-sm">
                                        API keys are tied to your account, so you need to sign in
                                        before you can create or revoke them.
                                    </p>
                                    <Button rounded="lg" onClick={() => router.push('/sign-in')}>
                                        Sign in
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {apiKey && (
                                    <div className="border-border rounded-2xl border bg-[#101010] px-5 py-5">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="tertiary">New key</Badge>
                                                    <p className="text-sm font-semibold">
                                                        Copy this key now
                                                    </p>
                                                </div>
                                                <p className="text-muted-foreground text-sm">
                                                    This is the only time the full key will be shown.
                                                </p>
                                            </div>
                                            <Button
                                                variant="bordered"
                                                rounded="lg"
                                                onClick={() => copyText(apiKey, 'API key')}
                                            >
                                                <IconCopy size={14} strokeWidth={2} />
                                                Copy
                                            </Button>
                                        </div>

                                        <pre className="mt-4 overflow-x-auto rounded-xl border border-white/5 bg-black/30 p-4 text-xs leading-6 text-[#d4d4d4]">
                                            {apiKey}
                                        </pre>
                                    </div>
                                )}

                                <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
                                    <div className="border-border bg-secondary/30 rounded-2xl border px-5 py-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h2 className="text-lg font-semibold">
                                                    Active API key
                                                </h2>
                                                <p className="text-muted-foreground mt-1 text-sm">
                                                    Keys are scoped to{' '}
                                                    <span className="text-foreground">
                                                        {user?.fullName || 'your account'}
                                                    </span>
                                                    .
                                                </p>
                                            </div>
                                            <Badge variant={hasKey ? 'tertiary' : 'outline'}>
                                                {hasKey ? 'Active' : 'Missing'}
                                            </Badge>
                                        </div>

                                        <div className="mt-4 rounded-xl border border-border bg-background/60 px-4 py-3">
                                            <code className="text-sm">
                                                {apiKey || maskedKey || 'No API key generated yet'}
                                            </code>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <Button
                                                rounded="lg"
                                                onClick={generateKey}
                                                disabled={isLoading}
                                            >
                                                <IconRefresh size={14} strokeWidth={2} />
                                                {hasKey ? 'Regenerate key' : 'Generate key'}
                                            </Button>
                                            <Button
                                                variant="bordered"
                                                rounded="lg"
                                                onClick={revokeKey}
                                                disabled={isLoading || !hasKey}
                                            >
                                                Revoke key
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="border-border bg-secondary/30 rounded-2xl border px-5 py-5">
                                        <h2 className="text-lg font-semibold">Key usage</h2>
                                        <div className="mt-4 space-y-3">
                                            <div className="flex items-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3">
                                                <IconTerminal2
                                                    size={18}
                                                    strokeWidth={2}
                                                    className="text-muted-foreground"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        Bearer authentication
                                                    </p>
                                                    <p className="text-muted-foreground text-xs">
                                                        Send the key in the Authorization header.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3">
                                                <IconClockHour4
                                                    size={18}
                                                    strokeWidth={2}
                                                    className="text-muted-foreground"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        Daily credit limits apply
                                                    </p>
                                                    <p className="text-muted-foreground text-xs">
                                                        Usage resets automatically every day.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3">
                                                <IconBook2
                                                    size={18}
                                                    strokeWidth={2}
                                                    className="text-muted-foreground"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium">Reference</p>
                                                    <p className="text-muted-foreground text-xs">
                                                        Check the docs for supported request fields.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="playground" className="space-y-6">
                        <div className="border-border bg-secondary/30 rounded-2xl border px-5 py-5">
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold">Playground</h2>
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        A lightweight playground is coming soon. For now, test with
                                        cURL or your own client.
                                    </p>
                                </div>
                                <Badge variant="outline">
                                    <IconPlayerPlay size={12} strokeWidth={2} />
                                    Coming soon
                                </Badge>
                            </div>

                            <div className="relative mt-4 overflow-hidden rounded-xl border border-white/5 bg-black/30">
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="absolute right-3 top-3 z-10"
                                    onClick={() => copyText(quickStartCommand, 'Playground example')}
                                >
                                    <IconCopy size={14} strokeWidth={2} />
                                </Button>
                                <pre className="overflow-x-auto p-4 pr-14 text-xs leading-6 text-[#d4d4d4]">
                                    {quickStartCommand}
                                </pre>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
