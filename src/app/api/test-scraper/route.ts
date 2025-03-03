/**
 * Test Scraper API Endpoint - TEMPORARILY DISABLED
 * 
 * This endpoint is currently disabled as web scrapers have been temporarily removed.
 */

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return NextResponse.json({
    success: false,
    message: "Web scrapers have been temporarily disabled. Please use the Skiddle API instead."
  }, { status: 503 });
}
