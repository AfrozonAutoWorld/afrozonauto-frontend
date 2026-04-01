"use client";

import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { showToast } from "@/lib/showNotification";

type WaitlistFormProps = {
  inputId: string;
};

export function WaitlistForm({ inputId }: Readonly<WaitlistFormProps>) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

    if (!isValidEmail) {
      setError("Enter a valid email address");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const waitlistKey = "service_waitlist_emails";
      const existing = globalThis.localStorage.getItem(waitlistKey);
      const parsed = existing ? (JSON.parse(existing) as string[]) : [];
      const normalized = trimmedEmail.toLowerCase();

      if (parsed.some((entry) => entry.toLowerCase() === normalized)) {
        showToast({
          type: "success",
          message: "You are already on the waitlist.",
        });
        setEmail("");
        return;
      }

      const updated = [trimmedEmail, ...parsed];
      globalThis.localStorage.setItem(waitlistKey, JSON.stringify(updated));

      await new Promise((resolve) => setTimeout(resolve, 250));
      showToast({
        type: "success",
        message: "You have joined the waitlist successfully.",
      });
      setEmail("");
    } catch {
      showToast({
        type: "error",
        message: "Unable to join waitlist right now. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="flex gap-2 items-center p-2 w-full bg-white rounded-2xl border border-white/30">
        <div className="flex flex-1 gap-2 items-center px-2">
          <Search className="h-4 w-4 text-[#9CA3AF]" />
          <input
            id={inputId}
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) setError("");
            }}
            placeholder="Enter your mail"
            className="h-10 w-full border-0 bg-transparent text-sm text-[#1A1A1A] outline-none placeholder:text-[#9CA3AF]"
            aria-invalid={!!error}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-10 items-center gap-1 rounded-lg bg-[#0D7A4A] px-4 text-sm font-medium text-white transition hover:bg-[#0b6840] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Joining..." : "Join the Waitlist"}
          {!isSubmitting && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-100">{error}</p>}
    </form>
  );
}
