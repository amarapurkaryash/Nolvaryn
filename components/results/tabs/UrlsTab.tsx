import React from 'react';
import { AnalysisResult } from '../../../types';
import { NoDataMessage, TabSummary, getVerdictVisuals } from '../shared';

interface UrlsTabProps {
  result: AnalysisResult;
  expandedUrls: number[];
  copiedUrlIndex: number | null;
  onToggleUrl: (index: number) => void;
  onCopyUrl: (url: string, index: number) => void;
}

export const UrlsTab: React.FC<UrlsTabProps> = ({ result, expandedUrls, copiedUrlIndex, onToggleUrl, onCopyUrl }) => (
  <div className="animate-fade-in">
    <TabSummary>A detailed breakdown of every URL found in the email, including a safety score, verdict, and a list of positive and negative security signals.</TabSummary>
    {(result.urls && result.urls.length > 0) ? (
      <div className="space-y-3">
        {result.urls.map((url, index) => {
          const visuals = getVerdictVisuals(url.verdict);
          const isExpanded = expandedUrls.includes(index);
          const isCopied = copiedUrlIndex === index;
          const scorePercentage = url.safetyScore;
          const progressBarColor = scorePercentage > 70 ? 'bg-green-500' : scorePercentage > 40 ? 'bg-amber-500' : 'bg-red-500';

          return (
            <div key={index} className="bg-primary-bg border border-border-dark rounded-lg overflow-hidden">
              <button
                onClick={() => onToggleUrl(index)}
                className="w-full flex items-center text-left p-4 hover:bg-border-dark/50 transition-colors"
                aria-expanded={isExpanded}
              >
                {visuals.icon}
                <div className="flex-grow min-w-0 ml-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-text-body truncate" title={url.url}>{url.url}</p>
                    <div className="flex items-center flex-shrink-0 ml-4">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${visuals.colorClass}`}>{visuals.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="w-full bg-border-dark rounded-full h-1.5 mr-3">
                      <div className={`h-1.5 rounded-full ${progressBarColor}`} style={{ width: `${scorePercentage}%` }} />
                    </div>
                    <span className="text-sm font-mono font-bold text-text-muted-1">{scorePercentage}</span>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-2xl text-text-muted-2 transition-transform duration-300 ml-4 ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
              </button>
              {isExpanded && (
                <div className="px-6 pb-4 pt-2 border-t border-border-dark bg-secondary-bg/20 animate-fade-in-down space-y-4">
                  <div className="flex items-center justify-between gap-4 p-2 bg-primary-bg rounded-md border border-border-dark">
                    <code className="text-text-body break-all flex-grow">{url.url}</code>
                    <button
                      onClick={() => onCopyUrl(url.url, index)}
                      className="p-1.5 rounded-md hover:bg-border-dark text-text-muted-2 hover:text-text-body transition-colors"
                      aria-label="Copy URL"
                    >
                      {isCopied ? (
                        <span className="material-symbols-outlined text-base text-green-400">check</span>
                      ) : (
                        <span className="material-symbols-outlined text-base">content_copy</span>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-semibold text-text-muted-2 uppercase tracking-wider mb-2">Verdict Rationale</h5>
                      <p className="text-base text-text-muted-1">{url.verdictReason}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-text-muted-2 uppercase tracking-wider mb-2">Detailed Analysis</h5>
                      <p className="text-base text-text-muted-1">{url.detailedAnalysis}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border-dark">
                    <div>
                      <h5 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2">Negative Signals</h5>
                      {url.negativeSignals.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1 text-base text-text-muted-1">
                          {url.negativeSignals.map((signal, i) => <li key={i}>{signal}</li>)}
                        </ul>
                      ) : (
                        <p className="text-sm text-text-muted-2 italic">No negative signals found.</p>
                      )}
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-2">Positive Signals</h5>
                      {url.positiveSignals.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1 text-base text-text-muted-1">
                          {url.positiveSignals.map((signal, i) => <li key={i}>{signal}</li>)}
                        </ul>
                      ) : (
                        <p className="text-sm text-text-muted-2 italic">No positive signals found.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    ) : (
      <NoDataMessage title="No URLs Found" message="The analysis did not find any hyperlinks in the email's body or headers." />
    )}
  </div>
);
