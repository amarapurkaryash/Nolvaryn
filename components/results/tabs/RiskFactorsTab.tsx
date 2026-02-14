import React from 'react';
import { AnalysisResult, RiskFactor } from '../../../types';
import { NoDataMessage, Section, TabSummary, getImpactVisuals, QuantitativeFinding } from '../shared';

const ScoreCalculationDisplay: React.FC<{ calculation?: string }> = ({ calculation }) => {
  if (!calculation) {
    return (
      <div className="text-center py-8 px-4 bg-primary-bg rounded-lg border-2 border-dashed border-border-dark">
        <span className="material-symbols-outlined text-4xl mx-auto text-text-muted-2 mb-3">calculate</span>
        <h4 className="text-md font-semibold text-text-muted-1">No Calculation Breakdown Available</h4>
        <p className="text-sm text-text-muted-2 mt-1">The AI did not provide a step-by-step calculation for this score.</p>
      </div>
    );
  }

  const lines = calculation.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed !== '' && !/^[=\-]+$/.test(trimmed);
  });

  const getLineVisuals = (line: string) => {
    const trimmedLine = line.trim();
    const lowerTrimmed = trimmedLine.toLowerCase();

    if (lowerTrimmed.includes('final score')) return { color: 'text-text-heading', icon: 'flag', isFinal: true };
    if (trimmedLine.startsWith('+')) return { color: 'text-red-400', icon: 'arrow_upward', isFinal: false };
    if (trimmedLine.startsWith('-')) return { color: 'text-green-400', icon: 'arrow_downward', isFinal: false };
    return { color: 'text-text-muted-1', icon: 'horizontal_rule', isFinal: false };
  };

  return (
    <div className="bg-primary-bg p-4 rounded-lg border border-border-dark font-mono text-base">
      <ul className="space-y-2">
        {lines.map((line, index) => {
          const visuals = getLineVisuals(line);
          const trimmedLine = line.trim();
          let displayLine = trimmedLine;
          if (visuals.isFinal) {
            displayLine = trimmedLine.replace(/^=+\s*/, '');
          }

          return (
            <li key={index} className={`flex items-center p-2 rounded-md ${visuals.isFinal ? 'bg-secondary-bg border border-border-dark mt-4' : ''}`}>
              <span className={`material-symbols-outlined text-xl mr-3 ${visuals.color}`}>{visuals.icon}</span>
              <span className={`${visuals.color} ${visuals.isFinal ? 'font-bold' : ''}`}>{displayLine}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const RiskFactorsDisplay: React.FC<{ positive: RiskFactor[]; negative: RiskFactor[] }> = ({ positive, negative }) => {
  if ((!positive || positive.length === 0) && (!negative || negative.length === 0)) {
    return (
      <div className="text-center py-8 px-4 bg-primary-bg rounded-lg border-2 border-dashed border-border-dark">
        <span className="material-symbols-outlined text-4xl mx-auto text-text-muted-2 mb-3">checklist</span>
        <h4 className="text-md font-semibold text-text-muted-1">No Specific Factors Detailed</h4>
        <p className="text-sm text-text-muted-2 mt-1">The AI did not provide a list of specific factors contributing to the score.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h4 className="text-lg font-bold text-red-400 mb-3 flex items-center">
          <span className="material-symbols-outlined mr-2">remove_circle</span>
          Negative Factors (Risk Increased)
        </h4>
        <div className="space-y-3">
          {negative && negative.length > 0 ? (
            negative.map((factor, index) => {
              const visuals = getImpactVisuals(factor.impact);
              return (
                <div key={`neg-${index}`} className={`bg-primary-bg p-3 rounded-lg border border-border-dark border-l-4 ${visuals.borderColor}`}>
                  <p className="text-text-body">{factor.description}</p>
                  <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${visuals.bgColor} ${visuals.color}`}>
                    {factor.impact.toUpperCase()} IMPACT
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-text-muted-1 text-sm italic p-3 bg-primary-bg rounded-md border border-dashed border-border-dark">No negative factors listed.</p>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-lg font-bold text-green-400 mb-3 flex items-center">
          <span className="material-symbols-outlined mr-2">add_circle</span>
          Positive Factors (Risk Decreased)
        </h4>
        <div className="space-y-3">
          {positive && positive.length > 0 ? (
            positive.map((factor, index) => {
              const visuals = getImpactVisuals('Positive');
              return (
                <div key={`pos-${index}`} className={`bg-primary-bg p-3 rounded-lg border border-border-dark border-l-4 ${visuals.borderColor}`}>
                  <p className="text-text-body">{factor.description}</p>
                  <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${visuals.bgColor} ${visuals.color}`}>
                    {factor.impact.toUpperCase()} IMPACT
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-text-muted-1 text-sm italic p-3 bg-primary-bg rounded-md border border-dashed border-border-dark">No positive factors listed.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const QuantitativeRiskBreakdown: React.FC<{ result: AnalysisResult }> = ({ result }) => {
  const findings = React.useMemo<QuantitativeFinding[]>(() => {
    const calculatedFindings: QuantitativeFinding[] = [];

    const riskyUrls = result.urls?.filter(u => u.verdict === 'Caution' || u.verdict === 'Suspicious') || [];
    if (riskyUrls.length > 0) {
      const cautionCount = riskyUrls.filter(u => u.verdict === 'Caution').length;
      const suspiciousCount = riskyUrls.filter(u => u.verdict === 'Suspicious').length;
      calculatedFindings.push({
        category: 'URL Security',
        icon: 'link',
        impact: cautionCount > 0 ? 'Critical' : 'High',
        summary: `${cautionCount} Caution & ${suspiciousCount} Suspicious URLs found.`,
        details: riskyUrls.map(u => `[${u.verdict}] ${u.url}`),
      });
    }

    const riskyAttachments = result.attachments?.filter(a =>
      a.warning.toLowerCase().includes('high-risk') ||
      a.warning.toLowerCase().includes('malicious') ||
      a.warning.toLowerCase().includes('executable')
    ) || [];
    if (riskyAttachments.length > 0) {
      calculatedFindings.push({
        category: 'Attachment Security',
        icon: 'attachment',
        impact: 'High',
        summary: `${riskyAttachments.length} high-risk attachment(s) identified.`,
        details: riskyAttachments.map(a => `${a.filename} - ${a.warning}`),
      });
    }

    const auth = result.headerAnalysis;
    const failedAuths = [] as string[];
    if (auth?.spfResult?.status?.toLowerCase() !== 'pass') failedAuths.push('SPF');
    if (auth?.dkimResult?.status?.toLowerCase() !== 'pass') failedAuths.push('DKIM');
    if (auth?.dmarcResult?.status?.toLowerCase() !== 'pass') failedAuths.push('DMARC');

    if (failedAuths.length > 0) {
      calculatedFindings.push({
        category: 'Sender Authentication',
        icon: 'gpp_bad',
        impact: failedAuths.includes('DMARC') ? 'High' : 'Medium',
        summary: `${failedAuths.join(', ')} check(s) failed.`,
         details: [
          `SPF: ${auth?.spfResult?.status || 'N/A'}`,
          `DKIM: ${auth?.dkimResult?.status || 'N/A'}`,
          `DMARC: ${auth?.dmarcResult?.status || 'N/A'}`,
        ],
      });
    } else if (auth?.spfResult && auth?.dkimResult && auth?.dmarcResult) {
      calculatedFindings.push({
        category: 'Sender Authentication',
        icon: 'verified_user',
        impact: 'Positive',
        summary: 'SPF, DKIM & DMARC all passed.',
        details: ['All sender authentication protocols passed, increasing confidence in sender\'s identity.'],
      });
    }

    const criticalFindings = result.keyFindings?.filter(f => f.severity === 'Critical') || [];
    const highFindings = result.keyFindings?.filter(f => f.severity === 'High') || [];
    if (criticalFindings.length > 0 || highFindings.length > 0) {
      calculatedFindings.push({
        category: 'Key Findings Severity',
        icon: 'fact_check',
        impact: criticalFindings.length > 0 ? 'Critical' : 'High',
        summary: `${criticalFindings.length} Critical & ${highFindings.length} High severity findings.`,
        details: [...criticalFindings, ...highFindings].map(f => `[${f.severity}] ${f.finding}`),
      });
    }

    const techniques = result.mitreAttackTechniques || [];
    if (techniques.length > 0) {
      calculatedFindings.push({
        category: 'Attack Vectors Identified',
        icon: 'flag',
        impact: 'High',
        summary: `${techniques.length} MITRE ATT&CK® technique(s) detected.`,
        details: techniques.map(t => `${t.techniqueId}: ${t.techniqueName}`),
      });
    }

    return calculatedFindings.sort((a, b) => {
      const order = { Positive: 5, Neutral: 4, Low: 3, Medium: 2, High: 1, Critical: 0 } as const;
      return order[a.impact] - order[b.impact];
    });
  }, [result]);

  if (findings.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-primary-bg rounded-lg border-2 border-dashed border-border-dark">
        <span className="material-symbols-outlined text-4xl mx-auto text-text-muted-2 mb-3">checklist</span>
        <h4 className="text-md font-semibold text-text-muted-1">No Major Quantitative Factors</h4>
        <p className="text-sm text-text-muted-2 mt-1">The risk score was primarily determined by qualitative content analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {findings.map(finding => {
        const visuals = getImpactVisuals(finding.impact);
        return (
          <div key={finding.category} className={`bg-primary-bg p-4 rounded-lg border border-border-dark border-l-4 ${visuals.borderColor}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center">
                <span className={`material-symbols-outlined text-3xl ${visuals.color}`}>{finding.icon}</span>
                <div className="ml-3">
                  <h5 className="text-lg font-bold text-text-heading">{finding.category}</h5>
                  <p className="text-base text-text-muted-1">{finding.summary}</p>
                </div>
              </div>
              <div className={`font-semibold text-sm px-3 py-1 rounded-full whitespace-nowrap ${visuals.bgColor} ${visuals.color}`}>
                {finding.impact.toUpperCase()} IMPACT
              </div>
            </div>
            {finding.details.length > 0 && (
              <div className="mt-3 pl-10">
                <ul className="list-disc pl-5 space-y-1 text-sm text-text-muted-1">
                  {finding.details.map((detail, i) => (
                    <li key={i} className="break-all">{detail}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const RiskFactorsTab: React.FC<{ result: AnalysisResult }> = ({ result }) => (
  <div className="animate-fade-in space-y-6">
    <TabSummary>
      This section breaks down the specific elements that influenced the risk score. It highlights quantitative metrics and lists the individual positive (mitigating) and negative (aggravating) factors identified by the AI.
    </TabSummary>
    <Section title="Score Calculation Breakdown" icon={<span className="material-symbols-outlined text-2xl text-accent-primary">calculate</span>}>
      <ScoreCalculationDisplay calculation={result.riskScoreAnalysis.scoreCalculation} />
    </Section>
    <Section title="Contributing Risk Factors" icon={<span className="material-symbols-outlined text-2xl text-accent-primary">psychology</span>}>
      <RiskFactorsDisplay positive={result.riskScoreAnalysis.positiveFactors} negative={result.riskScoreAnalysis.negativeFactors} />
    </Section>
    <Section title="Quantitative Factor Analysis" icon={<span className="material-symbols-outlined text-2xl text-accent-primary">analytics</span>}>
      <QuantitativeRiskBreakdown result={result} />
    </Section>
  </div>
);
