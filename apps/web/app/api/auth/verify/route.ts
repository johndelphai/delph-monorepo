import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'buffer';
import {
    clearWalletChallenge,
    getWalletChallenge,
    setAuthCookie,
    verifyWalletSignature,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { walletAddress, message, signature } = await request.json();

        if (
            !walletAddress ||
            typeof walletAddress !== 'string' ||
            !message ||
            typeof message !== 'string' ||
            !signature ||
            typeof signature !== 'string'
        ) {
            return NextResponse.json({ error: 'Invalid verification payload' }, { status: 400 });
        }

        const challenge = await getWalletChallenge(walletAddress);

        if (!challenge) {
            return NextResponse.json(
                { error: 'Authentication challenge expired. Please try again.' },
                { status: 400 }
            );
        }

        if (challenge.message !== message) {
            return NextResponse.json({ error: 'Signed message does not match challenge' }, { status: 400 });
        }

        const signatureBytes = Buffer.from(signature, 'base64');

        if (signatureBytes.length === 0) {
            return NextResponse.json({ error: 'Signature payload could not be decoded from base64' }, { status: 400 });
        }

        let isValid = false;
        try {
            isValid = verifyWalletSignature({
                walletAddress,
                message,
                signature: new Uint8Array(signatureBytes),
            });
        } catch (error) {
            return NextResponse.json(
                {
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Failed to verify wallet signature payload',
                },
                { status: 400 }
            );
        }

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid wallet signature' }, { status: 401 });
        }

        await clearWalletChallenge(walletAddress);

        const response = NextResponse.json({ success: true, walletAddress });
        setAuthCookie(response, walletAddress);

        return response;
    } catch (error) {
        console.error('Failed to verify wallet signature:', error);

        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : 'Failed to verify signature',
            },
            { status: 400 }
        );
    }
}
