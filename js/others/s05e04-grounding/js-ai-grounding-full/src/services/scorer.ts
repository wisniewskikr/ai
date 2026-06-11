import config from "../../config.json";

export interface ScoreBreakdown {
  layer1: number;
  layer2: number | null;
  layer3: number;
  layer4: number;
  final: number;
  level: "HIGH" | "MEDIUM" | "LOW";
}

export function computeScore(
  layer1Overlap: number,
  layer2Coverage: number | null,
  layer3AvgConfidence: number,
  layer4Score: number
): ScoreBreakdown {
  const { layer1: w1, layer2: w2, layer3: w3, layer4: w4 } = config.weights;
  const { highThreshold, mediumThreshold } = config.confidence;

  let final: number;

  if (layer2Coverage === null) {
    // Redistribute layer2 weight proportionally among the other layers
    const rest = w1 + w3 + w4;
    final =
      layer1Overlap * (w1 / rest) +
      layer3AvgConfidence * (w3 / rest) +
      layer4Score * (w4 / rest);
  } else {
    final =
      layer1Overlap * w1 +
      layer2Coverage * w2 +
      layer3AvgConfidence * w3 +
      layer4Score * w4;
  }

  const level: "HIGH" | "MEDIUM" | "LOW" =
    final >= highThreshold ? "HIGH" : final >= mediumThreshold ? "MEDIUM" : "LOW";

  return { layer1: layer1Overlap, layer2: layer2Coverage, layer3: layer3AvgConfidence, layer4: layer4Score, final, level };
}
