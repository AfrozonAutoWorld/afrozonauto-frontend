import { UserRole } from "@/types";

/**
 * Roles that see seller dashboard entry points in the main nav (Header).
 * Matches backend `UserRole` — includes ops/super admins who may review seller areas.
 */
const ROLES_WITH_SELLER_NAV: readonly string[] = [
  UserRole.SELLER,
  UserRole.ADMIN,
  UserRole.OPERATIONS_ADMIN,
  UserRole.SUPER_ADMIN,
];

/**
 * Seller dashboard and seller-scoped APIs are gated by account role only.
 * Do not also require profile.isSeller — a user can be role SELLER while
 * isSeller is false and sellerStatus is PENDING (awaiting verification).
 */
export function canUseSellerFeatures(
  user: { role?: string } | null | undefined,
): boolean {
  const r = user?.role;
  return r != null && ROLES_WITH_SELLER_NAV.includes(r);
}
