import React from 'react';
import { AnalysisResult } from '../../../types';
import { TabSummary } from '../shared';

export const RawTab: React.FC<{ result: AnalysisResult }> = ({ result }) => (
  <div className="animate-fade-in">
    <TabSummary>The complete, unmodified source code of the email in .eml format. This is useful for manual, in-depth technical analysis.</TabSummary>
    <div className="flex justify-between items-center mb-2">
      <h4 className="text-lg font-semibold text-text-heading">.eml Source</h4>
      <button
        onClick={() => navigator.clipboard.writeText(result.rawEml || '')}
        className="flex items-center text-sm px-3 py-1.5 bg-accent-primary/80 text-text-heading font-semibold rounded-md hover:bg-accent-primary transition-colors duration-300"
      >
        <span className="material-symbols-outlined text-base mr-2">content_copy</span>
        Copy Source
      </button>
    </div>
    <pre className="w-full bg-primary-bg p-4 rounded-md border border-border-dark text-sm text-text-muted-1 whitespace-pre-wrap break-words">
      <code>{result.rawEml}</code>
    </pre>
  </div>
);
