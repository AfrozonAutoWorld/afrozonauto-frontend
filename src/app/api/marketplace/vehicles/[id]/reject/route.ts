import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import {
  extractUser,
  unauthorized,
  forbidden,
  notFound,
  badRequest,
  success,
  serverError,
  createNotification,
  createAuditLog,
} from '@/lib/marketplace/api-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = extractUser(request);
    if (!user) return unauthorized();
    if (user.role !== 'ADMIN') return forbidden('Admin only');

    const body = await request.json();
    if (!body.reason?.trim()) {
      return badRequest('Rejection reason is required');
    }

    const supabase = createServiceClient();

    const { data: vehicle } = await supabase
      .from('marketplace_vehicles')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    if (!vehicle) return notFound('Vehicle not found');

    if (vehicle.status !== 'PENDING_REVIEW') {
      return badRequest('Can only reject vehicles pending review');
    }

    const { error } = await supabase
      .from('marketplace_vehicles')
      .update({ status: 'REJECTED', rejection_reason: body.reason.trim() })
      .eq('id', params.id);

    if (error) return serverError(error.message);

    await createAuditLog(
      supabase,
      user.userId,
      'REJECT_VEHICLE',
      'marketplace_vehicles',
      params.id,
      { reason: body.reason.trim(), make: vehicle.make, model: vehicle.model }
    );

    await createNotification(
      supabase,
      vehicle.seller_id,
      'Listing Rejected',
      `Your listing for ${vehicle.year} ${vehicle.make} ${vehicle.model} was rejected: ${body.reason.trim()}`,
      'error',
      `/seller`
    );

    return success({ status: 'REJECTED' });
  } catch {
    return serverError();
  }
}
