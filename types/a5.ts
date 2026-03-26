/**
 * A5 shared type contracts.
 * All PII-carrying fields use opaque strings — no plain-text sensitive data
 * is typed as anything that would encourage logging or storage outside
 * a secure server boundary.
 */

// ─── Auth / Account ──────────────────────────────────────────────────────────

export interface SessionUser {
  clerkUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

// ─── Saved Vehicles ──────────────────────────────────────────────────────────

export interface SavedVehicleRecord {
  clerkUserId: string;
  vehicleId: string;
  vehicleSlug: string;
  savedAt: string; // ISO 8601
}

export interface SavedVehiclePayload {
  vehicleId: string;
  vehicleSlug: string;
}

// ─── Purchase / Deposit ──────────────────────────────────────────────────────

export interface DepositIntentRequest {
  vehicleId: string;
  vehicleSlug: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehiclePriceCad: number;
  /** Clerk userId — server-resolved from session, never from client payload */
  clerkUserId: string;
}

export interface DepositIntentResult {
  sessionId: string;
  publishableKey: string;
  vehicleId: string;
  amountCents: number;
}

// ─── Finance Submission ──────────────────────────────────────────────────────

/**
 * Finance application submission.
 * Sensitive PII fields are typed as string with no default.
 * This type must only be instantiated in server-side API route handlers.
 * It must never be stored in plain text — relay to RouteOne/Dealertrack only.
 */
export interface FinanceApplicationPayload {
  // Vehicle context — from Postgres, not from client
  vehicleId: string;
  vehicleSlug: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePriceCad: number;

  // Applicant — PII, server-only
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Finance parameters — validated server-side
  downPaymentCad: number;
  termMonths: number;

  // Clerk userId if signed in, otherwise null
  clerkUserId: string | null;
}

export type FinanceSubmissionStatus =
  | 'accepted'       // relayed to lender
  | 'queued'         // saved for manual submission (feature flag off)
  | 'failed'         // relay error
  | 'invalid';       // validation failure

export interface FinanceSubmissionResult {
  status: FinanceSubmissionStatus;
  referenceId?: string;
  message?: string;
}

// ─── CRM / AutoRaptor ────────────────────────────────────────────────────────

export type CrmEventType =
  | 'soft_lead'
  | 'finance_lead'
  | 'purchase_deposit'
  | 'vehicle_view';

export interface CrmEventPayload {
  eventType: CrmEventType;
  vehicleId: string;
  vehicleSlug: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  clerkUserId?: string;
  occurredAt: string; // ISO 8601
  meta?: Record<string, string | number | boolean>;
}

export type CrmDispatchStatus = 'sent' | 'queued' | 'disabled' | 'error';

export interface CrmDispatchResult {
  status: CrmDispatchStatus;
  eventType: CrmEventType;
  referenceId?: string;
  error?: string;
}

// ─── Social Proof / Vehicle Views ────────────────────────────────────────────

export interface VehicleViewIngestionPayload {
  vehicleId: string;
  vehicleSlug: string;
  /** Hashed or anonymized session identifier — never raw IP or PII */
  sessionToken: string;
}

export interface VehicleViewCount {
  vehicleId: string;
  viewCount24h: number;
  /** Honest label to display — never "X people viewing now" */
  displayLabel: string;
}

// ─── Webhook ─────────────────────────────────────────────────────────────────

export type WebhookNamespace =
  | 'clerk'
  | 'stripe'
  | 'autoraptor'
  | 'dealertrack'
  | 'routeone'
  | 'sanity';

export type WebhookStatus = 'active' | 'stub';

export interface WebhookBoundaryMeta {
  namespace: WebhookNamespace;
  status: WebhookStatus;
  handledEvents: string[];
  notes: string;
}
