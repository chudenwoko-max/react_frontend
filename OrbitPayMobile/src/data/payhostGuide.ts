export const PAYHOST_GUIDE = [
  {
    id: "getting-started",
    title: "Getting Started",
    content:
      "Log in with your username/email and password. Enable biometrics for faster unlock. Set a transfer PIN on first use. Complete KYC to raise your limits. New devices trigger a 1-hour payment hold that you can clear with “Verify to unlock now”.",
  },
  {
    id: "home",
    title: "Home",
    content:
      "Shows your balance, Payhost Insight (weekly spend), and quick actions: Send, Fund, Pay Merchant, Payhost Guide, Payhost AI. Tap any tile to open that feature.",
  },
  {
    id: "send",
    title: "Send Money",
    content:
      "Send to another Payhost user or a bank account. Enter amount, recipient, and PIN. Large amounts (≥ ₦50,000) need a fresh PIN token (created in the last 5 minutes). Velocity rules limit how many or how much you can send per hour. New-device hold blocks sends until cleared or 1 hour passes.",
  },
  {
    id: "bills",
    title: "Airtime & Bills",
    content:
      "Buy airtime, data, electricity, or cable. First-time high-value payment to a new biller/customer may require a fresh PIN token. Same new-device hold applies.",
  },
  {
    id: "merchant",
    title: "Pay Merchant",
    content:
      "Pay an approved business from your wallet. Same new-device hold and “Verify to unlock now” flow as Send.",
  },
  {
    id: "history",
    title: "History",
    content:
      "View all transactions. Available from the bottom tab. Receipts are emailed on success.",
  },
  {
    id: "kyc",
    title: "KYC & Limits",
    content:
      "Upgrade tier by submitting only the missing documents. Higher tiers raise daily and per-send limits. Limits are shown in the app and enforced by the server.",
  },
  {
    id: "security",
    title: "Security",
    content:
      "Lock wallet instantly from Profile (requires PIN). Unlock with email OTP + PIN. New-device hold, large-tx shield, and velocity rules protect your funds. Sessions can be reviewed under Menu.",
  },
  {
    id: "legal",
    title: "Legal",
    content:
      "Privacy Policy and Terms of use are available under Menu → Privacy & Terms. They open inside the app.",
  },
];

export function getGuideContext(): string {
  return PAYHOST_GUIDE.map((section) => `## ${section.title}\n${section.content}`).join(
    "\n\n"
  );
}

export function getGuideSystemPrompt(): string {
  return `You are Payhost AI. Answer only from the Payhost Guide below and general fintech knowledge that does not contradict it.
Never invent limits, fees, or security rules.
For account-specific questions (my limits, my tier, am I on hold), say you can check live data in a future update or direct the user to the relevant screen.

${getGuideContext()}`;
}
