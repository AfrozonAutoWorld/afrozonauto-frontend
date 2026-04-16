import { UserRole } from '@/types';

const ADMIN_ROLES = new Set<UserRole>([
  UserRole.ADMIN,
  UserRole.OPERATIONS_ADMIN,
  UserRole.SUPER_ADMIN,
]);

/** Roles that can open the seller dashboard and seller-scoped APIs (matches middleware `/seller`). */
const SELLER_DASHBOARD_ROLES = new Set<UserRole>([
  UserRole.SELLER,
  ...ADMIN_ROLES,
]);

export function canUseSellerFeatures(user: { role?: UserRole } | undefined): boolean {
  return !!user?.role && SELLER_DASHBOARD_ROLES.has(user.role);
}

/**
 * Whether the user may create a new seller vehicle listing (UI + submit).
 * Admins bypass; sellers need approval (isSeller or sellerStatus APPROVED).
 */
export function canListSellerVehicles(user: { role?: UserRole; profile?: { isSeller?: boolean; sellerStatus?: string } } | undefined): boolean {
  if (!user) return false;
  if (user.role && ADMIN_ROLES.has(user.role)) return true;
  const p = user.profile;
  if (p?.isSeller === true) return true;
  if (p?.sellerStatus === 'APPROVED') return true;
  return false;
}
