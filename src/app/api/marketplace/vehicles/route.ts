import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import {
  extractUser,
  unauthorized,
  forbidden,
  badRequest,
  success,
  serverError,
} from '@/lib/marketplace/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = extractUser(request);
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope');

    if (scope === 'seller') {
      if (!user) return unauthorized();
      if (user.role !== 'SELLER' && user.role !== 'ADMIN') return forbidden();

      const { data, error } = await supabase
        .from('marketplace_vehicles')
        .select('*, images:vehicle_images(*)')
        .eq('seller_id', user.userId)
        .order('created_at', { ascending: false });

      if (error) return serverError(error.message);
      return success(data);
    }

    if (scope === 'admin') {
      if (!user) return unauthorized();
      if (user.role !== 'ADMIN') return forbidden();

      const statusFilter = searchParams.get('status');
      let query = supabase
        .from('marketplace_vehicles')
        .select('*, images:vehicle_images(*)')
        .order('created_at', { ascending: false });

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) return serverError(error.message);
      return success(data);
    }

    const { data, error } = await supabase
      .from('marketplace_vehicles')
      .select('*, images:vehicle_images(*)')
      .eq('status', 'APPROVED')
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
    if (user.role !== 'SELLER' && user.role !== 'ADMIN') {
      return forbidden('Only sellers can create listings');
    }

    const body = await request.json();
    const { image_urls, ...vehicleData } = body;

    if (!vehicleData.make || !vehicleData.model || !vehicleData.year) {
      return badRequest('Make, model, and year are required');
    }

    const supabase = createServiceClient();

    const { data: vehicle, error } = await supabase
      .from('marketplace_vehicles')
      .insert({
        ...vehicleData,
        seller_id: user.userId,
        status: 'DRAFT',
      })
      .select()
      .single();

    if (error) return serverError(error.message);

    if (image_urls?.length > 0) {
      const images = image_urls.map((url: string, i: number) => ({
        vehicle_id: vehicle.id,
        url,
        is_primary: i === 0,
        sort_order: i,
      }));
      await supabase.from('vehicle_images').insert(images);
    }

    const { data: result } = await supabase
      .from('marketplace_vehicles')
      .select('*, images:vehicle_images(*)')
      .eq('id', vehicle.id)
      .single();

    return success(result, 201);
  } catch {
    return serverError();
  }
}
