"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Clock3, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSellerMutations } from "@/hooks/useSellerMutations";

export function SellerRegisterComplete() {
  const router = useRouter();
  const { data: session } = useSession();
  const { SELLER_SIGNUP_DRAFT_KEY } = useSellerMutations();
  const sellerStatus = session?.user?.profile?.sellerStatus;
  const rejectedReason =
    (session?.user?.profile as { sellerRejectedReason?: string } | undefined)
      ?.sellerRejectedReason ?? null;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasDraft = sessionStorage.getItem(SELLER_SIGNUP_DRAFT_KEY);
      if (!hasDraft && !session?.user) {
        router.replace("/seller/register");
      }
    }
  }, [router, SELLER_SIGNUP_DRAFT_KEY, session?.user]);

  const statusText =
    sellerStatus === "APPROVED"
      ? "Approved"
      : sellerStatus === "REJECTED"
        ? "Needs your action"
        : "Pending review";

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <div className="mb-8 flex justify-center">
        <img
          src="/noise_image.png"
          alt=""
          className="h-32 w-40 rounded-xl object-cover opacity-90"
          aria-hidden
        />
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E6F6F4]">
          {sellerStatus === "APPROVED" ? (
            <CheckCircle2 className="h-7 w-7 text-[#0D7A4A]" />
          ) : sellerStatus === "REJECTED" ? (
            <AlertTriangle className="h-7 w-7 text-[#E3863B]" />
          ) : (
            <Clock3 className="h-7 w-7 text-[#0D7A4A]" />
          )}
        </div>

        <h1 className="text-center font-sans text-4xl font-bold leading-tight text-[#111827]">
          Verification Status
        </h1>
        <p className="mt-2 text-center font-body text-lg text-[#6B7280]">
          Your seller profile has been submitted and is currently{" "}
          <span className="font-semibold text-[#111827]">{statusText}</span>.
        </p>

        {sellerStatus === "REJECTED" && (
          <div className="mt-5 rounded-xl border border-[#FDE7D5] bg-[#FCF4ED] p-4">
            <p className="font-body text-sm font-semibold text-[#B96B2F]">
              Admin feedback
            </p>
            <p className="mt-1 font-body text-sm text-[#B96B2F]">
              {rejectedReason ||
                "A new or clearer document is required. Please resubmit your verification files."}
            </p>
            <Link
              href="/seller/register/verify"
              className="mt-3 inline-flex rounded-lg bg-[#0D7A4A] px-4 py-2 font-body text-sm font-medium text-white hover:bg-[#0a633e]"
            >
              Re-submit documents
            </Link>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/login?as=seller"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#0D7A4A] font-body text-base font-medium text-white hover:bg-[#0a633e]"
          >
            Sign in to Seller Dashboard
          </Link>
          <Link
            href="/seller/landing"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#E5E7EB] font-body text-base font-medium text-[#111827] hover:bg-gray-50"
          >
            Back to Seller Landing
          </Link>
        </div>
      </div>

      <p className="mt-4 text-center font-body text-sm text-[#9CA3AF]">
        You can revisit this page anytime to track verification progress.
      </p>

      {session?.user?.role === "SELLER" && (
        <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#0D7A4A]" />
            <p className="font-body text-sm font-medium text-[#111827]">
              Live seller verification state
            </p>
          </div>
          <p className="mt-1 font-body text-sm text-[#6B7280]">
            Status:{" "}
            <span className="font-semibold text-[#111827]">
              {sellerStatus || "PENDING"}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
