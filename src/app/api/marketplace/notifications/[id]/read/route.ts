import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import {
  extractUser,
  unauthorized,
  success,
  serverError,
} from '@/lib/marketplace/api-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = extractUser(request);
    if (!user) return unauthorized();

    const supabase = createServiceClient();

    if (params.id === 'all') {
      const userFilter = user.role === 'ADMIN'
        ? `user_id.eq.${user.userId},user_id.eq.ADMIN`
        : `user_id.eq.${user.userId}`;

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .or(userFilter);
    } else {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', params.id);
    }

    return success({ marked: true });
  } catch {
    return serverError();
  }
}
