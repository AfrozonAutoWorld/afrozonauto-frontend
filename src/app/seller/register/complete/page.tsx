import { SellerRegisterComplete } from "@/views/seller/SellerRegisterComplete";
import { Suspense } from "react";

export default function SellerRegisterCompletePage() {
  return (
    <Suspense fallback={null}>
      <SellerRegisterComplete />
    </Suspense>
  );
}
