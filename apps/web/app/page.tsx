'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChatMode, getChatModeName } from '@repo/shared/config';
import { IconBrandGithub, IconBrandX } from '@tabler/icons-react';
import { AlignLeft, ArrowRight, Compass, Sparkles, TriangleAlert } from 'lucide-react';
import { LandingSplash } from './landing-splash';

const modelList = [
    ChatMode.LLAMA_4_SCOUT,
    ChatMode.GPT_4_1,
    ChatMode.GPT_4_1_Mini,
    ChatMode.GPT_4_1_Nano,
    ChatMode.GEMINI_2_FLASH,
    ChatMode.GPT_4o_Mini,
    ChatMode.O4_Mini,
    ChatMode.CLAUDE_SONNET_4_6,
    ChatMode.DEEPSEEK_R1,
    ChatMode.CLAUDE_OPUS_4_6,
    ChatMode.GEMINI_2_5_PRO,
    ChatMode.CLAUDE_HAIKU_4_5,
    ChatMode.LLAMA_3_3_70B,
].map(getChatModeName);

export default function Home() {
    const [heroPrompt, setHeroPrompt] = useState('');
    const [isPromptDocked, setIsPromptDocked] = useState(false);
    const mainRef = useRef<HTMLElement | null>(null);
    const heroPromptFormRef = useRef<HTMLFormElement | null>(null);
    const navPromptFormRef = useRef<HTMLFormElement | null>(null);
    const promptMorphRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();

    const submitHeroPrompt = (value: string) => {
        const trimmedPrompt = value.trim();
        if (typeof window !== 'undefined') {
            if (trimmedPrompt) {
                window.localStorage.setItem('draft-message', trimmedPrompt);
            } else {
                window.localStorage.removeItem('draft-message');
            }
        }
        router.push('/chat');
    };

    const handleHeroSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        submitHeroPrompt(heroPrompt);
    };

    useEffect(() => {
        const transitionStart = 12;
        const transitionEnd = 230;
        const dockThreshold = 170;
        const clamp = (value: number) => Math.max(0, Math.min(1, value));
        const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;
        const easeInOutCubic = (value: number) =>
            value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
        let raf = 0;

        const updatePromptMorph = () => {
            raf = 0;
            const scrollY = window.scrollY;
            const progress = clamp((scrollY - transitionStart) / (transitionEnd - transitionStart));
            const easedProgress = easeInOutCubic(progress);

            setIsPromptDocked(scrollY > dockThreshold);
            if (mainRef.current) {
                mainRef.current.style.setProperty('--prompt-progress', easedProgress.toFixed(4));
            }

            const morph = promptMorphRef.current;
            const heroForm = heroPromptFormRef.current;
            const navForm = navPromptFormRef.current;
            if (!morph || !heroForm || !navForm) return;

            const from = heroForm.getBoundingClientRect();
            const to = navForm.getBoundingClientRect();
            const left = lerp(from.left, to.left, easedProgress);
            const top = lerp(from.top, to.top, easedProgress);
            const width = lerp(from.width, to.width, easedProgress);
            const height = lerp(from.height, to.height, easedProgress);
            const scale = lerp(1, 0.985, easedProgress);
            const radius = lerp(30, 22, easedProgress);
            const shadowBlur = lerp(52, 28, easedProgress);
            const shadowOpacity = lerp(0.22, 0.4, easedProgress);
            const shellOpacity = Math.sin(progress * Math.PI);

            morph.style.opacity = progress > 0.02 && progress < 0.98 ? `${Math.min(1, shellOpacity * 1.15)}` : '0';
            morph.style.transform = `translate3d(${left}px, ${top}px, 0) scale(${scale})`;
            morph.style.width = `${width}px`;
            morph.style.height = `${height}px`;
            morph.style.borderRadius = `${radius}px`;
            morph.style.boxShadow = `0 18px ${shadowBlur}px rgba(0, 0, 0, ${shadowOpacity})`;
        };

        const requestUpdate = () => {
            if (raf) return;
            raf = window.requestAnimationFrame(updatePromptMorph);
        };

        requestUpdate();
        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate);

        return () => {
            if (raf) {
                window.cancelAnimationFrame(raf);
            }
            window.removeEventListener('scroll', requestUpdate);
            window.removeEventListener('resize', requestUpdate);
        };
    }, []);

    useEffect(() => {
        const revealNodes = Array.from(document.querySelectorAll<HTMLElement>('.landing-reveal'));
        if (!revealNodes.length) return;

        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (reducedMotionQuery.matches) {
            revealNodes.forEach(node => node.classList.add('is-visible'));
            return;
        }

        const revealObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                });
            },
            {
                threshold: 0.18,
                rootMargin: '0px 0px -10% 0px',
            }
        );

        revealNodes.forEach(node => revealObserver.observe(node));

        return () => {
            revealObserver.disconnect();
        };
    }, []);

    const quickActions = [
        { label: 'Summarize', prompt: 'Summarize this in simple terms:', icon: AlignLeft },
        { label: 'Critique', prompt: 'Critique this and suggest improvements:', icon: TriangleAlert },
        { label: 'Imagine', prompt: 'Imagine three creative directions for this idea:', icon: Sparkles },
        { label: 'More', prompt: 'Help me explore this topic in depth:', icon: Compass },
    ];

    return (
        <main ref={mainRef} className="landing-page min-h-screen overflow-x-clip bg-[#2d2d2d] text-white">
            <LandingSplash />
            <div ref={promptMorphRef} className="landing-prompt-morph" aria-hidden>
                <div className="landing-prompt-shell landing-prompt-morph-shell landing-query-deck landing-query-deck-morph">
                    <div className="landing-query-deck-frame">
                        <div className="landing-query-input-row">
                            <div className="landing-query-input-shell">
                                <div className="landing-prompt-morph-input">{heroPrompt || 'Ask anything'}</div>
                            </div>
                            <div className="landing-query-submit-shell">
                                <span className="landing-query-submit landing-query-submit-static">
                                    <ArrowRight size={15} />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`landing-floating-nav ${isPromptDocked ? 'is-interactive' : ''}`}>
                <div className="landing-floating-nav-inner">
                    <div className="landing-floating-brand">Delph</div>
                    <form
                        ref={navPromptFormRef}
                        onSubmit={handleHeroSubmit}
                        className="landing-prompt-shell landing-nav-prompt-shell landing-query-deck landing-query-deck-nav"
                    >
                        <div className="landing-query-deck-frame">
                            <div className="landing-query-input-row">
                                <div className="landing-query-input-shell">
                                    <input
                                        value={heroPrompt}
                                        onChange={event => setHeroPrompt(event.target.value)}
                                        placeholder="Ask anything"
                                        className="landing-query-input landing-query-input-nav"
                                        aria-label="Ask anything"
                                    />
                                </div>
                                <div className="landing-query-submit-shell">
                                    <button type="submit" className="landing-query-submit">
                                        <ArrowRight size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                    <Link href="/sign-in" className="landing-floating-cta">
                        Login
                    </Link>
                </div>
            </div>
            <section className="landing-hero relative min-h-[100svh] overflow-hidden">
                <div className="landing-hero-media" aria-hidden>
                    <video
                        className="landing-hero-video"
                        src="/Ripples.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                    <div className="landing-hero-media-overlay" />
                </div>
                <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col px-4 py-6 sm:px-6 md:px-10">
                    <header className="landing-reveal landing-reveal-1 flex items-center justify-between gap-3 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-0">
                        <div className="hidden md:block" />
                        <div className="min-w-0 md:text-center">
                            <span className="landing-logo text-[2.35rem] text-white sm:text-5xl md:text-6xl">Delph</span>
                        </div>
                        <div className="shrink-0 md:justify-self-end">
                            <Link
                                href="/sign-in"
                                className="rounded-xl border border-[#8c7f66]/40 bg-[#a8aaab] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2d2d2d] transition hover:bg-[#bcc0c1] sm:px-4 sm:text-[11px]"
                            >
                                Login / Sign Up
                            </Link>
                        </div>
                    </header>

                    <div className="flex flex-1 items-center justify-center">
                        <div className="landing-reveal landing-reveal-2 landing-hero-focus w-full max-w-[760px]">
                            <div className="landing-hero-orb landing-hero-orb-left" aria-hidden />
                            <div className="landing-hero-orb landing-hero-orb-right" aria-hidden />
                            <div className="landing-hero-grid" aria-hidden />
                            <div className="landing-hero-content space-y-4">
                                <form
                                    ref={heroPromptFormRef}
                                    onSubmit={handleHeroSubmit}
                                    className={`landing-prompt-shell landing-prompt-shell-animated landing-query-deck landing-query-deck-hero landing-hero-prompt-shell ${isPromptDocked ? 'is-docked' : ''}`}
                                >
                                    <div className="landing-query-deck-frame">
                                        <div className="landing-query-input-row">
                                            <div className="landing-query-input-shell">
                                                <input
                                                    value={heroPrompt}
                                                    onChange={event => setHeroPrompt(event.target.value)}
                                                    placeholder="Ask anything"
                                                    className="landing-query-input landing-query-input-hero"
                                                    aria-label="Ask anything"
                                                />
                                            </div>
                                            <div className="landing-query-submit-shell">
                                                <button type="submit" className="landing-query-submit">
                                                    <ArrowRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                                <div className="landing-reveal landing-reveal-3 landing-hero-actions flex flex-wrap items-center justify-center gap-2">
                                    {quickActions.map(item => {
                                        const Icon = item.icon;

                                        return (
                                            <button
                                                key={item.label}
                                                type="button"
                                                className="landing-chip"
                                                onClick={() => setHeroPrompt(item.prompt)}
                                            >
                                                <Icon size={14} strokeWidth={1.8} aria-hidden />
                                                <span>{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="landing-post-hero">
                <section id="features" className="landing-section landing-section-rich">
                    <div className="landing-section-shell mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="landing-reveal landing-reveal-1 landing-section-heading mx-auto max-w-3xl text-center">
                            <p className="landing-kicker">Why Delph</p>
                            <h2 className="landing-display mt-4">Unrestricted intelligence with a calmer, more capable interface.</h2>
                            <p className="landing-copy mt-5">
                                Delph keeps your workflow private and flexible, pairing premium model access with a
                                product surface that feels focused instead of noisy.
                            </p>
                        </div>
                        <div className="mt-12 grid gap-6 lg:grid-cols-2">
                            <article className="landing-reveal landing-reveal-left landing-reveal-2 landing-feature-card">
                                <div
                                    className="landing-feature-card-image"
                                    style={{ backgroundImage: "url('/landing-4.png')" }}
                                    aria-hidden
                                />
                                <div className="landing-feature-card-overlay" aria-hidden />
                                <div className="landing-feature-card-grid" aria-hidden>
                                    <span />
                                    <span />
                                    <span />
                                </div>
                                <div className="landing-feature-card-content">
                                    <p className="landing-card-kicker">Private AI</p>
                                    <h3 className="landing-card-title">
                                        Research, write, and iterate without giving up control of your context.
                                    </h3>
                                    <p className="landing-card-copy">
                                        Your prompts stay inside a product designed around discretion, clear data
                                        boundaries, and a more focused working environment.
                                    </p>
                                    <div className="landing-feature-card-footer">
                                        <span className="landing-inline-stat">Private by default</span>
                                        <span className="landing-inline-stat">Built for individual and team workflows</span>
                                    </div>
                                </div>
                            </article>
                            <article className="landing-reveal landing-reveal-right landing-reveal-3 landing-feature-card">
                                <div
                                    className="landing-feature-card-image"
                                    style={{ backgroundImage: "url('/landing-5.png')" }}
                                    aria-hidden
                                />
                                <div className="landing-feature-card-overlay" aria-hidden />
                                <div className="landing-feature-card-grid" aria-hidden>
                                    <span />
                                    <span />
                                    <span />
                                </div>
                                <div className="landing-feature-card-content">
                                    <p className="landing-card-kicker">Open model access</p>
                                    <h3 className="landing-card-title">
                                        Route between reasoning, coding, and media models without changing tools.
                                    </h3>
                                    <p className="landing-card-copy">
                                        Move from chat to code to generation with a single system that stays coherent
                                        as your work gets deeper or more technical.
                                    </p>
                                    <div className="landing-feature-card-footer">
                                        <span className="landing-inline-stat">Reasoning, code, image, and chat</span>
                                        <span className="landing-inline-stat">One consistent workflow</span>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </div>
                </section>

                <section id="models" className="landing-section landing-section-band">
                    <div className="landing-section-shell mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="landing-reveal landing-reveal-up landing-reveal-1 landing-marquee-panel">
                            <div className="landing-marquee-header">
                                <div className="max-w-2xl">
                                    <p className="landing-kicker">Model coverage</p>
                                    <h3 className="landing-display-sm mt-3">
                                        Privately or anonymously access leading models.
                                    </h3>
                                </div>
                                <p className="landing-copy max-w-xl">
                                    A premium routing layer matters more when it disappears into the background. Delph
                                    keeps model choice broad while the interface stays quiet.
                                </p>
                            </div>
                            <div className="landing-marquee mt-8 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 md:p-5">
                                <div className="landing-marquee-track">
                                    {[...modelList, ...modelList].map((model, index) => (
                                        <span key={`${model}-${index}`} className="landing-model-pill">
                                            {model}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="chat" className="landing-section landing-section-product">
                    <div className="landing-section-shell mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1.08fr] lg:items-center">
                        <div className="landing-reveal landing-reveal-left landing-reveal-1 landing-content-panel">
                            <p className="landing-kicker">AI, Chat, and Code</p>
                            <h4 className="landing-display mt-4">A cleaner front door for research, creation, and everyday work.</h4>
                            <div className="mt-6 flex flex-wrap gap-2.5">
                                {['Text', 'Chat', 'Code'].map(item => (
                                    <span key={item} className="landing-tag-pill">
                                        {item}
                                    </span>
                                ))}
                            </div>
                            <p className="landing-copy mt-6">
                                Brainstorm, summarize, research, and ship faster with a landing experience that feels
                                deliberate, minimal, and more premium from the first scroll.
                            </p>
                            <Link href="/chat" className="landing-primary-cta mt-8 inline-flex items-center gap-2">
                                Ask Anything
                                <ArrowRight size={15} />
                            </Link>
                        </div>
                        <div className="landing-reveal landing-reveal-right landing-reveal-2 landing-feature-visual" aria-hidden>
                            <div className="landing-showcase-glow" />
                            <img
                                src="/landing-3.png"
                                alt=""
                                className="landing-feature-visual-image"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </section>

                <section id="api" className="landing-section landing-section-api">
                    <div className="landing-section-shell mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center">
                        <div className="landing-reveal landing-reveal-left landing-reveal-1 landing-api-visual" aria-hidden>
                            <div className="landing-showcase-glow" />
                            <img
                                src="/landing-6.png"
                                alt=""
                                className="landing-api-visual-image"
                                loading="lazy"
                            />
                        </div>
                        <div className="landing-reveal landing-reveal-right landing-reveal-2 landing-content-panel lg:justify-self-end">
                            <p className="landing-kicker">AI for agents and developers</p>
                            <h5 className="landing-display mt-4">Private inference for products that need speed and control.</h5>
                            <p className="landing-copy mt-6 max-w-2xl">
                                Utilize Delph&apos;s private inference layer to build performant AI apps and global
                                autonomous agents with one API, clearer ergonomics, and room to scale.
                            </p>
                            <Link href="/docs" className="landing-secondary-cta mt-8 inline-flex items-center gap-2">
                                Delph API Docs
                                <ArrowRight size={15} />
                            </Link>
                        </div>
                    </div>
                </section>

                <section id="pricing" className="landing-section landing-section-pricing">
                    <div className="landing-section-shell mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="landing-reveal landing-reveal-1 landing-section-heading mx-auto max-w-3xl text-center">
                            <p className="landing-kicker">Pricing</p>
                            <h6 className="landing-display mt-4">Try Delph today.</h6>
                            <p className="landing-copy mt-5">
                                Start with the core experience, upgrade for deeper access, or use the API for
                                production-grade applications.
                            </p>
                        </div>
                        <div className="mt-10 grid gap-5 md:grid-cols-3">
                            <article className="landing-reveal landing-reveal-up landing-reveal-1 landing-pricing-card">
                                <p className="landing-pricing-label">Free</p>
                                <p className="landing-price mt-3">$0</p>
                                <p className="landing-price-caption mt-2">Get started with private text and code workflows.</p>
                                <ul className="landing-pricing-list">
                                    <li>Private text and code</li>
                                    <li>Base AI models</li>
                                    <li>Daily prompt limits</li>
                                </ul>
                                <Link href="/sign-up" className="landing-secondary-cta mt-8 inline-flex items-center justify-center">
                                    Sign up for Free
                                </Link>
                            </article>
                            <article className="landing-reveal landing-reveal-up landing-reveal-2 landing-pricing-card landing-pricing-card-featured">
                                <p className="landing-pricing-badge">Most popular</p>
                                <p className="landing-pricing-label mt-5">Pro</p>
                                <p className="landing-price mt-3">$18.99/mo</p>
                                <p className="landing-price-caption mt-2">
                                    Stake DELPH to reduce your subscription cost. The more you stake, the less you pay, all the way down to $18.99 per month.
                                </p>
                                <p className="landing-price-caption mt-2">
                                    Higher limits and stronger models for daily use.
                                </p>
                                <ul className="landing-pricing-list">
                                    <li>Advanced model access</li>
                                    <li>Higher usage limits</li>
                                    <li>Priority access to stronger models</li>
                                </ul>
                                <Link href="/chat" className="landing-primary-cta mt-8 inline-flex items-center justify-center">
                                    Try Delph Free
                                </Link>
                            </article>
                            <article className="landing-reveal landing-reveal-up landing-reveal-3 landing-pricing-card">
                                <p className="landing-pricing-label">API Pricing</p>
                                <p className="landing-price mt-3">Usage</p>
                                <p className="landing-price-caption mt-2">
                                    Detailed token and model pricing for production applications.
                                </p>
                                <ul className="landing-pricing-list">
                                    <li>Usage-based pricing details</li>
                                    <li>Production planning for teams</li>
                                    <li>Model-specific documentation</li>
                                </ul>
                                <Link href="/docs" className="landing-secondary-cta mt-8 inline-flex items-center justify-center">
                                    API Pricing Details
                                </Link>
                            </article>
                        </div>
                    </div>
                    <div className="landing-section-bottom-art" aria-hidden>
                        <img src="/delph-hero.png" alt="" className="landing-section-bottom-art-image" />
                    </div>
                </section>
            </div>

            <footer className="landing-footer">
                <div className="landing-footer-inner mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="landing-footer-brand">
                        <Image
                            src="/delph-logo.png"
                            alt="Delph"
                            width={44}
                            height={44}
                            className="landing-footer-logo"
                        />
                        <span className="landing-footer-wordmark">Delph</span>
                    </div>
                    <nav className="landing-footer-nav" aria-label="Footer">
                        <Link href="#features" className="landing-footer-link">
                            Features
                        </Link>
                        <Link href="#models" className="landing-footer-link">
                            Models
                        </Link>
                        <Link href="#pricing" className="landing-footer-link">
                            Pricing
                        </Link>
                        <Link href="#api" className="landing-footer-link">
                            API
                        </Link>
                        <Link href="/docs" className="landing-footer-link">
                            Docs
                        </Link>
                        <Link href="/chat" className="landing-footer-link">
                            Chat
                        </Link>
                        <Link
                            href="https://x.com/delphdotai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="landing-footer-link"
                        >
                            <IconBrandX size={16} strokeWidth={2} />
                        </Link>
                        <Link
                            href="https://github.com/johndelphai/delph-monorepo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="landing-footer-link"
                        >
                            <IconBrandGithub size={16} strokeWidth={2} />
                        </Link>
                    </nav>
                </div>
            </footer>


            <style jsx>{`
                .landing-page {
                    --landing-bg: #2d2d2d;
                    --landing-bronze: #8c7f66;
                    --landing-cream: #a8aaab;
                    --landing-panel: #323232;
                    --landing-panel-strong: #38342f;
                    --landing-text-soft: rgba(255, 255, 255, 0.76);
                    --prompt-progress: 0;
                }

                .landing-prompt-morph {
                    position: fixed;
                    left: 0;
                    top: 0;
                    z-index: 75;
                    opacity: 0;
                    pointer-events: none;
                    transform-origin: top left;
                    will-change: transform, width, height, opacity, border-radius;
                }

                .landing-prompt-morph-shell {
                    height: 100%;
                    width: 100%;
                }

                .landing-prompt-morph-input {
                    width: 100%;
                    padding: 0.9rem 1rem 0.45rem;
                    font-size: 0.98rem;
                    color: rgba(255, 255, 255, 0.95);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .landing-hero {
                    background: #2d2d2d;
                }

                .landing-floating-nav {
                    position: fixed;
                    top: 16px;
                    left: 0;
                    right: 0;
                    z-index: 60;
                    display: flex;
                    justify-content: center;
                    padding: 0 1rem;
                    opacity: clamp(0, calc((var(--prompt-progress) - 0.05) * 1.2), 1);
                    transform: translateY(calc((-18px) + (18px * var(--prompt-progress))))
                        scale(calc(0.96 + (0.04 * var(--prompt-progress))));
                    pointer-events: none;
                    transition:
                        opacity 220ms ease,
                        transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
                }

                .landing-floating-nav.is-interactive {
                    pointer-events: auto;
                }

                .landing-floating-nav-inner {
                    width: min(1040px, 100%);
                    display: grid;
                    grid-template-columns: auto minmax(0, 1fr) auto;
                    align-items: center;
                    gap: 0.7rem;
                    border: 1px solid rgba(140, 127, 102, 0.28);
                    border-radius: 20px;
                    background:
                        linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)),
                        rgba(27, 27, 27, 0.72);
                    backdrop-filter: blur(18px);
                    box-shadow:
                        0 14px 38px rgba(0, 0, 0, 0.28),
                        inset 0 1px 0 rgba(255, 255, 255, 0.08);
                    padding: 0.55rem;
                }

                .landing-floating-brand {
                    font-family: 'Times New Roman', Georgia, serif;
                    font-style: italic;
                    font-size: 1.45rem;
                    line-height: 1;
                    color: white;
                    padding: 0 0.5rem;
                }

                .landing-floating-cta {
                    display: inline-flex;
                    min-height: 2.75rem;
                    align-items: center;
                    justify-content: center;
                    border-radius: 0.9rem;
                    border: 1px solid rgba(140, 127, 102, 0.34);
                    background: rgba(168, 170, 171, 0.94);
                    padding: 0.72rem 0.95rem;
                    font-size: 0.64rem;
                    font-weight: 600;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: #211d18;
                    transition:
                        transform 180ms ease,
                        background-color 180ms ease;
                }

                .landing-floating-cta:hover {
                    transform: translateY(-1px);
                    background: #c2c4c5;
                }

                .landing-hero-media {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    overflow: hidden;
                }

                .landing-hero-video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transform: scale(1.18);
                    transform-origin: center;
                    filter: blur(12px) saturate(0.92) brightness(0.82);
                }

                .landing-hero-media-overlay {
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(circle at top center, rgba(217, 189, 114, 0.18), transparent 24%),
                        radial-gradient(circle at 20% 28%, rgba(255, 255, 255, 0.08), transparent 24%),
                        linear-gradient(180deg, rgba(15, 15, 15, 0.22), rgba(15, 15, 15, 0.5));
                }

                .landing-section-bottom-art {
                    position: absolute;
                    left: 50%;
                    bottom: clamp(-20rem, -18vw, -8rem);
                    transform: translateX(-50%);
                    width: min(1200px, 94vw);
                    z-index: 1;
                    pointer-events: none;
                }

                .landing-section-bottom-art-image {
                    width: 100%;
                    height: auto;
                    display: block;
                    opacity: 0.95;
                }

                .landing-logo {
                    font-family: 'Times New Roman', Georgia, serif;
                    font-style: italic;
                    font-weight: 500;
                    text-shadow: 0 2px 18px rgba(0, 0, 0, 0.45);
                }

                .landing-prompt-shell {
                    position: relative;
                    overflow: hidden;
                    isolation: isolate;
                    border: 1px solid rgba(140, 127, 102, 0.24);
                    background:
                        linear-gradient(180deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.03) 32%, rgba(0, 0, 0, 0.18)),
                        rgba(40, 40, 40, 0.72);
                    backdrop-filter: blur(20px);
                    box-shadow:
                        0 12px 34px rgba(0, 0, 0, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.08);
                }

                .landing-prompt-shell::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    border-radius: inherit;
                    background:
                        radial-gradient(circle at top left, rgba(217, 189, 114, 0.2), transparent 34%),
                        radial-gradient(circle at bottom right, rgba(255, 255, 255, 0.08), transparent 32%);
                    pointer-events: none;
                }

                .landing-query-deck {
                    border-radius: 1.35rem;
                }

                .landing-query-deck-frame {
                    position: relative;
                    z-index: 1;
                    display: grid;
                    gap: 0.5rem;
                }

                .landing-query-input-row {
                    display: flex;
                    align-items: stretch;
                    gap: 0.55rem;
                }

                .landing-query-input-shell {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 1rem;
                    background: rgba(17, 17, 17, 0.2);
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
                }

                .landing-query-input {
                    width: 100%;
                    border: 0;
                    background: transparent;
                    color: white;
                    outline: none;
                }

                .landing-query-input::placeholder {
                    color: rgba(255, 255, 255, 0.45);
                }

                .landing-query-input-hero {
                    padding: 0.95rem 1rem;
                    font-size: clamp(1rem, 1.7vw, 1.2rem);
                    line-height: 1.1;
                }

                .landing-query-input-nav {
                    padding: 0.72rem 0.9rem;
                    font-size: 0.92rem;
                    line-height: 1.2;
                }

                .landing-query-submit-shell {
                    flex-shrink: 0;
                    display: flex;
                    align-self: stretch;
                }

                .landing-query-submit {
                    display: inline-flex;
                    width: 3.1rem;
                    height: 100%;
                    align-items: center;
                    justify-content: center;
                    border: 0;
                    border-radius: 0.95rem;
                    background:
                        linear-gradient(180deg, rgba(214, 200, 170, 0.95), rgba(140, 127, 102, 0.96)),
                        rgba(140, 127, 102, 1);
                    color: #231f1a;
                    box-shadow:
                        0 14px 30px rgba(140, 127, 102, 0.24),
                        inset 0 1px 0 rgba(255, 255, 255, 0.32);
                    cursor: pointer;
                    transition:
                        transform 180ms ease,
                        box-shadow 180ms ease,
                        filter 180ms ease;
                }

                .landing-query-submit:hover {
                    transform: translateY(-1px);
                    box-shadow:
                        0 18px 36px rgba(140, 127, 102, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.38);
                    filter: brightness(1.03);
                }

                .landing-query-submit-static {
                    pointer-events: none;
                }

                .landing-query-deck-hero {
                    padding: 0.72rem;
                }

                .landing-query-deck-nav {
                    min-width: 0;
                    padding: 0.45rem;
                }

                .landing-query-deck-nav .landing-query-input-shell {
                    min-height: 2.7rem;
                }

                .landing-query-deck-nav .landing-query-submit {
                    width: 2.7rem;
                }

                .landing-query-deck-morph {
                    padding: 0.55rem;
                }

                .landing-hero-prompt-shell {
                    opacity: calc(1 - min(1, (var(--prompt-progress) * 1.18)));
                    transform: translateY(calc(-34px * var(--prompt-progress)))
                        scale(calc(1 - (0.1 * var(--prompt-progress))));
                    transition:
                        opacity 260ms ease,
                        transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
                }

                .landing-hero-prompt-shell.is-docked {
                    pointer-events: none;
                }

                .landing-nav-prompt-shell {
                    opacity: clamp(0, calc((var(--prompt-progress) - 0.38) * 1.85), 1);
                    transform: translateY(calc((1 - var(--prompt-progress)) * 12px))
                        scale(calc(0.965 + (0.035 * var(--prompt-progress))));
                    transition:
                        opacity 240ms ease,
                        transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
                }

                .landing-prompt-shell-animated::after {
                    content: '';
                    position: absolute;
                    inset: -18% auto auto -32%;
                    width: 42%;
                    height: 160%;
                    background: linear-gradient(
                        105deg,
                        transparent 0%,
                        rgba(255, 255, 255, 0.16) 45%,
                        transparent 100%
                    );
                    transform: rotate(12deg) translateX(-140%);
                    opacity: 0.55;
                    animation: askBarSweep 7s cubic-bezier(0.22, 1, 0.36, 1) infinite;
                    pointer-events: none;
                }

                .landing-hero-focus {
                    position: relative;
                    min-height: clamp(320px, 44vh, 440px);
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .landing-hero-orb {
                    position: absolute;
                    z-index: 1;
                    border-radius: 999px;
                    filter: blur(80px);
                    opacity: 0.95;
                    pointer-events: none;
                }

                .landing-hero-orb-left {
                    left: 6%;
                    top: 12%;
                    width: clamp(180px, 24vw, 320px);
                    height: clamp(180px, 24vw, 320px);
                    background: rgba(140, 127, 102, 0.24);
                }

                .landing-hero-orb-right {
                    right: 4%;
                    bottom: 8%;
                    width: clamp(160px, 20vw, 260px);
                    height: clamp(160px, 20vw, 260px);
                    background: rgba(255, 255, 255, 0.1);
                }

                .landing-hero-grid {
                    position: absolute;
                    inset: 8% 7%;
                    z-index: 1;
                    border-radius: 2rem;
                    background:
                        linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
                    background-size: 72px 72px;
                    mask-image: radial-gradient(circle at center, black 30%, transparent 88%);
                    opacity: 0.22;
                    pointer-events: none;
                }

                .landing-hero-content {
                    position: relative;
                    z-index: 20;
                    width: 100%;
                    max-width: 760px;
                }

                .landing-hero-actions {
                    position: relative;
                    z-index: 20;
                }

                .landing-chip {
                    position: relative;
                    overflow: hidden;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.45rem;
                    border: 1px solid rgba(140, 127, 102, 0.24);
                    border-radius: 999px;
                    background: rgba(40, 40, 40, 0.54);
                    box-shadow:
                        0 10px 24px rgba(0, 0, 0, 0.16),
                        inset 0 1px 0 rgba(255, 255, 255, 0.05);
                    padding: 0.78rem 1rem;
                    font-size: 0.72rem;
                    font-weight: 600;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.82);
                    transition:
                        transform 180ms ease,
                        border-color 180ms ease,
                        background-color 180ms ease;
                    animation: chipBreathe 4s ease-in-out infinite;
                }

                .landing-chip svg {
                    flex-shrink: 0;
                    opacity: 0.82;
                }

                .landing-chip:hover {
                    transform: translateY(-1px);
                    border-color: rgba(140, 127, 102, 0.44);
                    background: rgba(56, 56, 56, 0.76);
                }

                .landing-chip:nth-child(2) {
                    animation-delay: 0.35s;
                }

                .landing-chip:nth-child(3) {
                    animation-delay: 0.7s;
                }

                .landing-chip:nth-child(4) {
                    animation-delay: 1.05s;
                }

                .landing-reveal {
                    --reveal-x: 0px;
                    --reveal-y: 26px;
                    --reveal-scale: 1;
                    --reveal-blur: 0px;
                    opacity: 0;
                    transform: translate3d(var(--reveal-x), var(--reveal-y), 0) scale(var(--reveal-scale));
                    filter: blur(var(--reveal-blur));
                    will-change: opacity, transform, filter;
                    transition:
                        opacity 680ms cubic-bezier(0.22, 1, 0.36, 1),
                        transform 900ms cubic-bezier(0.22, 1, 0.36, 1),
                        filter 900ms cubic-bezier(0.22, 1, 0.36, 1);
                    transition-delay: var(--reveal-delay, 0ms);
                }

                .landing-reveal.is-visible {
                    opacity: 1;
                    transform: translate3d(0, 0, 0) scale(1);
                    filter: blur(0px);
                }

                .landing-reveal-up {
                    --reveal-y: 32px;
                }

                .landing-reveal-left {
                    --reveal-x: -44px;
                    --reveal-y: 0px;
                    --reveal-blur: 3px;
                }

                .landing-reveal-right {
                    --reveal-x: 44px;
                    --reveal-y: 0px;
                    --reveal-blur: 3px;
                }

                .landing-reveal-1 {
                    --reveal-delay: 40ms;
                }

                .landing-reveal-2 {
                    --reveal-delay: 140ms;
                }

                .landing-reveal-3 {
                    --reveal-delay: 240ms;
                }

                .landing-reveal-4 {
                    --reveal-delay: 340ms;
                }

                .landing-marquee-track {
                    display: flex;
                    width: max-content;
                    gap: 0.75rem;
                    animation: marqueeLeft 32s linear infinite;
                }

                .landing-marquee:hover .landing-marquee-track {
                    animation-play-state: paused;
                }

                .landing-post-hero {
                    position: relative;
                    overflow-x: clip;
                    background:
                        radial-gradient(circle at top center, rgba(140, 127, 102, 0.12), transparent 28%),
                        linear-gradient(180deg, #2f2f2f 0%, #2b2b2b 48%, #262626 100%);
                }

                .landing-footer {
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    background: rgba(20, 20, 20, 0.38);
                    backdrop-filter: blur(14px);
                }

                .landing-footer-inner {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                    flex-wrap: wrap;
                    padding-top: 1.5rem;
                    padding-bottom: 1.5rem;
                }

                .landing-footer-brand {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.8rem;
                }

                .landing-footer-logo {
                    width: 2.75rem;
                    height: auto;
                    object-fit: contain;
                }

                .landing-footer-wordmark {
                    font-family: 'Times New Roman', Georgia, serif;
                    font-size: 1.5rem;
                    font-style: italic;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.94);
                    letter-spacing: 0.01em;
                }

                .landing-footer-nav {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .landing-footer-link {
                    color: rgba(255, 255, 255, 0.72);
                    font-size: 0.92rem;
                    line-height: 1;
                    transition:
                        color 180ms ease,
                        opacity 180ms ease;
                }

                .landing-footer-link:hover {
                    color: rgba(255, 255, 255, 0.96);
                }

                .landing-section {
                    position: relative;
                    padding: 6rem 0;
                    scroll-margin-top: 6.5rem;
                }

                .landing-section-rich {
                    padding-top: 7rem;
                }

                .landing-section-pricing {
                    overflow: hidden;
                    padding-bottom: clamp(12rem, 24vw, 20rem);
                }

                .landing-section-shell {
                    position: relative;
                    z-index: 2;
                }

                .landing-section-heading {
                    text-wrap: balance;
                }

                .landing-kicker {
                    font-size: 0.72rem;
                    font-weight: 500;
                    letter-spacing: 0.22em;
                    text-transform: uppercase;
                    color: rgba(168, 170, 171, 0.84);
                }

                .landing-display {
                    font-family: var(--font-bricolage), var(--font-inter), sans-serif;
                    font-size: clamp(2.5rem, 6vw, 4.9rem);
                    line-height: 0.94;
                    letter-spacing: -0.05em;
                    color: white;
                    text-wrap: balance;
                }

                .landing-display-sm {
                    font-family: var(--font-bricolage), var(--font-inter), sans-serif;
                    font-size: clamp(2rem, 4.4vw, 3.45rem);
                    line-height: 0.98;
                    letter-spacing: -0.045em;
                    color: white;
                    text-wrap: balance;
                }

                .landing-copy {
                    font-size: 1rem;
                    line-height: 1.85;
                    color: var(--landing-text-soft);
                    text-wrap: pretty;
                }

                .landing-feature-card {
                    position: relative;
                    overflow: hidden;
                    min-height: 28rem;
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    border-radius: 2rem;
                    background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.2));
                    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2);
                }

                .landing-feature-card-image {
                    position: absolute;
                    inset: 0;
                    background-position: center;
                    background-size: cover;
                    transform: scale(1.06);
                }

                .landing-feature-card-overlay {
                    position: absolute;
                    inset: 0;
                    background:
                        linear-gradient(180deg, rgba(15, 15, 15, 0.14) 0%, rgba(15, 15, 15, 0.34) 36%, rgba(15, 15, 15, 0.86) 100%),
                        radial-gradient(circle at top left, rgba(140, 127, 102, 0.2), transparent 38%);
                }

                .landing-feature-card-grid {
                    position: absolute;
                    inset: 0;
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    pointer-events: none;
                }

                .landing-feature-card-grid span {
                    border-left: 1px solid rgba(255, 255, 255, 0.05);
                }

                .landing-feature-card-grid span:first-child {
                    border-left: 0;
                }

                .landing-feature-card-content {
                    position: relative;
                    z-index: 1;
                    display: grid;
                    min-height: 28rem;
                    grid-template-rows: auto auto auto 1fr auto;
                    align-content: stretch;
                    padding: 2rem;
                }

                .landing-card-kicker {
                    font-size: 0.75rem;
                    font-weight: 500;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    color: rgba(168, 170, 171, 0.88);
                }

                .landing-card-title {
                    margin-top: 0.9rem;
                    max-width: 18rem;
                    font-family: var(--font-clash), var(--font-inter), sans-serif;
                    font-size: clamp(1.6rem, 3vw, 2.3rem);
                    line-height: 1.02;
                    letter-spacing: -0.04em;
                    color: white;
                    text-wrap: balance;
                }

                .landing-card-copy {
                    margin-top: 1rem;
                    max-width: 24rem;
                    font-size: 0.98rem;
                    line-height: 1.75;
                    color: rgba(255, 255, 255, 0.78);
                }

                .landing-feature-card-footer {
                    margin-top: 1.5rem;
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 0.7rem;
                }

                .landing-inline-stat {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 3.25rem;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 0.55rem 0.9rem;
                    font-size: 0.76rem;
                    line-height: 1.25;
                    text-align: center;
                    color: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(8px);
                }

                .landing-marquee-panel {
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 2rem;
                    background:
                        linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02)),
                        rgba(24, 24, 24, 0.44);
                    padding: 2rem;
                    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.16);
                }

                .landing-marquee-header {
                    display: grid;
                    gap: 1rem;
                }

                .landing-model-pill {
                    display: inline-flex;
                    min-width: max-content;
                    align-items: center;
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.04);
                    padding: 0.75rem 1rem;
                    font-size: 0.76rem;
                    letter-spacing: 0.01em;
                    color: rgba(255, 255, 255, 0.88);
                    backdrop-filter: blur(10px);
                }

                .landing-content-panel {
                    max-width: 33rem;
                }

                .landing-tag-pill {
                    display: inline-flex;
                    align-items: center;
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.045);
                    padding: 0.55rem 0.9rem;
                    font-size: 0.74rem;
                    text-transform: uppercase;
                    letter-spacing: 0.16em;
                    color: rgba(255, 255, 255, 0.9);
                }

                .landing-primary-cta,
                .landing-secondary-cta {
                    min-height: 3rem;
                    border-radius: 999px;
                    padding: 0.9rem 1.35rem;
                    font-size: 0.82rem;
                    font-weight: 500;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    transition:
                        transform 180ms ease,
                        background-color 180ms ease,
                        border-color 180ms ease,
                        color 180ms ease;
                }

                .landing-primary-cta:hover,
                .landing-secondary-cta:hover {
                    transform: translateY(-1px);
                }

                .landing-primary-cta {
                    background: var(--landing-bronze);
                    color: #221f1a;
                }

                .landing-primary-cta:hover {
                    background: #9b8d73;
                }

                .landing-secondary-cta {
                    border: 1px solid rgba(255, 255, 255, 0.11);
                    background: rgba(255, 255, 255, 0.03);
                    color: white;
                }

                .landing-secondary-cta:hover {
                    border-color: rgba(255, 255, 255, 0.18);
                    background: rgba(255, 255, 255, 0.06);
                }

                .landing-showcase-shell {
                    position: relative;
                    min-height: 24rem;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 2rem;
                    background:
                        radial-gradient(circle at top, rgba(140, 127, 102, 0.18), transparent 34%),
                        linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(0, 0, 0, 0.18));
                    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.18);
                }

                .landing-showcase-shell::before {
                    content: '';
                    position: absolute;
                    inset: 1.2rem;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 1.4rem;
                    pointer-events: none;
                }

                .landing-showcase-shell-left::before {
                    inset: 1.2rem;
                }

                .landing-showcase-glow {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    width: 60%;
                    height: 60%;
                    transform: translate(-50%, -50%);
                    border-radius: 999px;
                    background: rgba(140, 127, 102, 0.16);
                    filter: blur(80px);
                    pointer-events: none;
                }

                .landing-pricing-card {
                    position: relative;
                    display: flex;
                    min-height: 25rem;
                    flex-direction: column;
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    border-radius: 2rem;
                    background: linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(0, 0, 0, 0.18));
                    padding: 2rem;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.16);
                }

                .landing-pricing-card-featured {
                    border-color: rgba(140, 127, 102, 0.38);
                    background:
                        radial-gradient(circle at top, rgba(140, 127, 102, 0.16), transparent 42%),
                        linear-gradient(180deg, rgba(140, 127, 102, 0.16), rgba(56, 52, 47, 0.95));
                    transform: translateY(-10px);
                }

                .landing-pricing-badge {
                    position: absolute;
                    right: 1.5rem;
                    top: 1.4rem;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.07);
                    padding: 0.35rem 0.7rem;
                    font-size: 0.68rem;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.88);
                }

                .landing-pricing-label {
                    font-size: 1.05rem;
                    font-weight: 500;
                    color: white;
                }

                .landing-price {
                    font-family: var(--font-clash), var(--font-inter), sans-serif;
                    font-size: clamp(2.5rem, 4vw, 3.4rem);
                    line-height: 0.95;
                    letter-spacing: -0.05em;
                    color: white;
                }

                .landing-price-caption {
                    max-width: 16rem;
                    font-size: 0.95rem;
                    line-height: 1.7;
                    color: rgba(255, 255, 255, 0.74);
                }

                .landing-pricing-list {
                    margin-top: 1.75rem;
                    display: grid;
                    gap: 0.8rem;
                    font-size: 0.95rem;
                    line-height: 1.6;
                    color: rgba(255, 255, 255, 0.82);
                }

                .landing-pricing-list li {
                    position: relative;
                    padding-left: 1.2rem;
                }

                .landing-pricing-list li::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0.6rem;
                    width: 0.45rem;
                    height: 0.45rem;
                    border-radius: 999px;
                    background: rgba(140, 127, 102, 0.9);
                }

                .landing-feature-visual {
                    position: relative;
                    min-height: 24rem;
                    overflow: visible;
                }

                .landing-feature-visual-image {
                    position: absolute;
                    right: 1.2rem;
                    top: 50%;
                    width: min(380px, 76%);
                    max-width: 100%;
                    transform: translateY(-50%);
                    animation: featureFloat 6.5s ease-in-out infinite;
                }

                .landing-api-visual {
                    position: relative;
                    min-height: 24rem;
                    overflow: visible;
                }

                .landing-api-visual-image {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    width: min(360px, 74%);
                    max-width: 100%;
                    transform: translateY(-50%);
                    animation: featureFloatLeft 7s ease-in-out infinite;
                }

                @media (min-width: 768px) {
                    .landing-marquee-header {
                        grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.8fr);
                        align-items: end;
                    }
                }

                @media (max-width: 1023px) {
                    .landing-floating-nav-inner {
                        grid-template-columns: minmax(0, 1fr);
                    }

                    .landing-floating-cta {
                        display: none;
                    }

                    .landing-content-panel {
                        max-width: none;
                    }
                }

                @media (max-width: 767px) {
                    .landing-prompt-morph,
                    .landing-floating-nav {
                        display: none;
                    }

                    .landing-floating-nav {
                        top: 10px;
                        padding: 0 0.75rem;
                    }

                    .landing-floating-nav-inner {
                        gap: 0.55rem;
                        border-radius: 18px;
                        padding: 0.45rem;
                    }

                    .landing-floating-brand {
                        padding: 0 0.35rem;
                        font-size: 1.28rem;
                    }

                    .landing-hero-prompt-shell,
                    .landing-nav-prompt-shell {
                        opacity: 1;
                        transform: none;
                        transition: none;
                    }

                    .landing-hero-prompt-shell.is-docked {
                        pointer-events: auto;
                    }

                    .landing-query-deck,
                    .landing-query-input-shell {
                        border-radius: 0.95rem;
                    }

                    .landing-query-deck-hero,
                    .landing-query-deck-nav,
                    .landing-query-deck-morph {
                        padding: 0.45rem;
                    }

                    .landing-query-input-row {
                        gap: 0.55rem;
                    }

                    .landing-query-input-hero {
                        padding: 0.82rem 0.85rem;
                        font-size: 0.96rem;
                    }

                    .landing-query-input-nav {
                        padding: 0.68rem 0.8rem;
                        font-size: 0.88rem;
                    }

                    .landing-query-submit,
                    .landing-query-deck-nav .landing-query-submit {
                        width: 2.5rem;
                    }

                    .landing-hero-focus {
                        min-height: clamp(260px, 34vh, 340px);
                    }

                    .landing-hero-grid {
                        inset: 12% 0%;
                    }

                    .landing-hero-actions {
                        justify-content: flex-start;
                    }

                    .landing-feature-card-footer {
                        grid-template-columns: minmax(0, 1fr);
                    }

                    .landing-chip {
                        padding: 0.72rem 0.9rem;
                        font-size: 0.68rem;
                        letter-spacing: 0.11em;
                    }

                    .landing-section {
                        padding: 4.5rem 0;
                    }

                    .landing-section-rich {
                        padding-top: 5.5rem;
                    }

                    .landing-marquee-panel,
                    .landing-pricing-card {
                        padding: 1.5rem;
                    }

                    .landing-display {
                        font-size: clamp(2rem, 11vw, 3rem);
                        line-height: 0.98;
                    }

                    .landing-display-sm {
                        font-size: clamp(1.8rem, 10vw, 2.5rem);
                        line-height: 1;
                    }

                    .landing-copy,
                    .landing-card-copy,
                    .landing-price-caption,
                    .landing-pricing-list {
                        font-size: 0.92rem;
                        line-height: 1.7;
                    }

                    .landing-card-title {
                        max-width: none;
                        font-size: clamp(1.45rem, 8vw, 2rem);
                    }

                    .landing-marquee {
                        padding: 0.9rem;
                    }

                    .landing-model-pill {
                        padding: 0.65rem 0.85rem;
                        font-size: 0.72rem;
                    }

                    .landing-feature-card,
                    .landing-feature-card-content,
                    .landing-showcase-shell {
                        min-height: 22rem;
                    }

                    .landing-feature-visual,
                    .landing-api-visual {
                        min-height: auto;
                        overflow: hidden;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding-top: 1rem;
                    }

                    .landing-footer-inner {
                        justify-content: flex-start;
                        padding-top: 1.2rem;
                        padding-bottom: 1.2rem;
                    }

                    .landing-footer-wordmark {
                        font-size: 1.35rem;
                    }

                    .landing-footer-nav {
                        justify-content: flex-start;
                        gap: 0.85rem 1rem;
                    }

                    .landing-footer-link {
                        font-size: 0.88rem;
                    }

                    .landing-feature-visual-image,
                    .landing-api-visual-image {
                        position: relative;
                        top: auto;
                        left: auto;
                        right: auto;
                        display: block;
                        width: min(320px, 100%);
                        margin: 0 auto;
                        transform: none;
                        animation: none;
                    }

                    .landing-pricing-card-featured {
                        transform: none;
                    }
                }

                @keyframes marqueeLeft {
                    0% {
                        transform: translateX(0%);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }

                @keyframes featureFloat {
                    0% {
                        transform: translateY(-50%) translateX(0px);
                    }
                    50% {
                        transform: translateY(calc(-50% - 10px)) translateX(-6px);
                    }
                    100% {
                        transform: translateY(-50%) translateX(0px);
                    }
                }

                @keyframes featureFloatLeft {
                    0% {
                        transform: translateY(-50%) translateX(0px);
                    }
                    50% {
                        transform: translateY(calc(-50% - 10px)) translateX(6px);
                    }
                    100% {
                        transform: translateY(-50%) translateX(0px);
                    }
                }

                @keyframes askBarSweep {
                    0% {
                        transform: rotate(12deg) translateX(-140%);
                        opacity: 0;
                    }
                    18% {
                        opacity: 0.82;
                    }
                    100% {
                        transform: rotate(12deg) translateX(360%);
                        opacity: 0;
                    }
                }

                @keyframes chipBreathe {
                    0%,
                    100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-2px);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .landing-reveal {
                        opacity: 1;
                        transform: none;
                        filter: none;
                        transition: none;
                    }
                }

            `}</style>
        </main>
    );
}
