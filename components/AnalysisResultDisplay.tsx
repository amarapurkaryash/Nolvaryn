import React from 'react';
import { AnalysisResult, AnalyzedIp } from '../types';
import { generateMarkdownReport } from '../services/markdownService';
import { ExecutiveSummaryTab } from './results/tabs/ExecutiveSummaryTab';
import { RiskFactorsTab } from './results/tabs/RiskFactorsTab';
import { UrlsTab } from './results/tabs/UrlsTab';
import { AttachmentsTab } from './results/tabs/AttachmentsTab';
import { StatisticsTab } from './results/tabs/StatisticsTab';
import { AttackVectorsTab } from './results/tabs/AttackVectorsTab';
import { KeyFindingsTab } from './results/tabs/KeyFindingsTab';
import { RecommendedActionsTab } from './results/tabs/RecommendedActionsTab';
import { DetailsTab } from './results/tabs/DetailsTab';
import { ThreatPathTab } from './results/tabs/ThreatPathTab';
import { GeolocationTab } from './results/tabs/GeolocationTab';
import { IpsTab } from './results/tabs/IpsTab';
import { IocsTab } from './results/tabs/IocsTab';
import { HeadersTab } from './results/tabs/HeadersTab';
import { RawTab } from './results/tabs/RawTab';
import { useChartDefaults } from './results/charts';

type TabName =
  | 'executive-summary'
  | 'risk-factors'
  | 'key-findings'
  | 'recommended-actions'
  | 'threat-path'
  | 'attack-vectors'
  | 'statistics'
  | 'geolocation'
  | 'urls'
  | 'attachments'
  | 'ips'
  | 'iocs'
  | 'headers'
  | 'details'
  | 'raw';

interface AnalysisResultDisplayProps {
  result: AnalysisResult;
  onReset: () => void;
}

