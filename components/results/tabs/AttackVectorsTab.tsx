import React from 'react';
import { AnalysisResult } from '../../../types';
import { NoDataMessage, Section, TabSummary } from '../shared';

export const AttackVectorsTab: React.FC<{ result: AnalysisResult }> = ({ result }) => (
  <div className="animate-fade-in">
    <TabSummary>This section maps the email's characteristics to the MITRE ATT&CK® framework, a globally-recognized knowledge base of adversary tactics and techniques. This is crucial for understanding the attacker's methodology in a standardized way.</TabSummary>
    <Section title="Attack Vectors (MITRE ATT&CK®)" icon={<span className="material-symbols-outlined text-2xl text-violet-400">flag</span>}>
      {(Array.isArray(result.mitreAttackTechniques) ? result.mitreAttackTechniques : []).length > 0 ? (
        <ol className="space-y-4">
          {(Array.isArray(result.mitreAttackTechniques) ? result.mitreAttackTechniques : []).map(technique => (
            <li key={technique.techniqueId} className="p-4 bg-primary-bg rounded-lg border border-border-dark border-l-4 border-l-violet-500">
              <div className="flex items-center">
                <span className="material-symbols-outlined text-3xl flex-shrink-0 text-violet-400">flag</span>
                <div className="ml-3 min-w-0">
                  <p className="font-bold text-text-body">
                    <a
                      href={`https://attack.mitre.org/techniques/${technique.techniqueId.replace('.', '/')}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-secondary hover:underline"
                      title={`View details for ${technique.techniqueId}`}
                    >
                      {technique.techniqueId}
                    </a>
                    : <span className="font-semibold">{technique.techniqueName}</span>
                  </p>
                </div>
              </div>
              <div className="mt-4 pl-10">
                <h5 className="text-base font-semibold text-amber-300 mb-2 flex items-center">
                  <span className="material-symbols-outlined text-lg mr-2">find_in_page</span>
                  Detection Context
                </h5>
                <div className="text-base text-text-body p-3 bg-secondary-bg border-l-2 border-amber-400 rounded-r-md leading-relaxed">
                  {technique.description}
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <NoDataMessage title="No Attack Vectors Identified" message="The AI analysis did not identify any specific MITRE ATT&CK® techniques in this email." />
      )}
    </Section>
  </div>
);
