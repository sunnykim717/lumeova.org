/**
 * Version tag for the current draft of the privacy policy at /privacy.
 *
 * Stored alongside every privacy_consents row so that, once the policy is
 * legally finalized and this string changes, past consents remain traceable
 * to the exact version of the policy the person actually agreed to.
 *
 * TODO: bump this (e.g. "2026-10-final") once legal review is complete and
 * /privacy reflects the finalized policy, and once more is true — the
 * consent purposes/retention text below is still a structural draft.
 */
export const PRIVACY_POLICY_VERSION = "2026-09-draft";
