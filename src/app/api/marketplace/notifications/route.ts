import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import {
  extractUser,
  unauthorized,
  success,
  serverError,
} from '@/lib/marketplace/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = extractUser(request);
    if (!user) return unauthorized();

    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';

    let query = supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${user.userId}${user.role === 'ADMIN' ? ',user_id.eq.ADMIN' : ''}`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;
    if (error) return serverError(error.message);
    return success(data);
  } catch {
    return serverError();
  }
}
