import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    // Test writing to cache
    await redis.set('test-key', { message: 'Hello from cache!' }, { ex: 30 });
    console.log('Successfully wrote to cache');

    // Test reading from cache
    const data = await redis.get('test-key');
    console.log('Successfully read from cache:', data);

    return NextResponse.json({
      success: true,
      cachedData: data,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Cache test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 