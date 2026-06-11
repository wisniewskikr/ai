import { computeScore } from "../src/services/scorer";

describe("computeScore", () => {
  it("returns HIGH for strong agreement across all layers", () => {
    const score = computeScore(1.0, 1.0, 0.95, 0.98);
    expect(score.level).toBe("HIGH");
    expect(score.final).toBeGreaterThanOrEqual(0.8);
  });

  it("returns LOW when models disagree and Wikipedia does not confirm", () => {
    const score = computeScore(0.1, 0.1, 0.5, 0.3);
    expect(score.level).toBe("LOW");
    expect(score.final).toBeLessThan(0.5);
  });

  it("redistributes weights when layer2 is null", () => {
    const withWiki = computeScore(1.0, 1.0, 1.0, 1.0);
    const withoutWiki = computeScore(1.0, null, 1.0, 1.0);
    // Both should still be HIGH since all other layers are perfect
    expect(withoutWiki.level).toBe("HIGH");
    expect(withoutWiki.final).toBeCloseTo(1.0, 2);
    expect(withWiki.final).toBeCloseTo(1.0, 2);
  });

  it("final score is always between 0 and 1", () => {
    const score = computeScore(0.5, 0.5, 0.5, 0.5);
    expect(score.final).toBeGreaterThanOrEqual(0);
    expect(score.final).toBeLessThanOrEqual(1);
  });

  it("returns MEDIUM for borderline scores", () => {
    const score = computeScore(0.5, 0.5, 0.5, 0.5);
    expect(score.level).toBe("MEDIUM");
  });
});
