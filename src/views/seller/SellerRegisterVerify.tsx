"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ChevronDown, FileText, UploadCloud } from "lucide-react";
import { useSellerMutations } from "@/hooks/useSellerMutations";
import { SELLER_REGISTER_AS, type SellerRegisterInput } from "@/lib/api/seller";

type IdentityType = "DRIVERS_LICENSE" | "INTERNATIONAL_PASSPORT" | "NATIONAL_ID";

type IdentityDocRule = {
  value: IdentityType;
  label: string;
  frontLabel: string;
  backLabel?: string;
};

const ID_RULES: IdentityDocRule[] = [
  {
    value: "DRIVERS_LICENSE",
    label: "Drivers License",
    frontLabel: "Upload Front of License",
    backLabel: "Upload Back of License",
  },
  {
    value: "INTERNATIONAL_PASSPORT",
    label: "International Passport",
    frontLabel: "Upload Bio-data Page",
  },
  {
    value: "NATIONAL_ID",
    label: "National ID",
    frontLabel: "Upload Front of ID",
    backLabel: "Upload Back of ID",
  },
];

function useImageObjectUrl(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return url;
}

type DocUploadSlotProps = {
  id: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  inputAccept?: string;
};

function DocumentUploadSlot({
  id,
  file,
  onFileChange,
  inputAccept = ".jpg,.jpeg,.png,.pdf",
}: Readonly<DocUploadSlotProps>) {
  const imageUrl = useImageObjectUrl(file);
  const isPdf = file?.type === "application/pdf";

  return (
    <label
      htmlFor={id}
      className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-[#9CA3AF] bg-[#F9FAFB] p-3 text-center transition-colors hover:border-[#0D7A4A]/40 hover:bg-[#F3F4F6]"
    >
      {file ? (
        <div className="flex w-full flex-col items-center gap-2">
          {imageUrl ? (
            <div className="relative w-full max-h-[200px] min-h-[100px]">
              {/* eslint-disable-next-line @next/next/no-img-element -- user-selected local preview */}
              <img
                src={imageUrl}
                alt={`Preview of ${file.name}`}
                className="mx-auto max-h-[200px] w-full rounded-lg object-contain"
              />
            </div>
          ) : (
            <div className="flex w-full flex-col items-center gap-2 py-2">
              <FileText className="h-10 w-10 shrink-0 text-[#0D7A4A]" aria-hidden />
              <p className="max-w-full truncate px-1 font-body text-sm font-medium text-[#111827]">
                {file.name}
              </p>
              <p className="font-body text-xs text-[#6B7280]">
                {isPdf ? "PDF" : file.type || "File"} · Click to replace
              </p>
            </div>
          )}
          <span className="font-body text-xs font-medium text-[#0D7A4A]">
            Click to replace file
          </span>
        </div>
      ) : (
        <>
          <UploadCloud className="h-8 w-8 text-[#6B7280]" aria-hidden />
          <span className="font-body text-sm text-[#4B5563]">
            Click to upload or drag and drop
          </span>
        </>
      )}
      <input
        id={id}
        type="file"
        accept={inputAccept}
        className="sr-only"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}

export function SellerRegisterVerify() {
  const router = useRouter();
  const { register, SELLER_SIGNUP_DRAFT_KEY } = useSellerMutations();
  const [draft, setDraft] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    existingAccount?: boolean;
  } | null>(null);
  const [identificationType, setIdentificationType] =
    useState<IdentityType>("DRIVERS_LICENSE");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const selectedRule = useMemo(
    () => ID_RULES.find((rule) => rule.value === identificationType) ?? ID_RULES[0],
    [identificationType],
  );
  const requiresBack = selectedRule.backLabel != null;

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? sessionStorage.getItem(SELLER_SIGNUP_DRAFT_KEY)
        : null;
    if (!stored) {
      router.push("/seller/register");
      return;
    }
    try {
      const parsed = JSON.parse(stored) as {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        password: string;
        existingAccount?: boolean;
      };
      setDraft(parsed);
    } catch {
      router.push("/seller/register");
    }
  }, [router, SELLER_SIGNUP_DRAFT_KEY]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!frontFile) next.front = "Please upload the required document";
    if (requiresBack && !backFile) next.back = "Please upload the back document";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft || !validate()) return;

    const docs: { file: File; documentName: string }[] = [
      { file: frontFile!, documentName: `${identificationType.toLowerCase()}_front` },
    ];
    if (requiresBack && backFile) {
      docs.push({
        file: backFile,
        documentName: `${identificationType.toLowerCase()}_back`,
      });
    }

    const payload: SellerRegisterInput = {
      email: draft.email,
      password: draft.password,
      firstName: draft.firstName,
      lastName: draft.lastName,
      phone: draft.phone,
      registerAs: SELLER_REGISTER_AS,
      identificationType,
      documents: docs,
    };

    setLoading(true);
    try {
      await register.mutateAsync(payload);
      router.push("/seller/register/complete");
    } catch {
      // handled via mutation toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <h1 className="font-sans text-[48px] font-bold leading-[60px] text-[#111827]">
        Verify your Identity
      </h1>
      <p className="mt-1 font-body text-xl text-[#B8B8B8]">
        To keep our marketplace safe and ensure smooth payouts, please select
        and upload a valid government-issued ID.
      </p>

      <div className="my-6 h-px w-full bg-[#E5E7EB]" />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="seller-kyc-id-type"
            className="mb-2 block font-body text-sm font-medium text-[#111827]"
          >
            ID Type
          </label>
          <div className="relative">
            <select
              id="seller-kyc-id-type"
              value={identificationType}
              onChange={(e) =>
                setIdentificationType(e.target.value as IdentityType)
              }
              className="h-11 w-full appearance-none rounded-lg border border-[#E5E7EB] px-3.5 pr-10 font-body text-base text-[#111827]"
            >
              {ID_RULES.map((rule) => (
                <option key={rule.value} value={rule.value}>
                  {rule.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          </div>
          <p className="mt-2 font-body text-xs text-[#6B7280]">
            File size must not exceed 10MB in JPG, PNG, or PDF formats
          </p>
        </div>

        <div className={`grid gap-4 ${requiresBack ? "sm:grid-cols-2" : "grid-cols-1"}`}>
          <div>
            <span className="mb-2 block font-body text-sm font-medium text-[#111827]">
              {selectedRule.frontLabel}
            </span>
            <DocumentUploadSlot
              id="seller-kyc-front"
              file={frontFile}
              onFileChange={setFrontFile}
            />
            {errors.front && (
              <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.front}</span>
              </div>
            )}
          </div>

          {requiresBack && (
            <div>
              <span className="mb-2 block font-body text-sm font-medium text-[#111827]">
                {selectedRule.backLabel}
              </span>
              <DocumentUploadSlot
                id="seller-kyc-back"
                file={backFile}
                onFileChange={setBackFile}
              />
              {errors.back && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.back}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !draft}
          className="h-12 w-full rounded-lg bg-[#0D7A4A] font-body text-xl font-medium text-white transition-colors hover:bg-[#0a633e] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Document for Verification"}
        </button>
      </form>

      <p className="mt-4 text-center font-body text-sm text-[#B8B8B8]">
        Your information is securely encrypted and used strictly for
        verification purposes.
      </p>

      <p className="mt-3 text-center font-body text-xs text-[#6B7280]">
        Need to edit account details?{" "}
        <Link href="/seller/register" className="text-[#0D7A4A] hover:text-[#0a633e]">
          Go back
        </Link>
      </p>
    </div>
  );
}
