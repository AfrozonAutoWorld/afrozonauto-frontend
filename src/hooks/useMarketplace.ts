import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  MarketplaceVehicle,
  VehicleRequest,
  Notification,
  VehicleFormData,
} from "@/lib/marketplace/types";
import { useSession } from "next-auth/react";

function getHeaders() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { ...getHeaders(), ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function useMarketplaceVehicles(
  scope?: "seller" | "admin",
  status?: string,
) {
  const params = new URLSearchParams();
  if (scope) params.set("scope", scope);
  if (status) params.set("status", status);

  return useQuery<MarketplaceVehicle[]>({
    queryKey: ["marketplace-vehicles", scope, status],
    queryFn: () => apiFetch(`/api/marketplace/vehicles?${params}`),
  });
}

export function useMarketplaceVehicle(id: string) {
  return useQuery<MarketplaceVehicle>({
    queryKey: ["marketplace-vehicle", id],
    queryFn: () => apiFetch(`/api/marketplace/vehicles/${id}`),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: VehicleFormData) =>
      apiFetch<MarketplaceVehicle>("/api/marketplace/vehicles", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace-vehicles"] });
    },
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<VehicleFormData>;
    }) =>
      apiFetch<MarketplaceVehicle>(`/api/marketplace/vehicles/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["marketplace-vehicles"] });
      qc.invalidateQueries({ queryKey: ["marketplace-vehicle", id] });
    },
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/marketplace/vehicles/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace-vehicles"] });
    },
  });
}

export function useSubmitVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/marketplace/vehicles/${id}/submit`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace-vehicles"] });
    },
  });
}

export function useApproveVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/marketplace/vehicles/${id}/approve`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace-vehicles"] });
    },
  });
}

export function useRejectVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiFetch(`/api/marketplace/vehicles/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace-vehicles"] });
    },
  });
}

export function useVehicleRequests(scope?: "admin", status?: string) {
  const params = new URLSearchParams();
  if (scope) params.set("scope", scope);
  if (status) params.set("status", status);

  return useQuery<VehicleRequest[]>({
    queryKey: ["vehicle-requests", scope, status],
    queryFn: () => apiFetch(`/api/marketplace/requests?${params}`),
  });
}

export function useVehicleRequest(id: string) {
  return useQuery<VehicleRequest>({
    queryKey: ["vehicle-request", id],
    queryFn: () => apiFetch(`/api/marketplace/requests/${id}`),
    enabled: !!id,
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { vehicle_id: string; notes?: string }) =>
      apiFetch<VehicleRequest>("/api/marketplace/requests", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicle-requests"] });
    },
  });
}

export function useVerifyRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: string;
      action: "verify" | "cancel";
      reason?: string;
    }) =>
      apiFetch(`/api/marketplace/requests/${id}/verify`, {
        method: "POST",
        body: JSON.stringify({ action, reason }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicle-requests"] });
    },
  });
}

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (data: {
      request_id: string;
      payment_type: "DEPOSIT" | "FINAL";
    }) =>
      apiFetch<{ client_secret: string; payment_intent_id: string }>(
        "/api/marketplace/payments/create-intent",
        { method: "POST", body: JSON.stringify(data) },
      ),
  });
}

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => apiFetch("/api/marketplace/notifications"),
    refetchInterval: 30000,
  });
}

export function useUnreadNotifications() {
  return useQuery<Notification[]>({
    queryKey: ["notifications", "unread"],
    queryFn: () => apiFetch("/api/marketplace/notifications?unread=true"),
    refetchInterval: 15000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/marketplace/notifications/${id}/read`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
