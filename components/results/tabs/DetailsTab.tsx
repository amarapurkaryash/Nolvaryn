import React from 'react';
import { AnalysisResult } from '../../../types';
import { CopyButton, TabSummary } from '../shared';

export const DetailsTab: React.FC<{ result: AnalysisResult }> = ({ result }) => (
  <div className="animate-fade-in">
    <TabSummary>Basic metadata about the email, including sender, recipient, subject, and date, along with a concise, AI-generated overview of the email's content and intent.</TabSummary>
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-primary-bg p-5 rounded-lg border border-border-dark">
          <h4 className="text-lg font-semibold text-text-heading mb-4 flex items-center">
            <span className="material-symbols-outlined mr-3 text-accent-secondary">group</span>
            Participants
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex items-center text-base font-medium text-text-muted-2 mb-1">
                <span className="material-symbols-outlined text-lg mr-2 text-text-muted-1">outbox</span>
                From
              </div>
              <div className="pl-8 text-base text-text-body break-all"><code>{result.emailInfo.from || 'N/A'}</code></div>
            </div>
            <div>
              <div className="flex items-center text-base font-medium text-text-muted-2 mb-1">
                <span className="material-symbols-outlined text-lg mr-2 text-text-muted-1">inbox</span>
                To
              </div>
              <div className="pl-8 text-base text-text-body break-all"><code>{result.emailInfo.to || 'N/A'}</code></div>
            </div>
            <div>
              <div className="flex items-center text-base font-medium text-text-muted-2 mb-1">
                <span className="material-symbols-outlined text-lg mr-2 text-text-muted-1">reply</span>
                Reply-To
              </div>
              <div className="pl-8 text-base text-text-body break-all"><code>{result.emailInfo.replyTo || 'N/A'}</code></div>
            </div>
          </div>
        </div>

        <div className="bg-primary-bg p-5 rounded-lg border border-border-dark">
          <h4 className="text-lg font-semibold text-text-heading mb-4 flex items-center">
            <span className="material-symbols-outlined mr-3 text-accent-secondary">mail</span>
            Message Data
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex items-center text-base font-medium text-text-muted-2 mb-1">
                <span className="material-symbols-outlined text-lg mr-2 text-text-muted-1">subject</span>
                Subject
              </div>
              <div className="pl-8 text-base text-text-body">{result.emailInfo.subject || 'N/A'}</div>
            </div>
            <div>
              <div className="flex items-center text-base font-medium text-text-muted-2 mb-1">
                <span className="material-symbols-outlined text-lg mr-2 text-text-muted-1">schedule</span>
                Date
              </div>
              <div className="pl-8 text-base text-text-body"><code>{result.emailInfo.date || 'N/A'}</code></div>
            </div>
            <div>
              <div className="flex items-center text-base font-medium text-text-muted-2 mb-1">
                <span className="material-symbols-outlined text-lg mr-2 text-text-muted-1">verified_user</span>
                Authentication
              </div>
              <div className="pl-8 text-base text-text-body"><code>{result.emailInfo.authenticationResults || 'N/A'}</code></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary-bg p-5 rounded-lg border border-border-dark">
        <h4 className="text-lg font-semibold text-text-heading mb-3 flex items-center">
          <span className="material-symbols-outlined mr-3 text-accent-secondary">fingerprint</span>
          File Integrity
        </h4>
        <div className="flex justify-between items-center gap-4 p-3 bg-secondary-bg rounded-md">
          <div className="min-w-0">
            <div className="text-sm font-medium text-text-muted-2 mb-1">SHA-256 HASH</div>
            <code className="text-base text-accent-primary break-all truncate" title={result.emailInfo.fileHash}>{result.emailInfo.fileHash || 'N/A'}</code>
          </div>
          {result.emailInfo.fileHash && <CopyButton text={result.emailInfo.fileHash} />}
        </div>
      </div>

      <div className="bg-primary-bg p-5 rounded-lg border border-border-dark">
        <h4 className="text-lg font-semibold text-text-heading mb-3 flex items-center">
          <span className="material-symbols-outlined mr-3 text-accent-secondary">auto_awesome</span>
          AI Content Overview
        </h4>
        <div className="text-base text-text-muted-1 p-4 bg-secondary-bg rounded-md border-l-4 border-accent-primary/50 whitespace-pre-wrap leading-relaxed">
          {result.emailInfo.bodySnippet}
        </div>
      </div>
    </div>
  </div>
);
