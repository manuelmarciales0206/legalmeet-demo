import { NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics.service';

export async function GET() {
  try {
    const data = analyticsService.getDashboardData();
    
    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error getting stats:', error);
    return NextResponse.json(
      { error: 'Failed to get statistics' },
      { status: 500 }
    );
  }
}