export interface EmailInfo {
  from: string;
  to: string;
  subject: string;
  date: string;
  replyTo: string;
  authenticationResults: string;
  bodySnippet: string;
  fileHash?: string; // SHA-256 hash of the raw .eml content
}

export interface PreliminaryUrlAnalysis {
  url: string;
  context: string | null;
  preliminaryScore: number;
  signals: string[];
}

export interface AnalyzedUrl {
  url:string;
  safetyScore: number;
  verdict: 'Safe' | 'Suspicious' | 'Caution' | 'Manual Review';
  positiveSignals: string[];
  negativeSignals: string[];
  verdictReason: string;
  detailedAnalysis: string;
}

export interface AnalyzedAttachment {
  filename: string;
  filetype: string;
  contentId: string;
  sizeInBytes: number;
  isInline: boolean;
  warning: string;
}

export interface GeolocationInfo {
    city: string;
    region: string; // State or province
    country: string;
    countryCode: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    timezoneId: string;
    timezoneOffset: string;
}

export interface NetworkInfo {
    organization: string;
    isp: string;
    asn: number;
    asnRoute: string;
    asnDomain: string;
}

export interface SecurityInfo {
    anonymous: boolean;
    proxy: boolean;
    vpn: boolean;
    tor: boolean;
    hosting: boolean;
}

export interface AnalyzedIp {
  ip: string;
  type: 'origin' | 'hop';
  analysis: string;
  geolocation?: GeolocationInfo;
  network?: NetworkInfo;
  security?: SecurityInfo;
  latitude?: number | null;
  longitude?: number | null;
  hostname?: string;
  isAnycast?: boolean;
}

export type EmailIndicatorType = 'sender' | 'recipient' | 'reply-to' | 'mentioned-in-body';
export type DomainIndicatorType = 'sending-domain' | 'mail-server-hop' | 'linked-in-url' | 'mentioned-in-body';

export interface AnalyzedEmail {
  email: string;
  type: EmailIndicatorType;
  analysis: string;
}

export interface AnalyzedDomain {
  domain: string;
  type: DomainIndicatorType;
  analysis: string;
}

export interface Indicators {
  ips: AnalyzedIp[];
  domains: AnalyzedDomain[];
  emails: AnalyzedEmail[];
}

export interface HeaderHop {
  from: string;
  by: string;
  protocol: string;
  timestamp: string;
  analysis: string;
}

export interface AuthResult {
  status: string; // e.g., 'Pass', 'Fail', 'Neutral', 'SoftFail', 'None'
  explanation: string;
}

export interface HeaderAnalysis {
  receivedPath: HeaderHop[];
  spfResult: AuthResult;
  dkimResult: AuthResult;
  dmarcResult: AuthResult;
}

export interface MitreAttackTechnique {
  techniqueId: string;
  techniqueName: string;
  description: string;
}

export interface KeyFinding {
  finding: string;
  explanation: string;
  source: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface RiskFactor {
  description: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface RiskScoreAnalysis {
  positiveFactors: RiskFactor[]; // Factors that lowered the risk
  negativeFactors: RiskFactor[]; // Factors that increased the risk
  scoreCalculation: string; // A step-by-step explanation of how the score was calculated. e.g., "Baseline Score: 50. Added 30 for suspicious URL. Subtracted 10 for SPF pass. Final Score: 70."
  finalRationale: string; // A concluding summary of how the score was determined
}

export interface RecommendedAction {
  action: string;
  details: string[];
}

export interface AnalysisResult {
  phishingProbability: number;
  riskLevel: string;
  phishingProbabilityExplanation: string;
  emailInfo: EmailInfo;
  urls: AnalyzedUrl[];
  attachments: AnalyzedAttachment[];
  indicators: {
    domains: AnalyzedDomain[];
    emails: AnalyzedEmail[];
    ips: AnalyzedIp[];
  };
  keyFindings: KeyFinding[];
  recommendedActions: RecommendedAction[];
  riskScoreAnalysis: RiskScoreAnalysis;
  mitreAttackTechniques: MitreAttackTechnique[];
  rawEml: string;
  analysisTime?: number; // Add timing information
  headerAnalysis?: HeaderAnalysis; // Add header analysis field
}