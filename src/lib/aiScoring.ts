export const TDI_SCORES: Record<string, { score: number; tools: string[] }> = {
  'creative-director':       { score: 22, tools: ['Claude', 'Midjourney'] },
  'design-director':         { score: 20, tools: ['Figma AI', 'Claude'] },
  'head-of-design':          { score: 18, tools: [] },
  'vp-of-design':            { score: 12, tools: [] },
  'cco':                     { score: 10, tools: [] },
  'senior-product-designer': { score: 45, tools: ['Figma AI', 'Galileo AI', 'v0'] },
  'ux-designer':             { score: 50, tools: ['Figma AI', 'Galileo AI', 'Uizard'] },
  'product-designer':        { score: 52, tools: ['v0', 'Galileo AI', 'Figma AI'] },
  'ux-researcher':           { score: 30, tools: ['Synthetic Users', 'AI interview summarizers'] },
  'design-systems-designer': { score: 55, tools: ['Figma AI', 'Tokens Studio AI', 'GitHub Copilot'] },
  'brand-designer':          { score: 62, tools: ['Midjourney', 'Adobe Firefly', 'Canva AI'] },
  'graphic-designer':        { score: 75, tools: ['Midjourney', 'Firefly', 'DALL-E 3', 'Canva AI'] },
  'visual-designer':         { score: 70, tools: ['Midjourney', 'Firefly', 'Canva AI'] },
  'art-director':            { score: 40, tools: ['Midjourney', 'Claude'] },
  'motion-designer':         { score: 72, tools: ['Sora', 'Runway', 'Kling', 'Pika'] },
  'copywriter':              { score: 82, tools: ['GPT-4o', 'Claude', 'Gemini'] },
  'content-strategist':      { score: 35, tools: ['Claude', 'Perplexity'] },
  'ux-writer':               { score: 58, tools: ['GPT-4o', 'Claude'] },
  'creative-copywriter':     { score: 65, tools: ['GPT-4o', 'Claude'] },
  'content-designer':        { score: 50, tools: ['Claude', 'Notion AI'] },
};

export function computeAIRiskScore(onetScore: number, slug: string): number {
  const tdi = TDI_SCORES[slug]?.score ?? onetScore;
  return Math.min(100, Math.max(0, Math.round((onetScore * 0.4) + (tdi * 0.6))));
}

export function getRiskLabel(score: number): 'Low' | 'Moderate' | 'Elevated' | 'High' {
  if (score < 25) return 'Low';
  if (score < 50) return 'Moderate';
  if (score < 70) return 'Elevated';
  return 'High';
}

export function getDisplacingTools(slug: string): string[] {
  return TDI_SCORES[slug]?.tools ?? [];
}
