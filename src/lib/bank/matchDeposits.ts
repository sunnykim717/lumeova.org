/**
 * Candidate grading for unmatched bank deposits (design §5.1.2).
 *
 * Pure function: no database access and no writes. The result is a
 * suggestion for a person to confirm. Nothing here confirms a payment.
 *
 *   strong  exactly one open donation fits this deposit on amount, depositor
 *           name and date window, and that donation fits no other deposit.
 *   review  at least one open donation matches on amount or on name. A
 *           person picks the donation.
 *   none    nothing matches.
 */

export type OpenDonation = {
  id: string;
  amount: number;
  createdAt: string;
  depositorName: string | null;
};

export type UnmatchedDeposit = {
  id: string;
  transactedAt: string;
  amount: number;
  counterpartyName: string | null;
};

export type MatchGrade = "strong" | "review" | "none";

export type DepositMatch = {
  transactionId: string;
  grade: MatchGrade;
  /** Set only for "strong". */
  donationId: string | null;
  /** Donations a person may choose from (for "review" and "strong"). */
  candidateDonationIds: string[];
};

/** Applications are matched for this many days after they were submitted. */
export const MATCH_WINDOW_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

/** NFKC, drop bracketed notes and whitespace, case-fold. Exact match only. */
export function normalizeName(name: string | null | undefined): string {
  if (!name) return "";
  return name
    .normalize("NFKC")
    .replace(/\([^)]*\)|\[[^\]]*\]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function withinWindow(depositIso: string, applicationIso: string): boolean {
  const deposit = Date.parse(depositIso);
  const applied = Date.parse(applicationIso);
  return deposit >= applied && deposit <= applied + MATCH_WINDOW_DAYS * DAY_MS;
}

export function matchDeposits(
  deposits: UnmatchedDeposit[],
  openDonations: OpenDonation[],
): DepositMatch[] {
  const nameOf = (d: UnmatchedDeposit) => normalizeName(d.counterpartyName);

  // A donation is "strong" for a deposit when all three conditions hold.
  const strongFor = (dep: UnmatchedDeposit, don: OpenDonation) => {
    const name = nameOf(dep);
    return (
      dep.amount === don.amount &&
      name !== "" &&
      name === normalizeName(don.depositorName) &&
      withinWindow(dep.transactedAt, don.createdAt)
    );
  };

  // How many deposits strongly fit each donation. Used to refuse ambiguity.
  const depositsPerDonation = new Map<string, number>();
  for (const dep of deposits) {
    for (const don of openDonations) {
      if (strongFor(dep, don)) {
        depositsPerDonation.set(don.id, (depositsPerDonation.get(don.id) ?? 0) + 1);
      }
    }
  }

  return deposits.map((dep) => {
    const strong = openDonations.filter((don) => strongFor(dep, don));
    const related = openDonations.filter(
      (don) =>
        don.amount === dep.amount ||
        (nameOf(dep) !== "" && nameOf(dep) === normalizeName(don.depositorName)),
    );

    if (strong.length === 1 && (depositsPerDonation.get(strong[0].id) ?? 0) === 1) {
      return {
        transactionId: dep.id,
        grade: "strong",
        donationId: strong[0].id,
        candidateDonationIds: [strong[0].id],
      };
    }

    if (related.length > 0) {
      return {
        transactionId: dep.id,
        grade: "review",
        donationId: null,
        candidateDonationIds: related.map((d) => d.id),
      };
    }

    return { transactionId: dep.id, grade: "none", donationId: null, candidateDonationIds: [] };
  });
}
