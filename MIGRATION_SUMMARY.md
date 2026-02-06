# Marketplace Migration Summary

## Overview

This migration adds a multi-role marketplace workflow to the existing Afrozon AutoGlobal platform. Three roles are supported: **Buyer** (existing users), **Seller** (list vehicles for sale), and **Admin** (review listings, verify purchases). The entire system is backed by Supabase with Row Level Security and integrates Stripe for deposit and final payments.

---

## New Database Tables

All tables are created in the `public` schema with RLS enabled.

| Table | Purpose |
|---|---|
| `marketplace_vehicles` | Vehicles listed by sellers (DRAFT, PENDING_REVIEW, APPROVED, REJECTED, SOLD, ARCHIVED) |
| `vehicle_images` | Image URLs attached to marketplace vehicles |
| `vehicle_requests` | Buyer purchase requests with full status lifecycle |
| `marketplace_payments` | Stripe payment records (deposit + final) |
| `notifications` | In-app notifications for all roles |
| `audit_logs` | Admin action audit trail |

### Vehicle Status Lifecycle

```
DRAFT -> PENDING_REVIEW -> APPROVED -> SOLD
                       \-> REJECTED -> (re-submit) -> PENDING_REVIEW
                                   \-> ARCHIVED
```

### Request Status Lifecycle

```
NEW_REQUEST -> DEPOSIT_PENDING -> DEPOSIT_PAID -> ADMIN_VERIFYING
-> VERIFIED_AVAILABLE -> FINAL_PAYMENT_PENDING -> COMPLETED
                     \-> CANCELED
```

---

## New Routes

### Pages

| Route | Role | Description |
|---|---|---|
| `/seller` | Seller | Seller dashboard with stats and vehicle list |
| `/seller/vehicles/new` | Seller | Create a new vehicle listing |
| `/seller/vehicles/[id]/edit` | Seller | Edit an existing listing |
| `/admin` | Admin | Admin dashboard with overview stats |
| `/admin/vehicles` | Admin | Review pending vehicle submissions |
| `/admin/requests` | Admin | Manage and verify buyer purchase requests |
| `/marketplace/[id]` | Public | Vehicle detail page for approved listings |
| `/marketplace/request/[id]` | Buyer | Request to purchase a vehicle |

### API Routes

| Endpoint | Methods | Description |
|---|---|---|
| `/api/marketplace/vehicles` | GET, POST | List vehicles (public/seller/admin scoped), create new |
| `/api/marketplace/vehicles/[id]` | GET, PUT, DELETE | Single vehicle CRUD |
| `/api/marketplace/vehicles/[id]/submit` | POST | Submit draft for review |
| `/api/marketplace/vehicles/[id]/approve` | POST | Admin approves a vehicle |
| `/api/marketplace/vehicles/[id]/reject` | POST | Admin rejects with reason |
| `/api/marketplace/requests` | GET, POST | List/create purchase requests |
| `/api/marketplace/requests/[id]` | GET | Single request with payments |
| `/api/marketplace/requests/[id]/verify` | POST | Admin verifies or cancels |
| `/api/marketplace/payments/create-intent` | POST | Create Stripe PaymentIntent |
| `/api/marketplace/payments/webhook` | POST | Stripe webhook handler |
| `/api/marketplace/notifications` | GET | List user notifications |
| `/api/marketplace/notifications/[id]/read` | POST | Mark notification(s) as read |

### Edge Function

| Function | Description |
|---|---|
| `stripe-webhook` | Supabase Edge Function handling Stripe webhook events (payment_intent.succeeded, payment_intent.payment_failed) |

---

## New Files

### Library / Utilities
- `src/lib/supabase/client.ts` - Browser-side Supabase client (anon key)
- `src/lib/supabase/server.ts` - Server-side Supabase client (service role key)
- `src/lib/marketplace/types.ts` - TypeScript interfaces for all marketplace entities
- `src/lib/marketplace/constants.ts` - Status labels, colors, default deposit amount
- `src/lib/marketplace/api-helpers.ts` - JWT extraction, auth checks, response helpers

### Hooks
- `src/hooks/useMarketplace.ts` - React Query hooks for all marketplace API operations

### Views
- `src/views/SellerDashboard.tsx` - Seller home with stats and vehicle management
- `src/views/SellerVehicleForm.tsx` - Vehicle creation/edit form
- `src/views/AdminDashboard.tsx` - Admin overview with quick actions
- `src/views/AdminVehicleReview.tsx` - Vehicle approval/rejection interface
- `src/views/AdminRequestManagement.tsx` - Request verification interface
- `src/views/BuyerRequestVehicle.tsx` - Buyer purchase request form
- `src/views/MarketplaceVehicleDetail.tsx` - Public vehicle detail page

### Components
- `src/components/marketplace/StatusBadge.tsx` - Vehicle and request status badges
- `src/components/marketplace/MarketplaceVehicleCard.tsx` - Vehicle card for listings
- `src/components/notifications/NotificationBell.tsx` - Header notification dropdown

---

## Modified Files

- `src/components/layout/Header.tsx` - Added role-based navigation (Seller, Admin links) and notification bell
- `src/views/VehicleListing.tsx` - Shows approved marketplace vehicles alongside existing API vehicles
- `tsconfig.json` - Excluded `supabase/` from TypeScript compilation

---

## Security

- RLS is enabled on all 6 new tables
- Anonymous users can only SELECT approved vehicles and their images
- All write operations go through API routes using the Supabase service role client
- JWT tokens from the existing auth system are verified in API route handlers
- Seller contact information is never exposed to public or buyer-facing queries
- Admin actions are logged to the `audit_logs` table
- Stripe webhooks verify signatures before processing

---

## Environment Variables Required

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (client-side) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `STRIPE_SECRET_KEY` | Stripe secret key (server-side only) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (server-side only) |

---

## How to Test

### Seller Flow
1. Log in as a user with the SELLER role
2. Navigate to `/seller` to see the seller dashboard
3. Click "Add New Vehicle" to create a listing
4. Fill in vehicle details and image URLs, save as draft
5. Submit the draft for review from the seller dashboard

### Admin Flow
1. Log in as a user with the ADMIN role
2. Navigate to `/admin` to see the admin dashboard
3. Go to `/admin/vehicles` to review pending submissions
4. Approve or reject vehicles (rejection requires a reason)
5. Go to `/admin/requests` to manage buyer purchase requests
6. Verify vehicle availability or cancel requests

### Buyer Flow
1. Browse approved marketplace vehicles at `/vehicles`
2. Click a marketplace vehicle to view details at `/marketplace/[id]`
3. Click "Request This Vehicle" to start a purchase request
4. Complete deposit payment through Stripe
5. Wait for admin verification
6. Complete final payment after admin confirms availability

### Notifications
1. All roles receive real-time notifications for relevant events
2. Click the bell icon in the header to view notifications
3. Notifications auto-refresh every 15 seconds (unread) / 30 seconds (all)
4. "Mark all read" clears unread indicators

### Stripe Webhooks
1. Configure the Stripe webhook endpoint to point to the deployed Supabase edge function
2. Events handled: `payment_intent.succeeded`, `payment_intent.payment_failed`
3. Successful payments automatically advance the request status and trigger notifications
