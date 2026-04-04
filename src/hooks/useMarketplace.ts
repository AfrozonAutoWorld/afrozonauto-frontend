import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  MarketplaceVehicle,
  VehicleRequest,
  Notification,
  VehicleFormData,
} from "@/lib/marketplace/types";
import { useSession } from "next-auth/react";
import { getPublicApiBaseUrl } from "@/lib/api/publicApiUrl";
import {
  mapSellerApiVehicleToMarketplace,
  type SellerListingVehicle,
} from "@/lib/marketplace/mapSellerVehicle";

export function useMarketplaceVehicles(
  scope?: "seller" | "admin",
  status?: string,
) {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const params = new URLSearchParams();
  if (scope) params.set("scope", scope);
  if (status) params.set("status", status);

  return useQuery<MarketplaceVehicle[]>({
    queryKey: ["marketplace-vehicles", scope, status],
    enabled: scope !== "seller" || !!session?.accessToken,
    queryFn: async () => {
      if (scope === "admin") {
        return [];
      }

      if (scope === "seller") {
        const base = getPublicApiBaseUrl();
        const res = await fetch(`${base}/seller-vehicles/me/listings`, {
          headers,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(
            (err && typeof err === "object" && "message" in err && typeof err.message === "string"
              ? err.message
              : null) || `HTTP ${res.status}`,
          );
        }
        const json = (await res.json()) as {
          data?: { data?: { listings?: unknown[] } };
        };
        const raw = json?.data?.data?.listings ?? [];
        return raw.map((row) => mapSellerApiVehicleToMarketplace(row as SellerListingVehicle));
      }

      const res = await fetch(`/api/marketplace/vehicles?${params}`, { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return res.json();
    },
  });
}

export function useMarketplaceVehicle(id: string) {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return useQuery<MarketplaceVehicle>({
    queryKey: ["marketplace-vehicle", id],
    queryFn: async () => {
      const res = await fetch(`/api/marketplace/vehicles/${id}`, { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return useMutation({
    mutationFn: async (data: VehicleFormData) => {
      const res = await fetch("/api/marketplace/vehicles", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return res.json() as Promise<MarketplaceVehicle>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace-vehicles"] });
    },
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<VehicleFormData>;
    }) => {
      const res = await fetch(`/api/marketplace/vehicles/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return res.json() as Promise<MarketplaceVehicle>;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["marketplace-vehicles"] });
      qc.invalidateQueries({ queryKey: ["marketplace-vehicle", id] });
    },
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return useMutation({
    mutationFn: async (id: string) => {
      const base = getPublicApiBaseUrl();
      const res = await fetch(`${base}/seller-vehicles/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(
          (err && typeof err === "object" && "message" in err && typeof err.message === "string"
            ? err.message
            : null) || `HTTP ${res.status}`,
        );
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace-vehicles"] });
    },
  });
}

export function useSubmitVehicle() {
  const qc = useQueryClient();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return useMutation({
    mutationFn: async (id: string) => {
      const base = getPublicApiBaseUrl();
      const res = await fetch(`${base}/seller-vehicles/${id}/resubmit`, {
        method: "POST",
        headers,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(
          (err && typeof err === "object" && "message" in err && typeof err.message === "string"
            ? err.message
            : null) || `HTTP ${res.status}`,
        );
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace-vehicles"] });
      qc.invalidateQueries({ queryKey: ["seller-listing-detail"] });
    },
  });
}

export function useApproveVehicle() {
  const qc = useQueryClient();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/marketplace/vehicles/${id}/approve`, {
        method: "POST",
        headers,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace-vehicles"] });
    },
  });
}

export function useRejectVehicle() {
  const qc = useQueryClient();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await fetch(`/api/marketplace/vehicles/${id}/reject`, {
        method: "POST",
        headers,
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace-vehicles"] });
    },
  });
}

export function useVehicleRequests(scope?: "admin", status?: string) {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const params = new URLSearchParams();
  if (scope) params.set("scope", scope);
  if (status) params.set("status", status);

  return useQuery<VehicleRequest[]>({
    queryKey: ["vehicle-requests", scope, status],
    queryFn: async () => {
      const res = await fetch(`/api/marketplace/requests?${params}`, { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return res.json();
    },
  });
}

export function useVehicleRequest(id: string) {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return useQuery<VehicleRequest>({
    queryKey: ["vehicle-request", id],
    queryFn: async () => {
      const res = await fetch(`/api/marketplace/requests/${id}`, { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return useMutation({
    mutationFn: async (data: { vehicle_id: string; notes?: string }) => {
      const res = await fetch("/api/marketplace/requests", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return res.json() as Promise<VehicleRequest>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicle-requests"] });
    },
  });
}

export function useVerifyRequest() {
  const qc = useQueryClient();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return useMutation({
    mutationFn: async ({
      id,
      action,
      reason,
    }: {
      id: string;
      action: "verify" | "cancel";
      reason?: string;
    }) => {
      const res = await fetch(`/api/marketplace/requests/${id}/verify`, {
        method: "POST",
        headers,
        body: JSON.stringify({ action, reason }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicle-requests"] });
    },
  });
}

export function useCreatePaymentIntent() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return useMutation({
    mutationFn: async (data: {
      request_id: string;
      payment_type: "DEPOSIT" | "FINAL";
    }) => {
      const res = await fetch("/api/marketplace/payments/create-intent", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return res.json() as Promise<{ client_secret: string; payment_intent_id: string }>;
    },
  });
}

export function useNotifications() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/marketplace/notifications", { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return res.json();
    },
    refetchInterval: 30000,
  });
}

export function useUnreadNotifications() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return useQuery<Notification[]>({
    queryKey: ["notifications", "unread"],
    queryFn: async () => {
      const res = await fetch("/api/marketplace/notifications?unread=true", { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return res.json();
    },
    refetchInterval: 15000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/marketplace/notifications/${id}/read`, {
        method: "POST",
        headers,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
