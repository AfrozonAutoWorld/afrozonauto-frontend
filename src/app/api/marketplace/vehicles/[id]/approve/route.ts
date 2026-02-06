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

    const supabase = createServiceClient();

    const { data: vehicle } = await supabase
      .from('marketplace_vehicles')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    if (!vehicle) return notFound('Vehicle not found');

    if (vehicle.status !== 'PENDING_REVIEW') {
      return badRequest('Can only approve vehicles pending review');
    }

    const { error } = await supabase
      .from('marketplace_vehicles')
      .update({ status: 'APPROVED' })
      .eq('id', params.id);

    if (error) return serverError(error.message);

    await createAuditLog(
      supabase,
      user.userId,
      'APPROVE_VEHICLE',
      'marketplace_vehicles',
      params.id,
      { make: vehicle.make, model: vehicle.model, year: vehicle.year }
    );

    await createNotification(
      supabase,
      vehicle.seller_id,
      'Listing Approved',
      `Your listing for ${vehicle.year} ${vehicle.make} ${vehicle.model} has been approved and is now live.`,
      'success',
      `/seller`
    );

    return success({ status: 'APPROVED' });
  } catch {
    return serverError();
  }
}
