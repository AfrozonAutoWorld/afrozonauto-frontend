import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import {
  extractUser,
  unauthorized,
  badRequest,
  success,
  serverError,
} from '@/lib/marketplace/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return serverError('Payment system not configured');
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    const user = extractUser(request);
    if (!user) return unauthorized();

    const body = await request.json();
    const { request_id, payment_type } = body;

    if (!request_id || !payment_type) {
      return badRequest('request_id and payment_type are required');
    }

    const supabase = createServiceClient();

    const { data: req } = await supabase
      .from('vehicle_requests')
      .select('*, vehicle:marketplace_vehicles(*)')
      .eq('id', request_id)
      .maybeSingle();

    if (!req) return badRequest('Request not found');
    if (req.buyer_id !== user.userId) return unauthorized();

    let amount: number;
    let expectedStatus: string;

    if (payment_type === 'DEPOSIT') {
      expectedStatus = 'DEPOSIT_PENDING';
      amount = Number(req.deposit_amount);
    } else if (payment_type === 'FINAL') {
      expectedStatus = 'FINAL_PAYMENT_PENDING';
      amount = Number(req.final_amount);
    } else {
      return badRequest('Invalid payment type');
    }

    if (req.status !== expectedStatus && !(payment_type === 'FINAL' && req.status === 'VERIFIED_AVAILABLE')) {
      return badRequest(`Request is not in the correct state for ${payment_type} payment`);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: {
        request_id,
        payment_type,
        buyer_id: user.userId,
        vehicle_id: req.vehicle_id,
      },
    });

    const { error } = await supabase.from('marketplace_payments').insert({
      request_id,
      payer_id: user.userId,
      payment_type,
      stripe_payment_intent_id: paymentIntent.id,
      amount,
      currency: 'usd',
      status: 'processing',
    });

    if (error) return serverError(error.message);

    return success({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    });
  } catch (err) {
    console.error('Payment intent error:', err);
    return serverError();
  }
}
