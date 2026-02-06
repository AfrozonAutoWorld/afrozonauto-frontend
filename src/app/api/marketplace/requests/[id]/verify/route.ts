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
    const action = body.action as 'verify' | 'cancel';

    const supabase = createServiceClient();

    const { data: req } = await supabase
      .from('vehicle_requests')
      .select('*, vehicle:marketplace_vehicles(*)')
      .eq('id', params.id)
      .maybeSingle();

    if (!req) return notFound();

    if (action === 'verify') {
      if (!['DEPOSIT_PAID', 'ADMIN_VERIFYING'].includes(req.status)) {
        return badRequest('Request is not in a verifiable state');
      }

      const { error } = await supabase
        .from('vehicle_requests')
        .update({ status: 'VERIFIED_AVAILABLE' })
        .eq('id', params.id);

      if (error) return serverError(error.message);

      await createAuditLog(
        supabase,
        user.userId,
        'VERIFY_REQUEST',
        'vehicle_requests',
        params.id,
        { vehicle_id: req.vehicle_id }
      );

      await createNotification(
        supabase,
        req.buyer_id,
        'Vehicle Verified Available',
        `The vehicle you requested has been verified as available. You can now complete the purchase.`,
        'success',
        `/dashboard`
      );

      return success({ status: 'VERIFIED_AVAILABLE' });
    }

    if (action === 'cancel') {
      if (!body.reason?.trim()) {
        return badRequest('Cancellation reason is required');
      }

      const { error } = await supabase
        .from('vehicle_requests')
        .update({ status: 'CANCELED', cancel_reason: body.reason.trim() })
        .eq('id', params.id);

      if (error) return serverError(error.message);

      await createAuditLog(
        supabase,
        user.userId,
        'CANCEL_REQUEST',
        'vehicle_requests',
        params.id,
        { reason: body.reason.trim() }
      );

      await createNotification(
        supabase,
        req.buyer_id,
        'Request Canceled',
        `Your vehicle request has been canceled: ${body.reason.trim()}`,
        'error',
        `/dashboard`
      );

      return success({ status: 'CANCELED' });
    }

    return badRequest('Invalid action');
  } catch {
    return serverError();
  }
}
