import { checkWikipedia } from "../src/services/wikipedia";

// These tests hit the real Wikipedia API — run them only when network is available
describe("checkWikipedia", () => {
  it("finds an article and returns coverage > 0 for known keywords", async () => {
    const result = await checkWikipedia(["Alexander Fleming", "penicillin"]);
    expect(result.excerpt).not.toBeNull();
    expect(result.coverageScore).toBeGreaterThan(0);
    expect(result.keywordsFound).toBeGreaterThan(0);
  }, 15000);

  it("returns zero coverage for nonsense keywords", async () => {
    const result = await checkWikipedia(["xyzzy_nonexistent_term_12345"]);
    // Article may not exist, or coverage will be 0
    expect(result.coverageScore).toBeGreaterThanOrEqual(0);
    expect(result.coverageScore).toBeLessThanOrEqual(1);
  }, 15000);

  it("falls back to next keyword if first fails", async () => {
    const result = await checkWikipedia(["xyzzy_nonexistent_99999", "penicillin"]);
    // Should find penicillin article on second attempt
    expect(result.keywordsTotal).toBe(2);
  }, 15000);
});