export const AnalysisResultDisplay: React.FC<AnalysisResultDisplayProps> = ({ result, onReset }) => {
  const [activeTab, setActiveTab] = React.useState<TabName>('executive-summary');
  const [expandedUrls, setExpandedUrls] = React.useState<number[]>([]);
  const [copiedUrlIndex, setCopiedUrlIndex] = React.useState<number | null>(null);
  const [visibleIps, setVisibleIps] = React.useState<string[]>(() =>
    (Array.isArray(result.indicators?.ips) ? result.indicators.ips : [])
      .filter(ip => ip.latitude != null && ip.longitude != null && !(ip.latitude === 0 && ip.longitude === 0))
      .map(ip => ip.ip)
  );
  const [ipVersionFilter, setIpVersionFilter] = React.useState<'all' | 'ipv4' | 'ipv6'>('all');
  const [ipTypeFilter, setIpTypeFilter] = React.useState<'all' | 'origin' | 'hop'>('all');
  const [expandedFinding, setExpandedFinding] = React.useState<number | null>(null);
  const [expandedAction, setExpandedAction] = React.useState<number | null>(null);

  useChartDefaults();

  const toggleUrl = (index: number) => {
    setExpandedUrls(prev => (prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]));
  };

  const handleCopyUrl = (url: string, index: number) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrlIndex(index);
      setTimeout(() => setCopiedUrlIndex(null), 2000);
    });
  };

  const handleIpToggle = (ipAddress: string) => {
    setVisibleIps(prev => (prev.includes(ipAddress) ? prev.filter(ip => ip !== ipAddress) : [...prev, ipAddress]));
  };

  const isIPv6 = (ip: string) => ip.includes(':');

  const filteredIps = React.useMemo<AnalyzedIp[]>(() => {
    return (Array.isArray(result.indicators?.ips) ? result.indicators.ips : []).filter(ipInfo => {
      const versionMatch =
        ipVersionFilter === 'all' ||
        (ipVersionFilter === 'ipv4' && !isIPv6(ipInfo.ip)) ||
        (ipVersionFilter === 'ipv6' && isIPv6(ipInfo.ip));

      const typeMatch = ipTypeFilter === 'all' || ipTypeFilter === ipInfo.type;

      return versionMatch && typeMatch;
    });
  }, [result.indicators?.ips, ipVersionFilter, ipTypeFilter]);

  const downloadJsonReport = () => {
    try {
      const fileHash = result.emailInfo.fileHash || 'report';
      const filename = `Nolvaryn_Analysis_${fileHash.substring(0, 8)}.json`;

      const resultWithFooter = {
        ...result,
        metadata: {
          generatedOn: new Date().toLocaleString(),
          generatedBy: 'Nolvaryn Email Security Platform',
          poweredBy: 'Google Gemini AI',
        }
      };

      const jsonString = JSON.stringify(resultWithFooter, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate JSON report:', error);
      alert('An error occurred while generating the JSON report.');
    }
  };

  const downloadMarkdownReport = () => {
    try {
      const fileHash = result.emailInfo.fileHash || 'report';
      const filename = `Nolvaryn_Analysis_${fileHash.substring(0, 8)}.md`;

      const markdown = generateMarkdownReport(result);
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate Markdown report:', error);
      alert('An error occurred while generating the Markdown report.');
    }
  };

  const ipCount = Array.isArray(result.indicators?.ips) ? result.indicators.ips.length : 0;
  const domainsCountForOther = Array.isArray(result.indicators?.domains) ? result.indicators.domains.length : 0;
  const emailsCountForOther = Array.isArray(result.indicators?.emails) ? result.indicators.emails.length : 0;
  const otherIndicatorsCount = domainsCountForOther + emailsCountForOther;

  return (
    <div className="animate-fade-in space-y-8">
      <div className="bg-secondary-bg p-4 rounded-lg border border-border-dark flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-4 w-auto">
          <button
            onClick={downloadJsonReport}
            className="w-auto flex items-center justify-center px-4 py-2 bg-accent-secondary/80 text-text-heading font-semibold rounded-md hover:bg-accent-secondary transition-colors duration-300"
          >
            <span className="material-symbols-outlined mr-2">download</span>
            Download JSON
          </button>
          <button
            onClick={downloadMarkdownReport}
            className="w-auto flex items-center justify-center px-4 py-2 bg-blue-500/80 text-text-heading font-semibold rounded-md hover:bg-blue-500 transition-colors duration-300"
          >
            <span className="material-symbols-outlined mr-2">description</span>
            Download Markdown
          </button>
        </div>
        <button
          onClick={onReset}
          className="w-auto flex items-center justify-center px-4 py-2 bg-gray-600 text-text-heading font-semibold rounded-md hover:bg-gray-700 transition-colors duration-300"
        >
          Analyze Another
        </button>
      </div>

      <div className="bg-secondary-bg rounded-lg border border-border-dark">
        <div className="border-b border-border-dark">
          <nav className="flex flex-wrap gap-2 p-2" aria-label="Tabs">
            <button onClick={() => setActiveTab('executive-summary')} className={`flex items-center justify-center text-center px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'executive-summary' ? 'bg-accent-primary text-white' : 'text-text-muted-1 hover:bg-gray-700/50'}`}><span className="material-symbols-outlined mr-2">space_dashboard</span>Executive Summary</button>
            <button onClick={() => setActiveTab('risk-factors')} className={`flex items-center justify-center text-center px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'risk-factors' ? 'bg-accent-primary text-white' : 'text-text-muted-1 hover:bg-gray-700/50'}`}><span className="material-symbols-outlined mr-2">rule</span>Risk Factors</button>
            <button onClick={() => setActiveTab('key-findings')} className={`flex items-center justify-center text-center px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'key-findings' ? 'bg-accent-primary text-white' : 'text-text-muted-1 hover:bg-gray-700/50'}`}><span className="material-symbols-outlined mr-2">fact_check</span>Key Findings ({Array.isArray(result.keyFindings) ? result.keyFindings.length : 0})</button>
            <button onClick={() => setActiveTab('recommended-actions')} className={`flex items-center justify-center text-center px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'recommended-actions' ? 'bg-accent-primary text-white' : 'text-text-muted-1 hover:bg-gray-700/50'}`}><span className="material-symbols-outlined mr-2">task_alt</span>Recommended Actions ({Array.isArray(result.recommendedActions) ? result.recommendedActions.length : 0})</button>
            <button onClick={() => setActiveTab('threat-path')} className={`flex items-center justify-center text-center px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'threat-path' ? 'bg-accent-primary text-white' : 'text-text-muted-1 hover:bg-gray-700/50'}`}><span className="material-symbols-outlined mr-2">share</span>Threat Path</button>
            <button onClick={() => setActiveTab('attack-vectors')} className={`flex items-center justify-center text-center px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'attack-vectors' ? 'bg-accent-primary text-white' : 'text-text-muted-1 hover:bg-gray-700/50'}`}><span className="material-symbols-outlined mr-2">flag</span>Attack Vectors ({Array.isArray(result.mitreAttackTechniques) ? result.mitreAttackTechniques.length : 0})</button>
            <button onClick={() => setActiveTab('statistics')} className={`flex items-center justify-center text-center px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'statistics' ? 'bg-accent-primary text-white' : 'text-text-muted-1 hover:bg-gray-700/50'}`}><span className="material-symbols-outlined mr-2">monitoring</span>Statistics</button>
            <button onClick={() => setActiveTab('geolocation')} className={`flex items-center justify-center text-center px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'geolocation' ? 'bg-accent-primary text-white' : 'text-text-muted-1 hover:bg-gray-700/50'}`}><span className="material-symbols-outlined mr-2">public</span>Geolocation</button>
            <button onClick={() => setActiveTab('urls')} className={`flex items-center justify-center text-center px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'urls' ? 'bg-accent-primary text-white' : 'text-text-muted-1 hover:bg-gray-700/50'}`}><span className="material-symbols-outlined mr-2">link</span>URLs ({Array.isArray(result.urls) ? result.urls.length : 0})</button>
            <button onClick={() => setActiveTab('attachments')} className={`flex items-center justify-center text-center px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'attachments' ? 'bg-accent-primary text-white' : 'text-text-muted-1 hover:bg-gray-700/50'}`}><span className="material-symbols-outlined mr-2">attachment</span>Attachments ({Array.isArray(result.attachments) ? result.attachments.length : 0})</button>
            <button onClick={() => setActiveTab('ips')} className={`flex items-center justify-center text-center px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'ips' ? 'bg-accent-primary text-white' : 'text-text-muted-1 hover:bg-gray-700/50'}`}><span className="material-symbols-outlined mr-2">dns</span>IPs ({ipCount})</button>
            <button onClick={() => setActiveTab('iocs')} className={`flex items-center justify-center text-center px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'iocs' ? 'bg-accent-primary text-white' : 'text-text-muted-1 hover:bg-gray-700/50'}`}><span className="material-symbols-outlined mr-2">fingerprint</span>Domains & Emails ({otherIndicatorsCount})</button>
            <button onClick={() => setActiveTab('headers')} className={`flex items-center justify-center text-center px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'headers' ? 'bg-accent-primary text-white' : 'text-text-muted-1 hover:bg-gray-700/50'}`}><span className="material-symbols-outlined mr-2">receipt_long</span>Headers</button>
            <button onClick={() => setActiveTab('details')} className={`flex items-center justify-center text-center px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'details' ? 'bg-accent-primary text-white' : 'text-text-muted-1 hover:bg-gray-700/50'}`}><span className="material-symbols-outlined mr-2">mail</span>Email Details</button>
            <button onClick={() => setActiveTab('raw')} className={`flex items-center justify-center text-center px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'raw' ? 'bg-accent-primary text-white' : 'text-text-muted-1 hover:bg-gray-700/50'}`}><span className="material-symbols-outlined mr-2">code_blocks</span>Raw Source</button>
          </nav>
        </div>
        <div className="p-6">
          {activeTab === 'executive-summary' && (
            <ExecutiveSummaryTab result={result} onSelectTab={(tab) => setActiveTab(tab as TabName)} />
          )}
          {activeTab === 'risk-factors' && <RiskFactorsTab result={result} />}
          {activeTab === 'urls' && (
            <UrlsTab
              result={result}
              expandedUrls={expandedUrls}
              copiedUrlIndex={copiedUrlIndex}
              onToggleUrl={toggleUrl}
              onCopyUrl={handleCopyUrl}
            />
          )}
          {activeTab === 'attachments' && <AttachmentsTab result={result} />}
          {activeTab === 'statistics' && <StatisticsTab result={result} />}
          {activeTab === 'attack-vectors' && <AttackVectorsTab result={result} />}
          {activeTab === 'key-findings' && (
            <KeyFindingsTab
              result={result}
              expandedFinding={expandedFinding}
              onToggleFinding={setExpandedFinding}
            />
          )}
          {activeTab === 'recommended-actions' && (
            <RecommendedActionsTab
              result={result}
              expandedAction={expandedAction}
              onToggleAction={setExpandedAction}
            />
          )}
          {activeTab === 'details' && <DetailsTab result={result} />}
          {activeTab === 'threat-path' && <ThreatPathTab result={result} />}
          {activeTab === 'geolocation' && (
            <GeolocationTab
              result={result}
              visibleIps={visibleIps}
              filteredIps={filteredIps}
              ipVersionFilter={ipVersionFilter}
              ipTypeFilter={ipTypeFilter}
              onIpVersionFilterChange={setIpVersionFilter}
              onIpTypeFilterChange={setIpTypeFilter}
              onToggleIpVisibility={handleIpToggle}
            />
          )}
          {activeTab === 'ips' && (
            <IpsTab
              result={result}
              filteredIps={filteredIps}
              ipVersionFilter={ipVersionFilter}
              ipTypeFilter={ipTypeFilter}
              onIpVersionFilterChange={setIpVersionFilter}
              onIpTypeFilterChange={setIpTypeFilter}
            />
          )}
          {activeTab === 'iocs' && <IocsTab result={result} />}
          {activeTab === 'headers' && <HeadersTab result={result} />}
          {activeTab === 'raw' && <RawTab result={result} />}
        </div>
      </div>
    </div>
  );
};
