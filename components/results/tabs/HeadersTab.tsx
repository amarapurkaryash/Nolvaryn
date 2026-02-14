import React from 'react';
import { AnalysisResult } from '../../../types';
import { InfoButton, TabSummary, getAuthStatusVisuals } from '../shared';

const authProtocolInfo = {
  spf: "Sender Policy Framework (SPF) prevents domain spoofing by verifying that the sending IP is authorized by the domain's owner. A 'Pass' means it's authorized; 'Fail' means it's not.",
  dkim: "DomainKeys Identified Mail (DKIM) adds a digital signature to emails, allowing the receiver to verify that the message was sent from an authorized mail server and that its content hasn't been tampered with.",
  dmarc: "Domain-based Message Authentication, Reporting, and Conformance (DMARC) tells receiving mail servers what to do with emails that fail SPF or DKIM checks (e.g., reject them or quarantine them). It aligns SPF and DKIM results.",
};

export const HeadersTab: React.FC<{ result: AnalysisResult }> = ({ result }) => (
  <div className="animate-fade-in">
    <TabSummary>A forensic breakdown of the email's technical headers. This includes a trace of the delivery path (Received hops) and a detailed analysis of email authentication protocols like SPF, DKIM, and DMARC.</TabSummary>
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-text-heading mb-4">Authentication Analysis</h4>
        <div className="space-y-4">
          {[
            { title: 'SPF', fullName: 'Sender Policy Framework', data: result.headerAnalysis?.spfResult, info: authProtocolInfo.spf },
            { title: 'DKIM', fullName: 'DomainKeys Identified Mail', data: result.headerAnalysis?.dkimResult, info: authProtocolInfo.dkim },
            { title: 'DMARC', fullName: 'Domain-based Message Authentication, Reporting, and Conformance', data: result.headerAnalysis?.dmarcResult, info: authProtocolInfo.dmarc },
          ].map((auth, index) => {
            const visuals = getAuthStatusVisuals(auth.data?.status);
            return (
              <div key={index} className={`p-4 rounded-lg border border-border-dark border-l-4 transition-colors ${visuals.borderColor} ${visuals.cardBgColor}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center">
                    {visuals.icon}
                    <h5 className="text-md font-bold text-text-heading ml-3">{auth.title}</h5>
                    <p className="text-sm text-text-muted-1 ml-2 hidden sm:block">- {auth.fullName}</p>
                    <InfoButton text={auth.info} />
                  </div>
                  <span className={`self-center px-2.5 py-1 text-sm font-semibold rounded-full capitalize ${visuals.badgeColor}`}>
                    {auth.data?.status ?? 'N/A'}
                  </span>
                </div>
                <div className="mt-3 pl-9">
                  <h6 className="text-sm font-semibold text-text-muted-2 uppercase tracking-wider mb-1">Explanation</h6>
                  <p className="text-base text-text-muted-1 leading-relaxed">{auth.data?.explanation ?? 'N/A'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-text-heading mb-3">Received Path (Bottom to Top)</h4>
        {(Array.isArray(result.headerAnalysis?.receivedPath) ? result.headerAnalysis?.receivedPath : []).length > 0 ? (
          <ol className="relative border-l border-border-dark ml-2">
            {(Array.isArray(result.headerAnalysis?.receivedPath) ? result.headerAnalysis?.receivedPath : []).map((hop, index) => (
              <li key={index} className="mb-6 ml-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-secondary-bg rounded-full -left-3 ring-4 ring-secondary-bg">
                  <span className="material-symbols-outlined text-base text-text-muted-2">dns</span>
                </span>
                <div className="p-4 bg-primary-bg border border-border-dark rounded-lg">
                  <p className="text-sm text-text-muted-2 mb-2">{hop.timestamp}</p>
                  <div className="text-base space-y-2">
                    <p><strong className="font-semibold text-text-muted-1">From:</strong> <code className="text-text-body break-all">{hop.from}</code></p>
                    <p><strong className="font-semibold text-text-muted-1">By:</strong> <code className="text-text-body break-all">{hop.by}</code></p>
                    <p><strong className="font-semibold text-text-muted-1">Protocol:</strong> <span className="text-text-body">{hop.protocol}</span></p>
                  </div>
                  <p className="mt-3 text-base text-amber-300/80 p-2 bg-amber-500/10 border-l-2 border-amber-400 rounded-r-md leading-relaxed">
                    {hop.analysis}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="pl-2">
            <p className="text-sm text-text-muted-1 p-4 bg-primary-bg border border-dashed border-border-dark rounded-md">No delivery path information (Received headers) was found or could be parsed from the email.</p>
          </div>
        )}
      </div>
    </div>
  </div>
);
