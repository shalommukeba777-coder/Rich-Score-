export type BuilderType = 'framer' | 'webflow' | 'wix_studio' | 'squarespace' | 'wordpress' | 'custom';

export type FixMode = 'suggest' | 'approve' | 'auto';

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';

export type IssueCategory = 'schema_meta' | 'content_keywords' | 'technical' | 'media_a11y';

export type IssueType =
  | 'title'
  | 'meta_description'
  | 'headings'
  | 'alt_text'
  | 'json_ld'
  | 'internal_links'
  | 'sitemap_robots'
  | 'open_graph'
  | 'canonical';

export interface SEOIssue {
  id: string;
  category: IssueCategory;
  type: IssueType;
  page: string;
  severity: IssueSeverity;
  title: string;
  description: string;
  impact: string;
  currentValue: string;
  recommendedValue: string;
  plainFix: string;
  applied: boolean;
  status: 'pending' | 'applied' | 'rejected' | 'reverted';
  appliedAt?: string;
}

export interface SubScores {
  technical: number;
  contentKeywords: number;
  schemaMeta: number;
  mediaA11y: number;
}

export interface Site {
  id: string;
  name: string;
  url: string;
  builder: BuilderType;
  scriptVerified: boolean;
  scriptToken: string;
  fixMode: FixMode;
  scriptRevoked: boolean;
  overallScore: number;
  projectedScore: number;
  subScores: SubScores;
  pagesScanned: number;
  lastCrawledAt: string;
  issues: SEOIssue[];
}

export interface KeywordData {
  id: string;
  keyword: string;
  volume: number;
  difficulty: number; // 0 - 100
  intent: 'Commercial' | 'Informational' | 'Transactional' | 'Navigational';
  cpc: number;
  cluster: string;
  currentRank?: number;
  previousRank?: number;
  rankDelta?: number; // negative number indicates drop (e.g. -7 means dropped 7 positions)
  impressions?: number;
  clicks?: number;
  pageTarget?: string;
  dropReason?: string;
  rankHistory?: { day: number; date: string; rank: number }[];
}

export const isKeywordDroppedOver5 = (kw: KeywordData): boolean => {
  if (kw.rankDelta !== undefined && kw.rankDelta < -5) return true;
  if (
    kw.previousRank !== undefined &&
    kw.currentRank !== undefined &&
    kw.currentRank - kw.previousRank > 5
  ) {
    return true;
  }
  return false;
};

export interface ChangelogItem {
  id: string;
  siteId: string;
  issueId: string;
  type: IssueType;
  page: string;
  title: string;
  before: string;
  after: string;
  appliedBy: 'Auto-apply engine' | 'Manual approval' | 'AI Assistant';
  timestamp: string;
  status: 'active' | 'reverted';
}

export interface AgencyClient {
  id: string;
  name: string;
  email: string;
  role: 'Viewer' | 'Approver' | 'Admin';
  assignedSites: string[];
  status: 'Active' | 'Pending';
  lastActive: string;
}

export interface PricingPlan {
  id: 'starter' | 'growth' | 'agency';
  name: string;
  price: number;
  cadence: string;
  description: string;
  features: string[];
  recommended?: boolean;
}
