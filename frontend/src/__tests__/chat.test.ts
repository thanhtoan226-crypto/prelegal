import { mergeFields } from "@/lib/chat";

describe("mergeFields", () => {
  it("merges top-level fields", () => {
    const base = { purpose: "Old purpose", governingLaw: "" };
    const result = mergeFields(base, { purpose: "New purpose" });
    expect(result.purpose).toBe("New purpose");
    expect(result.governingLaw).toBe("");
  });

  it("ignores null values", () => {
    const base = { governingLaw: "Delaware" };
    const result = mergeFields(base, { governingLaw: null, purpose: null });
    expect(result.governingLaw).toBe("Delaware");
  });

  it("ignores undefined values", () => {
    const base = { purpose: "Existing" };
    const result = mergeFields(base, { purpose: undefined });
    expect(result.purpose).toBe("Existing");
  });

  it("deep merges nested objects", () => {
    const base = { party1: { company: "Old Corp", printName: "John" } };
    const result = mergeFields(base, { party1: { company: "New Corp" } });
    expect(result.party1.company).toBe("New Corp");
    expect(result.party1.printName).toBe("John");
  });

  it("merges multiple nested keys independently", () => {
    const base = { party1: { company: "" }, party2: { company: "" } };
    const result = mergeFields(base, {
      party1: { company: "Corp A" },
      party2: { company: "Corp B" },
    });
    expect(result.party1.company).toBe("Corp A");
    expect(result.party2.company).toBe("Corp B");
  });

  it("does not mutate the original", () => {
    const base = { purpose: "Original" };
    mergeFields(base, { purpose: "Changed" });
    expect(base.purpose).toBe("Original");
  });
});
