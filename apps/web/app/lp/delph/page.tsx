'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import {
    ArrowRight,
    Bot,
    Coins,
    Flame,
    Globe,
    Layers,
    Rocket,
    Search,
    Shield,
    Sparkles,
    Zap,
} from 'lucide-react';

/* ───────── animation variants ───────── */
const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.4, 0.25, 1] },
    }),
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: (i: number = 0) => ({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] },
    }),
};

const stagger = {
    visible: { transition: { staggerChildren: 0.12 } },
};

/* ───────── floating particle component ───────── */
function FloatingParticles() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute h-1 w-1 rounded-full bg-brand/30"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.2, 0.6, 0.2],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 4,
                        repeat: Infinity,
                        delay: Math.random() * 3,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
}

/* ───────── glowing orb background ───────── */
function GlowOrbs() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
                className="absolute -left-[300px] -top-[300px] h-[600px] w-[600px] rounded-full bg-brand/[0.07] blur-[120px]"
                animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute -bottom-[200px] -right-[200px] h-[500px] w-[500px] rounded-full bg-brand/[0.05] blur-[100px]"
                animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
        </div>
    );
}

/* ───────── section wrapper ───────── */
function Section({
    children,
    className = '',
    id,
}: {
    children: React.ReactNode;
    className?: string;
    id?: string;
}) {
    return (
        <motion.section
            id={id}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className={`relative mx-auto max-w-5xl px-6 py-24 ${className}`}
        >
            {children}
        </motion.section>
    );
}

