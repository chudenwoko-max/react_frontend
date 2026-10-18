function hasHoldIndicator(value) {
  return /\b(?:payment|transaction|account)\b.{0,40}\bhold\b|\bhold\b.{0,40}\b(?:payment|transaction|account)\b/i.test(
    value.replace(/[_-]+/g, " ")
  );
}

export function isPaymentHoldError(error) {
  const data = error?.response?.data;
  if (!data || typeof data !== "object") {
    return typeof data === "string" && hasHoldIndicator(data);
  }

  if (data.payment_hold === true) return true;

  return [data.code, data.error_code, data.error, data.detail, data.message]
    .filter((value) => typeof value === "string")
    .some(hasHoldIndicator);
}
