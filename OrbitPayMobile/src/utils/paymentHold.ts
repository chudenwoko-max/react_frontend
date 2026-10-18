type PaymentHoldResponse = {
  code?: unknown;
  error_code?: unknown;
  error?: unknown;
  detail?: unknown;
  message?: unknown;
  payment_hold?: unknown;
};

function hasHoldIndicator(value: string): boolean {
  if (/\bnew device hold\b/i.test(value.replace(/[_-]+/g, " "))) return true;

  return /\b(?:payment|transaction|account)\b.{0,40}\bhold\b|\bhold\b.{0,40}\b(?:payment|transaction|account)\b/i.test(
    value.replace(/[_-]+/g, " ")
  );
}

export function isPaymentHoldError(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("response" in error)) {
    return false;
  }

  const response = error.response;
  if (!response || typeof response !== "object" || !("data" in response)) {
    return false;
  }

  const data = response.data;
  if (typeof data === "string") return hasHoldIndicator(data);
  if (!data || typeof data !== "object") return false;

  const payload = data as PaymentHoldResponse;
  if (payload.payment_hold === true) return true;

  return [payload.code, payload.error_code, payload.error, payload.detail, payload.message]
    .filter((value): value is string => typeof value === "string")
    .some(hasHoldIndicator);
}