/* ───────── feature card ───────── */
function FeatureCard({
    icon: Icon,
    title,
    description,
    i,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    i: number;
}) {
    return (
        <motion.div
            variants={scaleIn}
            custom={i}
            whileHover={{ y: -6, transition: { duration: 0.25 } }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-secondary/60 p-6 backdrop-blur-sm transition-colors hover:border-brand/40"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-brand/[0.04] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand/20">
                    <Icon size={24} />
                </div>
                <h3 className="mb-2 font-clash text-lg font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
        </motion.div>
    );
}

/* ───────── step card (how it works) ───────── */
function StepCard({
    step,
    title,
    description,
    icon: Icon,
    i,
}: {
    step: string;
    title: string;
    description: string;
    icon: React.ElementType;
    i: number;
}) {
    return (
        <motion.div variants={fadeUp} custom={i} className="relative flex flex-col items-center text-center">
            <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/20 to-brand/5 text-brand ring-1 ring-brand/20"
            >
                <Icon size={28} />
            </motion.div>
            <span className="mb-2 font-mono text-xs font-medium uppercase tracking-widest text-brand">
                {step}
            </span>
            <h3 className="mb-2 font-clash text-xl font-bold text-foreground">{title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </motion.div>
    );
}

/* ───────── tokenomics stat ───────── */
function StatBlock({ label, value, i }: { label: string; value: string; i: number }) {
    return (
        <motion.div
            variants={scaleIn}
            custom={i}
            className="rounded-2xl border border-border bg-secondary/60 p-6 text-center backdrop-blur-sm"
        >
            <p className="mb-1 font-clash text-3xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
        </motion.div>
    );
}

/* ═══════════════ MAIN PAGE ═══════════════ */
export default function DelphLandingPage() {
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
            <GlowOrbs />

            {/* ━━━ HERO ━━━ */}
            <div ref={heroRef} className="relative overflow-hidden">
                <FloatingParticles />
                <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative">
                    <Section className="pb-16 pt-20 text-center sm:pt-28">


                        <motion.h1
                            variants={fadeUp}
                            custom={1}
                            className="mx-auto max-w-3xl font-clash text-5xl font-bold leading-[1.1] tracking-tight sm:text-7xl"
                        >
                            The Token Behind{' '}
                            <span className="font-serif italic text-white">Delph</span>
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            custom={2}
                            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
                        >
                            DELPH is the utility token powering the Delph platform — fueling
                            AI-powered research, agentic workflows, and premium access across the
                            ecosystem.
                        </motion.p>

                        {/* Hero image */}
                        <motion.div variants={fadeUp} custom={4} className="mt-16">
                            <div className="relative mx-auto max-w-2xl overflow-hidden rounded-2xl border border-border shadow-2xl shadow-brand/5">
                                <Image
                                    src="/token-1.png"
                                    alt="Delph Platform"
                                    width={1200}
                                    height={675}
                                    className="w-full"
                                    priority
                                />
                                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />
                            </div>
                        </motion.div>
                    </Section>
                </motion.div>
            </div>

            {/* ━━━ FEATURES ━━━ */}
            <div className="relative border-t border-border/50">
                <Section>
                    <motion.div variants={fadeUp} className="mb-14 text-center">
                        <span className="mb-3 inline-block font-mono text-xs font-medium uppercase tracking-widest text-brand">
                            Platform
                        </span>
                        <h2 className="font-clash text-4xl font-bold sm:text-5xl">
                            Why Delph?
                        </h2>
                        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                            Advanced AI research with the tools, models, and privacy you need.
                        </p>
                    </motion.div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                icon: Search,
                                title: 'Deep Research',
                                description:
                                    'Multi-step agentic research with web search, document analysis, and intelligent synthesis.',
                            },
                            {
                                icon: Layers,
                                title: 'Multi-Model Access',
                                description:
                                    'GPT-4, Claude, Gemini, Llama, DeepSeek and more — switch freely between the best models.',
                            },
                            {
                                icon: Shield,
                                title: 'Privacy First',
                                description:
                                    'Your conversations stay yours. No training on your data, no compromises.',
                            },
                            {
                                icon: Bot,
                                title: 'Agentic Workflows',
                                description:
                                    'Autonomous agents that plan, execute, and iterate on complex multi-step tasks.',
                            },
                            {
                                icon: Globe,
                                title: 'Real-Time Web',
                                description:
                                    'Search the live web, analyze documents, and pull in real-time data for up-to-date answers.',
                            },
                            {
                                icon: Zap,
                                title: 'Developer API',
                                description:
                                    'Programmatic access to all models and features through a unified, powerful API.',
                            },
                        ].map((feature, i) => (
                            <FeatureCard key={feature.title} {...feature} i={i} />
                        ))}
                    </div>
                </Section>
            </div>

            {/* ━━━ HOW IT WORKS ━━━ */}
            <div className="relative border-t border-border/50">
                <Section id="how-it-works">
                    <motion.div variants={fadeUp} className="mb-14 text-center">
                        <span className="mb-3 inline-block font-mono text-xs font-medium uppercase tracking-widest text-brand">
                            Get Started
                        </span>
                        <h2 className="font-clash text-4xl font-bold sm:text-5xl">How DELPH Works</h2>
                        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                            Three simple steps to power your AI research with DELPH.
                        </p>
                    </motion.div>

                    <div className="grid gap-12 sm:grid-cols-3">
                        <StepCard
                            step="Step 01"
                            icon={Coins}
                            title="Buy DELPH"
                            description="Acquire DELPH tokens on supported exchanges. The token lives on-chain and is fully transferable."
                            i={0}
                        />
                        <StepCard
                            step="Step 02"
                            icon={Rocket}
                            title="Stake & Unlock"
                            description="Stake your DELPH to unlock Delph Pro — unlimited prompts, premium models, and advanced features."
                            i={1}
                        />
                        <StepCard
                            step="Step 03"
                            icon={Sparkles}
                            title="Earn & Research"
                            description="Earn yield on your stake while accessing the most powerful AI research platform available."
                            i={2}
                        />
                    </div>

                    {/* Connecting line */}
                    <div className="mx-auto mt-0 hidden max-w-xs sm:block">
                        <motion.div
                            variants={fadeUp}
                            custom={3}
                            className="absolute left-1/2 top-[calc(50%+20px)] hidden h-px w-[60%] -translate-x-1/2 bg-gradient-to-r from-transparent via-brand/30 to-transparent sm:block"
                        />
                    </div>
                </Section>
            </div>

            {/* ━━━ TOKENOMICS ━━━ */}
            <div className="relative border-t border-border/50">
                <Section id="tokenomics">
                    <motion.div variants={fadeUp} className="mb-14 text-center">
                        <span className="mb-3 inline-block font-mono text-xs font-medium uppercase tracking-widest text-brand">
                            Tokenomics
                        </span>
                        <h2 className="font-clash text-4xl font-bold sm:text-5xl">
                            Built to Appreciate
                        </h2>
                        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                            A deflationary model designed to reward long-term holders as the
                            platform scales.
                        </p>
                    </motion.div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <StatBlock label="Total Supply" value="1B" i={0} />
                        <StatBlock label="Deflationary" value="Buy & Burn" i={1} />
                        <StatBlock label="Revenue Share" value="40%" i={2} />
                        <StatBlock label="Staking" value="Live" i={3} />
                    </div>

                    {/* Buy & Burn explainer */}
                    <motion.div
                        variants={fadeUp}
                        custom={2}
                        className="mt-12 overflow-hidden rounded-2xl border border-border bg-secondary/60 backdrop-blur-sm"
                    >
                        <div className="grid items-center gap-8 p-8 md:grid-cols-2 md:p-12">
                            <div>
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/20">
                                        <Flame size={20} className="text-brand" />
                                    </div>
                                    <h3 className="font-clash text-2xl font-bold">Buy &amp; Burn</h3>
                                </div>
                                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                                    40% of all platform revenue — from subscriptions and API usage —
                                    is used to buy DELPH on the open market and permanently burn it.
                                </p>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    As Delph scales, supply decreases. More users, more revenue,
                                    more burns — a powerful deflationary flywheel.
                                </p>
                                <div className="mt-6 flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-brand" />
                                        <span className="text-muted-foreground">More Revenue</span>
                                    </div>
                                    <ArrowRight size={14} className="text-brand" />
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-brand/60" />
                                        <span className="text-muted-foreground">More Burns</span>
                                    </div>
                                    <ArrowRight size={14} className="text-brand" />
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-brand/30" />
                                        <span className="text-muted-foreground">Less Supply</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative overflow-hidden rounded-xl border border-border">
                                <Image
                                    src="/token-2.png"
                                    alt="Buy and Burn mechanism"
                                    width={600}
                                    height={400}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </motion.div>
                </Section>
            </div>

            {/* ━━━ CTA ━━━ */}
            <div className="relative border-t border-border/50">
                <Section className="text-center">
                    <FloatingParticles />
                    <motion.div
                        variants={fadeUp}
                        className="relative mx-auto max-w-2xl rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/[0.08] to-transparent p-12 backdrop-blur-sm"
                    >
                        <motion.h2
                            variants={fadeUp}
                            custom={0}
                            className="font-clash text-4xl font-bold sm:text-5xl"
                        >
                            Ready to Go Deeper?
                        </motion.h2>
                        <motion.p
                            variants={fadeUp}
                            custom={1}
                            className="mx-auto mt-4 max-w-md text-muted-foreground"
                        >
                            Join the Delph ecosystem. Research smarter, stake DELPH, and be part
                            of the AI platform built for power users.
                        </motion.p>
                        <motion.div
                            variants={fadeUp}
                            custom={2}
                            className="mt-8 flex flex-wrap items-center justify-center gap-4"
                        >
                            <Link
                                href="/chat"
                                className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-brand-foreground transition-all hover:brightness-110 hover:shadow-lg hover:shadow-brand/20"
                            >
                                Try Delph Free <ArrowRight size={16} />
                            </Link>
                            <Link
                                href="/token"
                                className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3.5 text-sm font-semibold text-foreground transition-all hover:border-brand/40 hover:bg-secondary"
                            >
                                View Token Dashboard
                            </Link>
                        </motion.div>
                    </motion.div>
                </Section>
            </div>

            {/* ━━━ FOOTER ━━━ */}
            <footer className="border-t border-border/50 py-10">
                <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
                    <div className="flex items-center gap-2.5">
                        <Image src="/delph-logo.png" alt="Delph" width={24} height={24} className="h-6 w-auto" />
                        <span className="font-clash text-sm font-semibold text-muted-foreground">Delph</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <Link href="/terms" className="transition-colors hover:text-foreground">
                            Terms
                        </Link>
                        <Link href="/privacy" className="transition-colors hover:text-foreground">
                            Privacy
                        </Link>
                        <Link href="/docs" className="transition-colors hover:text-foreground">
                            Docs
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
