import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createNotification } from '@/lib/marketplace/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!stripeKey || !webhookSecret) {
      return NextResponse.json({ error: 'Not configured' }, { status: 500 });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    const body = await request.text();
    const sig = request.headers.get('stripe-signature');
    if (!sig) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = createServiceClient();

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      const { request_id, payment_type, buyer_id, vehicle_id } = pi.metadata;

      await supabase
        .from('marketplace_payments')
        .update({ status: 'succeeded' })
        .eq('stripe_payment_intent_id', pi.id);

      if (payment_type === 'DEPOSIT') {
        await supabase
          .from('vehicle_requests')
          .update({ status: 'DEPOSIT_PAID' })
          .eq('id', request_id);

        await createNotification(
          supabase,
          buyer_id,
          'Deposit Received',
          'Your deposit has been received. An admin will verify the vehicle availability.',
          'success',
          '/dashboard'
        );

        await createNotification(
          supabase,
          'ADMIN',
          'Deposit Paid - Verification Needed',
          `A buyer has paid a deposit for a vehicle. Please verify availability.`,
          'info',
          '/admin/requests'
        );
      }

      if (payment_type === 'FINAL') {
        await supabase
          .from('vehicle_requests')
          .update({ status: 'COMPLETED' })
          .eq('id', request_id);

        await supabase
          .from('marketplace_vehicles')
          .update({ status: 'SOLD' })
          .eq('id', vehicle_id);

        await createNotification(
          supabase,
          buyer_id,
          'Purchase Complete',
          'Congratulations! Your vehicle purchase is complete.',
          'success',
          '/dashboard'
        );

        const { data: vehicle } = await supabase
          .from('marketplace_vehicles')
          .select('seller_id, year, make, model')
          .eq('id', vehicle_id)
          .maybeSingle();

        if (vehicle) {
          await createNotification(
            supabase,
            vehicle.seller_id,
            'Vehicle Sold',
            `Your ${vehicle.year} ${vehicle.make} ${vehicle.model} has been sold!`,
            'success',
            '/seller'
          );
        }
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object;
      await supabase
        .from('marketplace_payments')
        .update({ status: 'failed' })
        .eq('stripe_payment_intent_id', pi.id);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
