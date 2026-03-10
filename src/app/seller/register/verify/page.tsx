import { SellerRegisterVerify } from "@/views/seller/SellerRegisterVerify";
import { Suspense } from "react";

export default function SellerRegisterVerifyPage() {
  return (
    <Suspense fallback={null}>
      <SellerRegisterVerify />
    </Suspense>
  );
}
