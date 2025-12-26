import { CHAT_MODE_CREDIT_COSTS, ChatMode } from '@repo/shared/config';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { kv } from '../../../../lib/redis';
import { deductCredits, getRemainingCredits } from '../../completion/credit-service';
import { executeStream } from '../../completion/stream-handlers';
import { SSE_HEADERS } from '../../completion/types';

const KEY_PREFIX = 'llmchat:apikey:';

const chatRequestSchema = z.object({
    model: z.nativeEnum(ChatMode).optional().default(ChatMode.GEMINI_2_FLASH),
    messages: z
        .array(
            z.object({
                role: z.enum(['user', 'assistant', 'system']),
                content: z.string(),
            })
        )
        .min(1),
    stream: z.boolean().optional().default(true),
    thread_id: z.string().optional(),
    custom_instructions: z.string().optional(),
    web_search: z.boolean().optional().default(false),
});

async function validateApiKey(request: NextRequest): Promise<string | null> {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const apiKey = authHeader.slice(7).trim();
    if (!apiKey) return null;

    const userId = await kv.get(`${KEY_PREFIX}${apiKey}`);
    return (userId as string) || null;
}

export async function POST(request: NextRequest) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: SSE_HEADERS });
    }

    const userId = await validateApiKey(request);
    if (!userId) {
        return Response.json({ error: 'Invalid or missing API key' }, { status: 401 });
    }

    let parsed: any;
    try {
        parsed = await request.json();
    } catch {
        return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const validated = chatRequestSchema.safeParse(parsed);
    if (!validated.success) {
        return Response.json(
            { error: 'Invalid request', details: validated.error.format() },
            { status: 400 }
        );
    }

    const { data } = validated;
    const mode = data.model;
    const creditCost = CHAT_MODE_CREDIT_COSTS[mode] ?? 1;

    const remaining = await getRemainingCredits({ userId });
    if (remaining < creditCost) {
        return Response.json(
            { error: 'Insufficient credits. Credits reset daily.' },
            { status: 429 }
        );
    }

    // Build prompt from last user message
    const userMessages = data.messages.filter(m => m.role === 'user');
    const prompt = userMessages[userMessages.length - 1]?.content ?? '';
    const systemMessage = data.messages.find(m => m.role === 'system')?.content;

    const threadId = data.thread_id ?? `api-${Date.now()}`;
    const threadItemId = `item-${Date.now()}`;
    const encoder = new TextEncoder();
    const abortController = new AbortController();

    const body = {
        threadId,
        threadItemId,
        parentThreadItemId: '',
        prompt,
        messages: data.messages.filter(m => m.role !== 'system'),
        mode,
        webSearch: data.web_search,
        showSuggestions: false,
        customInstructions: [systemMessage, data.custom_instructions]
            .filter(Boolean)
            .join('\n\n'),
    };

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            await executeStream({
                controller,
                encoder,
                data: body as any,
                abortController,
                userId,
                onFinish: async () => {
                    await deductCredits({ userId }, creditCost);
                },
            });
            controller.close();
        },
    });

    return new Response(stream, { headers: SSE_HEADERS });
}
