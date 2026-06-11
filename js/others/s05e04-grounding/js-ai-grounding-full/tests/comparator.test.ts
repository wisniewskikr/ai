import { answersMatch } from "../src/services/comparator";

describe("answersMatch", () => {
  it("matches identical answers", () => {
    const { match, overlap } = answersMatch(
      "Alexander Fleming",
      ["Alexander Fleming", "penicillin"],
      "Alexander Fleming",
      ["Alexander Fleming", "penicillin"]
    );
    expect(match).toBe(true);
    expect(overlap).toBeGreaterThan(0.9);
  });

  it("matches semantically equivalent answers with different phrasing", () => {
    const { match } = answersMatch(
      "Alexander Fleming discovered penicillin in 1928",
      ["Alexander Fleming", "penicillin", "1928"],
      "Alexander Fleming",
      ["Alexander Fleming", "penicillin"]
    );
    expect(match).toBe(true);
  });

  it("does not match completely different answers", () => {
    const { match, overlap } = answersMatch(
      "Marie Curie",
      ["Marie Curie", "radium"],
      "Alexander Fleming",
      ["Alexander Fleming", "penicillin"]
    );
    expect(match).toBe(false);
    expect(overlap).toBeLessThan(0.5);
  });

  it("returns overlap in 0–1 range", () => {
    const { overlap } = answersMatch(
      "some answer",
      ["keyword"],
      "another answer",
      ["different"]
    );
    expect(overlap).toBeGreaterThanOrEqual(0);
    expect(overlap).toBeLessThanOrEqual(1);
  });
});
