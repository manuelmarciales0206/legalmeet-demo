import { NextResponse } from 'next/server';
import { conversationService } from '@/services/conversation.service';

export async function GET() {
  const stats = conversationService.getStats();
  
  return NextResponse.json({
    success: true,
    ...stats,
  });
}