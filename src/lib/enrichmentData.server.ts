// src/lib/enrichmentData.server.ts

import {
  CACHED_ROLE_ENRICHMENTS,
  CACHED_MARKET_ENRICHMENT,
} from "./cachedEnrichmentData";
import type { RoleEnrichment, MarketEnrichment } from "./enrichmentData";

export function getRoleEnrichment(slug: string): RoleEnrichment | null {
  return CACHED_ROLE_ENRICHMENTS[slug] ?? null;
}

export function getMarketEnrichment(): MarketEnrichment | null {
  return CACHED_MARKET_ENRICHMENT;
}
