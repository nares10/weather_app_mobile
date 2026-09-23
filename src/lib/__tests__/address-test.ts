import { formatAddress } from "@/lib/address";

describe("formatAddress", () => {
  it("joins the address parts", () => {
    expect(formatAddress("Dolpa", ["Karnali Pradesh", "Nepal"])).toBe("Karnali Pradesh, Nepal");
  });

  it("skips parts that just repeat the name", () => {
    expect(formatAddress("Jaipur", ["Jaipur district", "Rajasthan", "India"])).toBe("Rajasthan, India");
    expect(formatAddress("Tokyo", [undefined, "Tokyo", "Japan"])).toBe("Japan");
  });

  it("skips blank parts (reverse geocoding returns null for unknown fields)", () => {
    expect(formatAddress("Jaipur", [null, "", undefined, "India"])).toBe("India");
  });

  it("skips duplicates", () => {
    expect(formatAddress("Malviya Nagar", ["Delhi", "Delhi", "India"])).toBe("Delhi, India");
  });

  it("returns an empty string when nothing is left", () => {
    expect(formatAddress("Delhi", ["Delhi", null])).toBe("");
  });
});
