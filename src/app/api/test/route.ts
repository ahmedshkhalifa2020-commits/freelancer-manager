import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  logger.info('Test API called');

  try {
    // Simulate some operation
    logger.debug('Processing test request');

    return NextResponse.json({ message: 'Test successful' });
  } catch (error) {
    logger.error({
      message: 'Error in test API',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}