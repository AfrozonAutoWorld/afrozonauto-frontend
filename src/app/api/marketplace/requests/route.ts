import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { DEFAULT_DEPOSIT_AMOUNT } from '@/lib/marketplace/constants';
import {
  extractUser,
  unauthorized,
  forbidden,
  badRequest,
  success,
  serverError,
  createNotification,
} from '@/lib/marketplace/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = extractUser(request);
    if (!user) return unauthorized();

    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope');

    if (scope === 'admin') {
      if (user.role !== 'ADMIN') return forbidden();

      const statusFilter = searchParams.get('status');
      let query = supabase
        .from('vehicle_requests')
        .select('*, vehicle:marketplace_vehicles(*, images:vehicle_images(*))')
        .order('created_at', { ascending: false });

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) return serverError(error.message);
      return success(data);
    }

    const { data, error } = await supabase
      .from('vehicle_requests')
      .select('*, vehicle:marketplace_vehicles(*, images:vehicle_images(*))')
      .eq('buyer_id', user.userId)
      .order('created_at', { ascending: false });

    if (error) return serverError(error.message);
    return success(data);
  } catch {
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = extractUser(request);
    if (!user) return unauthorized();

    const body = await request.json();
    if (!body.vehicle_id) return badRequest('Vehicle ID is required');

    const supabase = createServiceClient();

    const { data: vehicle } = await supabase
      .from('marketplace_vehicles')
      .select('*')
      .eq('id', body.vehicle_id)
      .eq('status', 'APPROVED')
      .maybeSingle();

    if (!vehicle) return badRequest('Vehicle not available');

    const { data: existingReq } = await supabase
      .from('vehicle_requests')
      .select('id')
      .eq('buyer_id', user.userId)
      .eq('vehicle_id', body.vehicle_id)
      .not('status', 'in', '("CANCELED","COMPLETED")')
      .maybeSingle();

    if (existingReq) {
      return badRequest('You already have an active request for this vehicle');
    }

    const depositAmount = body.deposit_amount || DEFAULT_DEPOSIT_AMOUNT;

    const { data: req, error } = await supabase
      .from('vehicle_requests')
      .insert({
        buyer_id: user.userId,
        vehicle_id: body.vehicle_id,
        status: 'DEPOSIT_PENDING',
        deposit_amount: depositAmount,
        final_amount: vehicle.price_usd - depositAmount,
        notes: body.notes || '',
      })
      .select('*, vehicle:marketplace_vehicles(*)')
      .single();

    if (error) return serverError(error.message);

    await createNotification(
      supabase,
      user.userId,
      'Request Created',
      `Your request for ${vehicle.year} ${vehicle.make} ${vehicle.model} has been created. Please pay the deposit to proceed.`,
      'info',
      `/dashboard`
    );

    return success(req, 201);
  } catch {
    return serverError();
  }
}
