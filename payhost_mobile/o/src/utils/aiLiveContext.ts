import axiosClient from "../api/axiosClient";

type LimitValue = number | string | null | undefined;

type LimitsResponse = {
  tier?: unknown;
  daily_send_ngn?: LimitValue;
  daily_limit?: LimitValue;
  daily_send_limit?: LimitValue;
  single_send_ngn?: LimitValue;
  per_send_limit?: LimitValue;
  remaining_today?: LimitValue;
  limits?: {
    tier?: unknown;
    daily_send_ngn?: LimitValue;
    daily_limit?: LimitValue;
    daily_send_limit?: LimitValue;
    single_send_ngn?: LimitValue;
    per_send_limit?: LimitValue;
    remaining_today?: LimitValue;
  };
};

type ProfileResponse = {
  is_frozen?: unknown;
};

function safeAmount(value: LimitValue): string {
  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0 ? String(value) : "—";
  }

  if (typeof value === "string" && /^\d+(?:\.\d+)?$/.test(value.trim())) {
    return value.trim();
  }

  return "—";
}

function safeTier(value: unknown): string {
  if (typeof value !== "string" && typeof value !== "number") return "unknown";

  const tier = String(value).trim();
  return /^[a-z0-9 _-]{1,32}$/i.test(tier) ? tier : "unknown";
}

export async function getLiveContext(): Promise<string> {
  try {
    const [limitsRes, profileRes] = await Promise.all([
      axiosClient.get<LimitsResponse>("limits/"),
      axiosClient.get<ProfileResponse>("profile/"),
    ]);
    const limits = limitsRes.data;
    const nestedLimits = limits.limits;
    const frozen =
      typeof profileRes.data.is_frozen === "boolean"
        ? profileRes.data.is_frozen
          ? "yes"
          : "no"
        : "unknown";

    return `Current account summary (for this question only):
- Tier: ${safeTier(limits.tier ?? nestedLimits?.tier)}
- Daily send limit: ₦${safeAmount(
      limits.daily_send_ngn ??
        limits.daily_limit ??
        limits.daily_send_limit ??
        nestedLimits?.daily_send_ngn ??
        nestedLimits?.daily_limit ??
        nestedLimits?.daily_send_limit
    )}
- Per-send limit: ₦${safeAmount(
      limits.single_send_ngn ??
        limits.per_send_limit ??
        nestedLimits?.single_send_ngn ??
        nestedLimits?.per_send_limit
    )}
- Remaining today: ₦${safeAmount(
      limits.remaining_today ?? nestedLimits?.remaining_today
    )}
- Wallet frozen: ${frozen}`;
  } catch {
    console.warn("Live account data is temporarily unavailable.");
    return "Live account data is temporarily unavailable.";
  }
}
