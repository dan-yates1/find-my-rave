import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    // Test key with JSON data
    const testData = {
      message: 'Hello from cache!',
      timestamp: new Date().toISOString()
    };

    // Convert object to string before storing
    await redis.set('test-key', JSON.stringify(testData));
    console.log('Successfully wrote to cache');

    // Get and parse the data back
    const rawData = await redis.get('test-key');
    const parsedData = rawData ? JSON.parse(rawData as string) : null;
    console.log('Successfully read from cache:', parsedData);

    // Test connection with ping
    const isConnected = await redis.ping();

    return NextResponse.json({
      success: true,
      cachedData: parsedData,
      connectionStatus: isConnected === 'PONG' ? 'connected' : 'error',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Cache test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: error.name,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    // Cleanup
    try {
      await redis.del('test-key');
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
  }
} 