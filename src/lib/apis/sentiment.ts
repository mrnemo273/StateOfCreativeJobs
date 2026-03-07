// Simple keyword-based sentiment scorer — pure function, no API needed.

const POSITIVE_WORDS = [
  "growth",
  "growing",
  "surge",
  "surges",
  "record",
  "high",
  "demand",
  "hiring",
  "boost",
  "opportunity",
  "opportunities",
  "rise",
  "rising",
  "increase",
  "thriving",
  "innovation",
  "innovative",
  "premium",
  "invest",
  "investment",
  "expand",
  "expanding",
  "strong",
  "resilient",
  "valued",
];

const NEGATIVE_WORDS = [
  "decline",
  "declining",
  "cut",
  "cuts",
  "layoff",
  "layoffs",
  "replace",
  "replaced",
  "threat",
  "risk",
  "shrink",
  "shrinking",
  "loss",
  "obsolete",
  "automate",
  "automated",
  "displacement",
  "downturn",
  "struggle",
  "struggling",
  "stagnate",
  "stagnating",
  "reduce",
  "reduced",
  "eliminate",
  "eliminated",
];

/**
 * Score the sentiment of a single text string based on keyword matching.
 */
export function scoreSentiment(
  text: string,
): "positive" | "neutral" | "negative" {
  const lower = text.toLowerCase();

  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of POSITIVE_WORDS) {
    if (lower.includes(word)) {
      positiveCount++;
    }
  }

  for (const word of NEGATIVE_WORDS) {
    if (lower.includes(word)) {
      negativeCount++;
    }
  }

  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
}

/**
 * Score overall sentiment across multiple texts.
 * Returns a numeric score (-100 to +100) and a human-readable label.
 */
export function scoreOverallSentiment(
  texts: string[],
): { score: number; label: "Negative" | "Mixed" | "Neutral" | "Positive" } {
  let rawScore = 0;
  let hasPositive = false;
  let hasNegative = false;
  let allNeutral = true;

  for (const text of texts) {
    const sentiment = scoreSentiment(text);

    if (sentiment === "positive") {
      rawScore += 20;
      hasPositive = true;
      allNeutral = false;
    } else if (sentiment === "negative") {
      rawScore -= 20;
      hasNegative = true;
      allNeutral = false;
    }
  }

  // Clamp score to -100..+100
  const score = Math.max(-100, Math.min(100, rawScore));

  let label: "Negative" | "Mixed" | "Neutral" | "Positive";

  if (score > 20) {
    label = "Positive";
  } else if (score < -20) {
    label = "Negative";
  } else if (allNeutral) {
    label = "Neutral";
  } else if (hasPositive && hasNegative) {
    label = "Mixed";
  } else {
    label = "Neutral";
  }

  return { score, label };
}
