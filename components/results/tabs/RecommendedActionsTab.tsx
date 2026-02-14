import React from 'react';
import { AnalysisResult } from '../../../types';
import { NoDataMessage, Section, TabSummary } from '../shared';

interface RecommendedActionsTabProps {
  result: AnalysisResult;
  expandedAction: number | null;
  onToggleAction: (index: number | null) => void;
}

export const RecommendedActionsTab: React.FC<RecommendedActionsTabProps> = ({ result, expandedAction, onToggleAction }) => (
  <div className="animate-fade-in">
    <TabSummary>Based on the analysis, this is a prioritized list of concrete steps you should take to mitigate the identified risks and secure your systems.</TabSummary>
    <Section title="Recommended Actions" icon={<span className="material-symbols-outlined text-2xl text-green-400">task_alt</span>}>
      {(Array.isArray(result.recommendedActions) ? result.recommendedActions : []).length > 0 ? (
        <div className="space-y-3">
          {(Array.isArray(result.recommendedActions) ? result.recommendedActions : []).map((action, index) => {
            const isExpanded = expandedAction === index;
            return (
              <div key={index} className="bg-primary-bg border border-border-dark rounded-lg overflow-hidden">
                <button
                  onClick={() => onToggleAction(isExpanded ? null : index)}
                  className="w-full flex items-start text-left p-4 hover:bg-border-dark/50 transition-colors"
                  aria-expanded={isExpanded}
                >
                  <span className="material-symbols-outlined text-xl text-green-400 mt-0.5 flex-shrink-0">check_circle</span>
                  <span className="ml-3 text-base font-bold text-text-body flex-grow">{action.action}</span>
                  <span className={`material-symbols-outlined text-2xl text-text-muted-2 transition-transform duration-300 ml-4 ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-border-dark animate-fade-in-down">
                    <ul className="list-disc pl-12 space-y-2 text-base text-text-muted-1">
                      {action.details.map((detail, i) => (
                        <li key={i}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <NoDataMessage message="No specific actions are recommended at this time based on the analysis." title="No Recommended Actions" />
      )}
    </Section>
  </div>
);
