import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import Stripe from "npm:stripe@14.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!stripeKey || !webhookSecret) {
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      return new Response(
        JSON.stringify({ error: "Missing signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const { request_id, payment_type, buyer_id, vehicle_id } = pi.metadata;

      await supabase
        .from("marketplace_payments")
        .update({ status: "succeeded" })
        .eq("stripe_payment_intent_id", pi.id);

      if (payment_type === "DEPOSIT") {
        await supabase
          .from("vehicle_requests")
          .update({ status: "DEPOSIT_PAID" })
          .eq("id", request_id);

        await supabase.from("notifications").insert([
          {
            user_id: buyer_id,
            title: "Deposit Received",
            message: "Your deposit has been received. An admin will verify availability.",
            type: "success",
            link: "/dashboard",
          },
          {
            user_id: "ADMIN",
            title: "Deposit Paid - Verification Needed",
            message: "A buyer paid a deposit. Please verify vehicle availability.",
            type: "info",
            link: "/admin/requests",
          },
        ]);
      }

      if (payment_type === "FINAL") {
        await supabase
          .from("vehicle_requests")
          .update({ status: "COMPLETED" })
          .eq("id", request_id);

        await supabase
          .from("marketplace_vehicles")
          .update({ status: "SOLD" })
          .eq("id", vehicle_id);

        const { data: vehicle } = await supabase
          .from("marketplace_vehicles")
          .select("seller_id, year, make, model")
          .eq("id", vehicle_id)
          .maybeSingle();

        const notifications = [
          {
            user_id: buyer_id,
            title: "Purchase Complete",
            message: "Congratulations! Your vehicle purchase is complete.",
            type: "success",
            link: "/dashboard",
          },
        ];

        if (vehicle) {
          notifications.push({
            user_id: vehicle.seller_id,
            title: "Vehicle Sold",
            message: `Your ${vehicle.year} ${vehicle.make} ${vehicle.model} has been sold!`,
            type: "success",
            link: "/seller",
          });
        }

        await supabase.from("notifications").insert(notifications);
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as Stripe.PaymentIntent;
      await supabase
        .from("marketplace_payments")
        .update({ status: "failed" })
        .eq("stripe_payment_intent_id", pi.id);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: "Webhook handler failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
