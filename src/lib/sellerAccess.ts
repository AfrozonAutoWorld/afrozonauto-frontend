/**
 * Seller dashboard and seller-scoped APIs are gated by account role only.
 * Do not also require profile.isSeller — a user can be role SELLER while
 * isSeller is false and sellerStatus is PENDING (awaiting verification).
 */
export function canUseSellerFeatures(
  user: { role?: string } | null | undefined,
): boolean {
  const r = user?.role;
  return r === 'SELLER' || r === 'ADMIN' || r === 'SUPER_ADMIN';
}
