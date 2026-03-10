"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, User, Lock, Phone, FileText, AlertCircle, CheckCircle, Upload, X } from "lucide-react";
import { sellerRegisterSchema, type SellerRegisterInput as SellerRegisterFormInput } from "@/lib/validation/seller.schema";
import type { SellerRegisterInput } from "@/lib/api/seller";
import { useSellerMutations } from "@/hooks/useSellerMutations";

const DOCUMENT_OPTIONS = [
  { value: "businessRegistration", label: "Business registration" },
  { value: "vendorNIN", label: "Vendor NIN / ID" },
  { value: "taxDocument", label: "Tax document" },
  { value: "idDocument", label: "Government ID" },
  { value: "other", label: "Other verification document" },
];

type DocumentRow = { id: string; file: File | null; documentName: string };

export function SellerRegisterComplete() {
  const router = useRouter();
  const { register, SELLER_VERIFIED_KEY } = useSellerMutations();
  const [formData, setFormData] = useState<Partial<SellerRegisterFormInput>>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    businessName: "",
    taxId: "",
    identificationNumber: "",
    identificationType: "",
    documents: [],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fileInputs, setFileInputs] = useState<DocumentRow[]>([
    { id: "doc-0", file: null, documentName: "" },
  ]);

  useEffect(() => {
    const stored = typeof globalThis.window !== "undefined" ? sessionStorage.getItem(SELLER_VERIFIED_KEY) : null;
    if (!stored) {
      router.replace("/seller/register");
      return;
    }
    setFormData((prev) => ({ ...prev, email: stored }));
  }, [router, SELLER_VERIFIED_KEY]);

  const getValidDocs = () =>
    fileInputs.filter((d) => d.file instanceof File && d.documentName.trim() !== "") as {
      file: File;
      documentName: string;
    }[];

  const validateForm = () => {
    const docs = getValidDocs();
    const toValidate = {
      ...formData,
      confirmPassword: formData.confirmPassword,
      documents: docs,
    };
    try {
      sellerRegisterSchema.parse(toValidate);
      setErrors({});
      return true;
    } catch (err: unknown) {
      const e = err as { errors?: { path: (string | number)[]; message: string }[] };
      const fieldErrors: Partial<Record<string, string>> = {};
      e.errors?.forEach((item) => {
        const key = String(item.path[0]);
        if (key) fieldErrors[key] = item.message;
      });
      setErrors(fieldErrors);
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const addDocument = () => {
    setFileInputs((prev) => [
      ...prev,
      { id: `doc-${Date.now()}-${prev.length}`, file: null, documentName: "" },
    ]);
  };

  const setDocumentAt = (index: number, field: "file" | "documentName", value: File | string | null) => {
    setFileInputs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    if (errors.documents) setErrors((prev) => ({ ...prev, documents: undefined }));
  };

  const removeDocument = (index: number) => {
    setFileInputs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const docs = getValidDocs();
    if (docs.length === 0) {
      setErrors((prev) => ({ ...prev, documents: "Upload at least one verification document" }));
      return;
    }
    const payload: SellerRegisterInput = {
      email: formData.email!,
      password: formData.password!,
      firstName: formData.firstName!,
      lastName: formData.lastName!,
      phone: formData.phone || undefined,
      businessName: formData.businessName || undefined,
      taxId: formData.taxId || undefined,
      identificationNumber: formData.identificationNumber || undefined,
      identificationType: formData.identificationType || undefined,
      documents: docs,
    };
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setErrors((prev) => ({ ...prev, email: "All required fields must be filled" }));
      return;
    }
    if (!validateForm()) return;
    setLoading(true);
    try {
      await register.mutateAsync(payload);
      setSuccess(true);
    } catch {
      // Error in hook
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application submitted</h2>
          <p className="text-gray-600 mb-4">
            Your seller account is pending verification. You can log in and will be notified once approved.
          </p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <Link href="/seller/landing" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Store className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">Afrozon</span>
              <span className="text-2xl font-light text-emerald-400"> Seller</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Complete your seller profile</h1>
          <p className="text-gray-400">Personal details and verification documents</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${errors.firstName ? "border-red-300" : "border-gray-300"}`}
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${errors.lastName ? "border-red-300" : "border-gray-300"}`}
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                readOnly
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${errors.password ? "border-red-300" : "border-gray-300"}`}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm password *</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${errors.confirmPassword ? "border-red-300" : "border-gray-300"}`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="showPassword" className="text-sm text-gray-600">Show passwords</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${errors.phone ? "border-red-300" : "border-gray-300"}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business name (optional)</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Acme Motors"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID (optional)</label>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                  placeholder="EIN / Tax ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID number (optional)</label>
                <input
                  type="text"
                  name="identificationNumber"
                  value={formData.identificationNumber}
                  onChange={handleChange}
                  placeholder="Identification number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID type (optional)</label>
                <input
                  type="text"
                  name="identificationType"
                  value={formData.identificationType}
                  onChange={handleChange}
                  placeholder="e.g. Passport, Driver's license"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  <FileText className="inline w-4 h-4 mr-1" /> Verification documents *
                </label>
                <button
                  type="button"
                  onClick={addDocument}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                >
                  <Upload className="w-4 h-4" /> Add document
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                Upload at least one document (e.g. business registration, ID, tax document). Max 5MB per file.
              </p>
              {errors.documents && (
                <div className="flex items-center gap-2 mb-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errors.documents}</span>
                </div>
              )}
              <div className="space-y-3">
                {fileInputs.map((doc, index) => (
                  <div
                    key={doc.id}
                    className="flex flex-wrap items-center gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <select
                      value={doc.documentName}
                      onChange={(e) => setDocumentAt(index, "documentName", e.target.value)}
                      className="flex-1 min-w-[140px] px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Select type</option>
                      {DOCUMENT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setDocumentAt(index, "file", file);
                      }}
                      className="flex-1 min-w-[120px] text-sm text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-emerald-50 file:text-emerald-700"
                    />
                    {doc.file && (
                      <span className="text-xs text-gray-500 truncate max-w-[120px]">
                        {doc.file.name}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                      aria-label="Remove document"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || getValidDocs().length === 0}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit application"
              )}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-600 font-medium hover:text-emerald-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
