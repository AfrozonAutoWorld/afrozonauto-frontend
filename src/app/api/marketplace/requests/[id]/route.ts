import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import {
  extractUser,
  unauthorized,
  forbidden,
  notFound,
  success,
  serverError,
} from '@/lib/marketplace/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = extractUser(request);
    if (!user) return unauthorized();

    const supabase = createServiceClient();

    const { data: req, error } = await supabase
      .from('vehicle_requests')
      .select('*, vehicle:marketplace_vehicles(*, images:vehicle_images(*)), payments:marketplace_payments(*)')
      .eq('id', params.id)
      .maybeSingle();

    if (error) return serverError(error.message);
    if (!req) return notFound();

    if (req.buyer_id !== user.userId && user.role !== 'ADMIN') {
      return forbidden();
    }

    return success(req);
  } catch {
    return serverError();
  }
}
