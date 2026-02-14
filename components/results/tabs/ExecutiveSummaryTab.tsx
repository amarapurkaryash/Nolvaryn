import React from 'react';
import { AnalysisResult, AnalyzedUrl, KeyFinding } from '../../../types';
import { NoDataMessage, RiskScoreGauge, Section, StatCard, TabSummary, getAuthStatusVisuals } from '../shared';

interface ExecutiveSummaryTabProps {
  result: AnalysisResult;
  onSelectTab: (tab: string) => void;
}

const getSeverityVisuals = (severity: KeyFinding['severity']) => {
  switch (severity) {
    case 'Critical':
      return { icon: 'gpp_bad', color: 'text-red-400', borderColor: 'border-l-red-500' };
    case 'High':
      return { icon: 'error', color: 'text-orange-400', borderColor: 'border-l-orange-500' };
    case 'Medium':
      return { icon: 'warning', color: 'text-amber-400', borderColor: 'border-l-amber-500' };
    case 'Low':
    default:
      return { icon: 'info', color: 'text-sky-400', borderColor: 'border-l-sky-500' };
  }
};

export const ExecutiveSummaryTab: React.FC<ExecutiveSummaryTabProps> = ({ result, onSelectTab }) => {
  const urlCounts = React.useMemo(() => {
    return (Array.isArray(result.urls) ? result.urls : []).reduce((acc, url) => {
      acc[url.verdict] = (acc[url.verdict] || 0) + 1;
      return acc;
    }, {} as Record<AnalyzedUrl['verdict'], number>);
  }, [result.urls]);

  const totalUrls = (Array.isArray(result.urls) ? result.urls : []).length;
  const suspiciousUrlCount = (urlCounts['Caution'] || 0) + (urlCounts['Suspicious'] || 0);
  const attachmentCount = (Array.isArray(result.attachments) ? result.attachments : []).length;
  const highRiskAttachmentCount = React.useMemo(
    () =>
      (Array.isArray(result.attachments) ? result.attachments : []).filter(att =>
        att.warning.toLowerCase().includes('high-risk') || att.warning.toLowerCase().includes('malicious')
      ).length,
    [result.attachments]
  );
  const totalIocs = React.useMemo(() => {
    const ipsCount = Array.isArray(result.indicators?.ips) ? result.indicators.ips.length : 0;
    const domainsCount = Array.isArray(result.indicators?.domains) ? result.indicators.domains.length : 0;
    const emailsCount = Array.isArray(result.indicators?.emails) ? result.indicators.emails.length : 0;
    return ipsCount + domainsCount + emailsCount;
  }, [result.indicators]);

  const keyFindings = Array.isArray(result.keyFindings) ? result.keyFindings : [];
  const topFindings = keyFindings.slice(0, 3);

  const techniques = Array.isArray(result.mitreAttackTechniques) ? result.mitreAttackTechniques : [];

  return (
    <div className="animate-fade-in">
      <TabSummary>
        This high-level summary provides an at-a-glance overview of the analysis, including the final risk score, key statistics, and the most critical findings. Use this view to quickly assess the overall threat level.
      </TabSummary>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <Section
            title="Risk Analysis"
            icon={<span className="material-symbols-outlined text-2xl text-accent-primary">shield</span>}
            infoText={result.phishingProbabilityExplanation}
          >
            <RiskScoreGauge score={result.phishingProbability} />
          </Section>
          <Section
            title="Authentication Status"
            icon={<span className="material-symbols-outlined text-2xl text-accent-primary">verified_user</span>}
          >
            <div className="space-y-3">
               {[
                 { title: 'SPF', data: result.headerAnalysis?.spfResult },
                 { title: 'DKIM', data: result.headerAnalysis?.dkimResult },
                 { title: 'DMARC', data: result.headerAnalysis?.dmarcResult },
               ].map(auth => {
                const visuals = getAuthStatusVisuals(auth.data?.status);
                return (
                  <div key={auth.title} className="flex items-center justify-between p-2 rounded-md bg-primary-bg border border-border-dark">
                    <div className="flex items-center font-semibold text-text-body">
                      {visuals.icon}
                      <span className="ml-2">{auth.title}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${visuals.badgeColor}`}>
                      {auth.data?.status ?? 'N/A'}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => onSelectTab('headers')}
                className="inline-flex items-center text-sm font-semibold text-accent-secondary hover:text-accent-primary transition-colors"
              >
                View Full Header Analysis <span className="ml-1">&rarr;</span>
              </button>
            </div>
          </Section>
        </div>
        <div className="col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              icon={<span className="material-symbols-outlined">link</span>}
              value={totalUrls}
              label="URLs Analyzed"
              subValue={suspiciousUrlCount}
              subLabel="Risky"
              colorClass={suspiciousUrlCount > 0 ? 'text-red-400' : 'text-accent-secondary'}
            />
            <StatCard
              icon={<span className="material-symbols-outlined">attachment</span>}
              value={attachmentCount}
              label="Attachments Found"
              subValue={highRiskAttachmentCount}
              subLabel="High-Risk"
              colorClass={highRiskAttachmentCount > 0 ? 'text-red-400' : 'text-accent-secondary'}
            />
            <StatCard
              icon={<span className="material-symbols-outlined">fingerprint</span>}
              value={totalIocs}
              label="Indicators Found"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Section title="Key Findings" icon={<span className="material-symbols-outlined text-2xl text-amber-400">fact_check</span>}>
              {topFindings.length > 0 ? (
                <div className="space-y-3">
                  {topFindings.map((finding, index) => {
                    const visuals = getSeverityVisuals(finding.severity);
                    return (
                      <div key={index} className={`bg-primary-bg p-3 rounded-lg border border-border-dark border-l-4 ${visuals.borderColor}`}>
                        <div className="flex items-start gap-3">
                          <span className={`material-symbols-outlined text-xl ${visuals.color}`}>{visuals.icon}</span>
                          <div>
                            <p className="text-text-body font-semibold">{finding.finding}</p>
                            <p className="text-sm text-text-muted-1 mt-1">{finding.explanation}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex justify-end">
                    <button
                      onClick={() => onSelectTab('key-findings')}
                      className="inline-flex items-center text-sm font-semibold text-accent-secondary hover:text-accent-primary transition-colors"
                    >
                      View All Findings ({keyFindings.length}) <span className="ml-1">&rarr;</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center h-full">
                  <NoDataMessage message="The analysis did not flag any critical issues." title="No Key Findings" />
                </div>
              )}
            </Section>
            <Section title="Attack Vectors" icon={<span className="material-symbols-outlined text-2xl text-violet-400">flag</span>} className="h-full">
              {techniques.length > 0 ? (
                <div className="flex flex-col flex-grow">
                  <ul className="space-y-3 flex-grow">
                    {techniques.slice(0, 4).map(technique => (
                      <li key={technique.techniqueId} className="flex items-start text-base">
                        <span className="material-symbols-outlined text-xl text-violet-400 mt-0.5 flex-shrink-0">flag</span>
                        <div className="ml-3">
                          <p className="text-text-body font-semibold">{technique.techniqueId}: {technique.techniqueName}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-end mt-auto pt-4">
                    <button
                      onClick={() => onSelectTab('attack-vectors')}
                      className="inline-flex items-center text-sm font-semibold text-accent-secondary hover:text-accent-primary transition-colors"
                    >
                      View All Vectors ({techniques.length}) <span className="ml-1">&rarr;</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center h-full">
                  <NoDataMessage message="No specific MITRE ATT&CK® techniques were identified." title="No Attack Vectors" />
                </div>
              )}
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
};
