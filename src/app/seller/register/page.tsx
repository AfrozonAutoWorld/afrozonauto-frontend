import { SellerRegisterStart } from "@/views/seller/SellerRegisterStart";
import { Suspense } from "react";

export default function SellerRegisterPage() {
  return (
    <Suspense fallback={null}>
      <SellerRegisterStart />
    </Suspense>
  );
}
