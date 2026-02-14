import React from 'react';
import { AnalysisResult, KeyFinding } from '../../../types';
import { NoDataMessage, Section, TabSummary, getImpactVisuals } from '../shared';

interface KeyFindingsTabProps {
  result: AnalysisResult;
  expandedFinding: number | null;
  onToggleFinding: (index: number | null) => void;
}

const getSeverityVisuals = (severity: KeyFinding['severity']) => {
  switch (severity) {
    case 'Critical':
      return { icon: <span className="material-symbols-outlined text-xl text-red-400 mt-0.5 flex-shrink-0">gpp_bad</span>, borderColor: 'border-l-red-500', iconColor: 'text-red-400', bgColor: 'bg-red-500/20' };
    case 'High':
      return { icon: <span className="material-symbols-outlined text-xl text-orange-400 mt-0.5 flex-shrink-0">error</span>, borderColor: 'border-l-orange-500', iconColor: 'text-orange-400', bgColor: 'bg-orange-500/20' };
    case 'Medium':
      return { icon: <span className="material-symbols-outlined text-xl text-amber-400 mt-0.5 flex-shrink-0">warning</span>, borderColor: 'border-l-amber-500', iconColor: 'text-amber-400', bgColor: 'bg-amber-500/20' };
    case 'Low':
    default:
      return { icon: <span className="material-symbols-outlined text-xl text-sky-400 mt-0.5 flex-shrink-0">info</span>, borderColor: 'border-l-sky-500', iconColor: 'text-sky-400', bgColor: 'bg-sky-500/20' };
  }
};

export const KeyFindingsTab: React.FC<KeyFindingsTabProps> = ({ result, expandedFinding, onToggleFinding }) => (
  <div className="animate-fade-in">
    <TabSummary>These are the most critical, high-impact issues discovered during the analysis. Each finding is detailed with an explanation, its source within the email, and a severity rating to help prioritize your response.</TabSummary>
    <Section title="Key Findings" icon={<span className="material-symbols-outlined text-2xl text-amber-400">fact_check</span>}>
      {(Array.isArray(result.keyFindings) ? result.keyFindings : []).length > 0 ? (
        <div className="space-y-3">
          {(Array.isArray(result.keyFindings) ? result.keyFindings : []).map((finding, index) => {
            const visuals = getSeverityVisuals(finding.severity);
            const isExpanded = expandedFinding === index;
            return (
              <div key={index} className="bg-primary-bg border border-border-dark rounded-lg overflow-hidden">
                <button
                  onClick={() => onToggleFinding(isExpanded ? null : index)}
                  className="w-full flex items-start text-left p-4 hover:bg-border-dark/50 transition-colors"
                  aria-expanded={isExpanded}
                >
                  {visuals.icon}
                  <div className="ml-3 flex-grow min-w-0">
                    <p className="text-base font-bold text-text-body">{finding.finding}</p>
                    <p className="text-sm text-text-muted-1">{finding.source}</p>
                  </div>
                  <span className={`material-symbols-outlined text-2xl text-text-muted-2 transition-transform duration-300 ml-4 ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-border-dark bg-secondary-bg/20 animate-fade-in-down space-y-4">
                    <div>
                      <h5 className="text-sm font-semibold text-text-muted-2 uppercase tracking-wider mb-1">Severity</h5>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-base font-bold ${visuals.bgColor} ${visuals.iconColor}`}>
                        <span className="material-symbols-outlined text-lg mr-2">{getImpactVisuals(finding.severity).icon}</span>
                        {finding.severity}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-text-muted-2 uppercase tracking-wider mb-1">Explanation</h5>
                      <p className="text-base text-text-body leading-relaxed">{finding.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <NoDataMessage message="The analysis did not flag any critical issues contributing to the risk score." title="No Key Findings" />
      )}
    </Section>
  </div>
);
