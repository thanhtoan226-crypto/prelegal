export const DOC_TYPES = [
  "mutual-nda",
  "csa",
  "design-partner-agreement",
  "sla",
  "psa",
  "dpa",
  "software-license-agreement",
  "partnership-agreement",
  "pilot-agreement",
  "baa",
  "ai-addendum",
] as const;

export type DocType = (typeof DOC_TYPES)[number];
