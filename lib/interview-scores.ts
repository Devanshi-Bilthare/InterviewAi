import type { DimensionScores } from "@/types";

export function averageDimensionScores(
  scores: DimensionScores[]
): DimensionScores {
  if (scores.length === 0) {
    return {
      relevance: 0,
      technicalAccuracy: 0,
      communication: 0,
      confidence: 0,
      completeness: 0,
    };
  }

  const sum = scores.reduce(
    (acc, s) => ({
      relevance: acc.relevance + s.relevance,
      technicalAccuracy: acc.technicalAccuracy + s.technicalAccuracy,
      communication: acc.communication + s.communication,
      confidence: acc.confidence + s.confidence,
      completeness: acc.completeness + s.completeness,
    }),
    {
      relevance: 0,
      technicalAccuracy: 0,
      communication: 0,
      confidence: 0,
      completeness: 0,
    }
  );

  const count = scores.length;
  return {
    relevance: Math.round(sum.relevance / count),
    technicalAccuracy: Math.round(sum.technicalAccuracy / count),
    communication: Math.round(sum.communication / count),
    confidence: Math.round(sum.confidence / count),
    completeness: Math.round(sum.completeness / count),
  };
}

export function overallFromDimensions(dimensions: DimensionScores): number {
  const values = Object.values(dimensions);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}
