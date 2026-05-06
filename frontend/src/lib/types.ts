export interface User {
  id: number;
  email: string;
}

export interface PartyInfo {
  printName: string;
  title: string;
  company: string;
  noticeAddress: string;
  date: string;
}

export interface NDAFormData {
  purpose: string;
  effectiveDate: string;
  mndaTermType: "expires" | "continues";
  mndaTermYears: string;
  confidentialityTermType: "expires" | "perpetuity";
  confidentialityTermYears: string;
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
  party1: PartyInfo;
  party2: PartyInfo;
}

export function createDefaultFormData(): NDAFormData {
  return {
    purpose: "Evaluating whether to enter into a business relationship with the other party.",
    effectiveDate: new Date().toISOString().split("T")[0],
    mndaTermType: "expires",
    mndaTermYears: "1",
    confidentialityTermType: "expires",
    confidentialityTermYears: "1",
    governingLaw: "",
    jurisdiction: "",
    modifications: "",
    party1: { printName: "", title: "", company: "", noticeAddress: "", date: "" },
    party2: { printName: "", title: "", company: "", noticeAddress: "", date: "" },
  };
}
