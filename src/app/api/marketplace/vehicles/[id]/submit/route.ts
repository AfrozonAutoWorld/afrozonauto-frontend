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
} from '@/lib/marketplace/api-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = extractUser(request);
    if (!user) return unauthorized();

    const supabase = createServiceClient();

    const { data: vehicle } = await supabase
      .from('marketplace_vehicles')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    if (!vehicle) return notFound('Vehicle not found');
    if (vehicle.seller_id !== user.userId) return forbidden();

    if (!['DRAFT', 'REJECTED'].includes(vehicle.status)) {
      return badRequest('Can only submit draft or rejected vehicles');
    }

    if (!vehicle.make || !vehicle.model || !vehicle.year || !vehicle.price_usd) {
      return badRequest('Vehicle must have make, model, year, and price before submitting');
    }

    const { error } = await supabase
      .from('marketplace_vehicles')
      .update({ status: 'PENDING_REVIEW', rejection_reason: null })
      .eq('id', params.id);

    if (error) return serverError(error.message);

    await createNotification(
      supabase,
      user.userId,
      'Listing Submitted',
      `Your listing for ${vehicle.year} ${vehicle.make} ${vehicle.model} has been submitted for review.`,
      'info',
      `/seller`
    );

    const { data: admins } = await supabase
      .from('marketplace_vehicles')
      .select('id')
      .limit(1);

    if (admins) {
      await createNotification(
        supabase,
        'ADMIN',
        'New Listing Pending Review',
        `A new listing for ${vehicle.year} ${vehicle.make} ${vehicle.model} needs review.`,
        'info',
        `/admin/vehicles`
      );
    }

    return success({ status: 'PENDING_REVIEW' });
  } catch {
    return serverError();
  }
}
