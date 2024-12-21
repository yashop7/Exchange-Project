import { NextResponse } from 'next/server';
import axios from 'axios';
import { KLine } from '@/app/utils/types';

const BASE_URL = 'https://api.backpack.exchange/api/v1';



export async function GET(req: Request): Promise<NextResponse<KLine[] | { error: string }>> {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    const interval = searchParams.get('interval');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');

    if (!symbol || !interval || !startTime || !endTime) {
        return NextResponse.json({ error: 'Missing required query parameters' }, { status: 400 });
    }

    try {
        const response = await axios.get(`${BASE_URL}/klines`, {
            params: {
                symbol,
                interval,
                startTime,
                endTime,
            },
        });

        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Failed to fetch klines:', error);
        return NextResponse.json({ error: 'Failed to fetch klines' }, { status: 500 });
    }
}
