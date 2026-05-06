import { mergeFields } from "@/lib/chat";
import { NDAFormData, createDefaultFormData } from "@/lib/types";

describe("mergeFields", () => {
  it("merges top-level fields", () => {
    const base = createDefaultFormData();
    const result = mergeFields(base, { purpose: "New purpose" });
    expect(result.purpose).toBe("New purpose");
    expect(result.governingLaw).toBe(base.governingLaw);
  });

  it("ignores null values", () => {
    const base = createDefaultFormData();
    base.governingLaw = "Delaware";
    const result = mergeFields(base, { governingLaw: null, purpose: null });
    expect(result.governingLaw).toBe("Delaware");
  });

  it("ignores undefined values", () => {
    const base = createDefaultFormData();
    base.purpose = "Existing";
    const result = mergeFields(base, { purpose: undefined });
    expect(result.purpose).toBe("Existing");
  });

  it("merges party objects partially", () => {
    const base = createDefaultFormData();
    base.party1 = { printName: "John", title: "CEO", company: "Old Corp", noticeAddress: "", date: "" };
    const result = mergeFields(base, {
      party1: { company: "New Corp" },
    });
    expect(result.party1.company).toBe("New Corp");
    expect(result.party1.printName).toBe("John");
    expect(result.party1.title).toBe("CEO");
  });

  it("merges both parties independently", () => {
    const base = createDefaultFormData();
    const result = mergeFields(base, {
      party1: { company: "Corp A" },
      party2: { company: "Corp B" },
    });
    expect(result.party1.company).toBe("Corp A");
    expect(result.party2.company).toBe("Corp B");
  });

  it("does not mutate the original", () => {
    const base = createDefaultFormData();
    const originalPurpose = base.purpose;
    mergeFields(base, { purpose: "Changed" });
    expect(base.purpose).toBe(originalPurpose);
  });
});
