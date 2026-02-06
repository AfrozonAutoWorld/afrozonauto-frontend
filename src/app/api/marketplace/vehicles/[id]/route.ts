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
    const supabase = createServiceClient();
    const user = extractUser(request);

    const { data: vehicle, error } = await supabase
      .from('marketplace_vehicles')
      .select('*, images:vehicle_images(*)')
      .eq('id', params.id)
      .maybeSingle();

    if (error) return serverError(error.message);
    if (!vehicle) return notFound('Vehicle not found');

    if (vehicle.status !== 'APPROVED') {
      if (!user) return notFound('Vehicle not found');
      const isOwner = vehicle.seller_id === user.userId;
      const isAdmin = user.role === 'ADMIN';
      if (!isOwner && !isAdmin) return notFound('Vehicle not found');
    }

    const response = { ...vehicle };
    if (!user || (user.role !== 'ADMIN' && user.userId !== vehicle.seller_id)) {
      delete (response as Record<string, unknown>).seller_id;
    }

    return success(response);
  } catch {
    return serverError();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = extractUser(request);
    if (!user) return unauthorized();

    const supabase = createServiceClient();

    const { data: existing } = await supabase
      .from('marketplace_vehicles')
      .select('seller_id, status')
      .eq('id', params.id)
      .maybeSingle();

    if (!existing) return notFound('Vehicle not found');
    if (existing.seller_id !== user.userId && user.role !== 'ADMIN') {
      return forbidden('You can only edit your own vehicles');
    }

    if (!['DRAFT', 'REJECTED'].includes(existing.status) && user.role !== 'ADMIN') {
      return forbidden('Can only edit draft or rejected vehicles');
    }

    const body = await request.json();
    const { image_urls, ...vehicleData } = body;

    const { error } = await supabase
      .from('marketplace_vehicles')
      .update(vehicleData)
      .eq('id', params.id);

    if (error) return serverError(error.message);

    if (image_urls !== undefined) {
      await supabase.from('vehicle_images').delete().eq('vehicle_id', params.id);
      if (image_urls.length > 0) {
        const images = image_urls.map((url: string, i: number) => ({
          vehicle_id: params.id,
          url,
          is_primary: i === 0,
          sort_order: i,
        }));
        await supabase.from('vehicle_images').insert(images);
      }
    }

    const { data: result } = await supabase
      .from('marketplace_vehicles')
      .select('*, images:vehicle_images(*)')
      .eq('id', params.id)
      .single();

    return success(result);
  } catch {
    return serverError();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = extractUser(request);
    if (!user) return unauthorized();

    const supabase = createServiceClient();

    const { data: existing } = await supabase
      .from('marketplace_vehicles')
      .select('seller_id, status')
      .eq('id', params.id)
      .maybeSingle();

    if (!existing) return notFound();
    if (existing.seller_id !== user.userId && user.role !== 'ADMIN') {
      return forbidden();
    }

    if (existing.status !== 'DRAFT' && user.role !== 'ADMIN') {
      return forbidden('Can only delete draft vehicles');
    }

    const { error } = await supabase
      .from('marketplace_vehicles')
      .delete()
      .eq('id', params.id);

    if (error) return serverError(error.message);
    return success({ deleted: true });
  } catch {
    return serverError();
  }
}
