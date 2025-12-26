import { kv } from '../../../../lib/redis';
import { randomBytes } from 'crypto';
import { getAuthSession } from '@/lib/auth';

const KEY_PREFIX = 'llmchat:apikey:';
const USER_KEY_PREFIX = 'llmchat:user_apikey:';
const KEY_TTL = 60 * 60 * 24 * 365; // 1 year

export async function GET() {
    const session = await getAuthSession();
    if (!session?.userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingKey = await kv.get(`${USER_KEY_PREFIX}${session.userId}`);
    if (!existingKey) {
        return Response.json({ hasKey: false });
    }

    // Return masked key
    const maskedKey = `llmchat-${'*'.repeat(20)}${(existingKey as string).slice(-6)}`;
    return Response.json({ hasKey: true, maskedKey });
}

export async function POST() {
    const session = await getAuthSession();
    if (!session?.userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Revoke old key if exists
    const oldKey = await kv.get(`${USER_KEY_PREFIX}${session.userId}`);
    if (oldKey) {
        await kv.del(`${KEY_PREFIX}${oldKey}`);
    }

    // Generate new key
    const rawKey = randomBytes(24).toString('hex');
    const apiKey = `llmchat-${rawKey}`;

    // Store key → userId and userId → key
    await kv.setex(`${KEY_PREFIX}${apiKey}`, KEY_TTL, session.userId);
    await kv.setex(`${USER_KEY_PREFIX}${session.userId}`, KEY_TTL, apiKey);

    return Response.json({ apiKey });
}

export async function DELETE() {
    const session = await getAuthSession();
    if (!session?.userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingKey = await kv.get(`${USER_KEY_PREFIX}${session.userId}`);
    if (existingKey) {
        await kv.del(`${KEY_PREFIX}${existingKey}`);
        await kv.del(`${USER_KEY_PREFIX}${session.userId}`);
    }

    return Response.json({ success: true });
}
