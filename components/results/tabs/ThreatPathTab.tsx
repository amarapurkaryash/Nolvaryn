import React from 'react';
import { AnalysisResult } from '../../../types';
import { Section, TabSummary } from '../shared';

const ThreatPathNode: React.FC<{ icon: string; title: string; children: React.ReactNode; nodeColorClass: string }> = ({ icon, title, children, nodeColorClass }) => (
  <div className="w-full">
    <div className="relative bg-primary-bg p-5 rounded-lg border border-border-dark h-full flex flex-col shadow-lg">
      <div className={`absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center border-4 border-secondary-bg ${nodeColorClass}`}>
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <h4 className="text-lg font-semibold text-text-heading mt-8 text-center">{title}</h4>
      <div className="mt-4 text-center text-sm text-text-muted-1 space-y-2 flex-grow flex flex-col justify-center">
        {children}
      </div>
    </div>
  </div>
);

const ThreatPathArrow: React.FC = () => (
  <div className="flex-none flex items-center justify-center h-16 text-text-muted-2">
    <span className="material-symbols-outlined text-4xl">arrow_downward</span>
  </div>
);

const ThreatPath: React.FC<{ result: AnalysisResult }> = ({ result }) => {
  const nodes = React.useMemo(() => {
    const pathNodes: Array<{ icon: string; title: string; color: string; content: React.ReactNode }> = [];

    const fromAddress = result.emailInfo.from;
    const auth = result.headerAnalysis;
    const authFailed = auth?.spfResult?.status?.toLowerCase() !== 'pass' ||
      auth?.dkimResult?.status?.toLowerCase() !== 'pass' ||
      auth?.dmarcResult?.status?.toLowerCase() !== 'pass';
    const authStatus = authFailed
      ? { text: 'Authentication Failed', color: 'bg-red-500/20 text-red-400' }
      : { text: 'Authentication Passed', color: 'bg-green-500/20 text-green-400' };

    pathNodes.push({
      icon: 'person', title: 'Source & Origin', color: 'bg-sky-500 text-white',
      content: (
        <>
          <div>
            <div className="text-xs font-semibold text-text-muted-2">Claimed Sender</div>
            <code className="text-text-body truncate block" title={fromAddress}>{fromAddress}</code>
          </div>
          <div className={`mt-3 text-xs font-bold px-2 py-1 rounded-full inline-block ${authStatus.color}`}>
            {authStatus.text}
          </div>
        </>
      ),
    });

    const riskyUrl = (result.urls || []).find(u => u.verdict === 'Caution' || u.verdict === 'Suspicious');
    const riskyAttachment = (result.attachments || []).find(a =>
      a.warning.toLowerCase().includes('high-risk') ||
      a.warning.toLowerCase().includes('malicious') ||
      a.warning.toLowerCase().includes('executable')
    );
    const hasSocialEngineering = (result.mitreAttackTechniques || []).length > 0;

    if (!riskyUrl && !riskyAttachment && !hasSocialEngineering) return pathNodes;

    let vectorIcon = 'psychology';
    let vectorTitle = 'Social Engineering';
    let vectorContent: React.ReactNode = <p>The email uses psychological manipulation (e.g., urgency, authority) to influence the user.</p>;

    if (riskyUrl) {
      vectorIcon = 'link'; vectorTitle = 'Malicious Link';
      vectorContent = (
        <>
          <p>A suspicious link is the primary delivery method.</p>
          <code className="block mt-2 text-xs text-accent-secondary truncate" title={riskyUrl.url}>{riskyUrl.url}</code>
          <p className="mt-1 text-red-400 text-xs font-semibold">{riskyUrl.negativeSignals[0] || 'Multiple red flags'}</p>
        </>
      );
    } else if (riskyAttachment) {
      vectorIcon = 'attachment'; vectorTitle = 'Malicious Attachment';
      vectorContent = (
        <>
          <p>A high-risk attachment is used to deliver the payload.</p>
          <code className="block mt-2 text-xs text-accent-secondary truncate">{riskyAttachment.filename}</code>
          <p className="mt-1 text-red-400 text-xs font-semibold">{riskyAttachment.warning}</p>
        </>
      );
    }

    pathNodes.push({
      icon: vectorIcon, title: vectorTitle, color: 'bg-purple-500 text-white',
      content: vectorContent,
    });

    const techniques = result.mitreAttackTechniques || [];
    const hasCredentialTheft = techniques.some(t => t.techniqueId === 'T1598' || t.techniqueId === 'T1566.002');
    const hasMalware = techniques.some(t => t.techniqueId === 'T1566.001' || t.techniqueId === 'T1204.002');
    const hasFinancialFraud = result.keyFindings.some(f => f.finding.toLowerCase().includes('invoice') || f.finding.toLowerCase().includes('payment'));

    if (!hasCredentialTheft && !hasMalware && !hasFinancialFraud) return pathNodes;

    let objectiveIcon = 'help_outline';
    let objectiveTitle = 'Information Gathering';
    let objectiveDescription = 'To gather information or test for a response for a future attack.';

    if (hasCredentialTheft) {
      objectiveIcon = 'password'; objectiveTitle = 'Credential Theft';
      objectiveDescription = 'To steal login credentials, financial information, or other personal data.';
    } else if (hasMalware) {
      objectiveIcon = 'bug_report'; objectiveTitle = 'Malware Deployment';
      objectiveDescription = 'To infect the user\'s system with malware, such as ransomware or spyware.';
    } else if (hasFinancialFraud) {
      objectiveIcon = 'payments'; objectiveTitle = 'Financial Fraud';
      objectiveDescription = 'To deceive the user into making unauthorized payments or financial transactions.';
    }

    pathNodes.push({
      icon: objectiveIcon, title: objectiveTitle, color: 'bg-orange-500 text-white',
      content: <p>{objectiveDescription}</p>,
    });

    pathNodes.push({
      icon: 'gpp_bad', title: 'Potential Impact', color: 'bg-red-500 text-white',
      content: (
        <ul className="list-disc list-inside space-y-1 text-left">
          <li>Account Compromise</li>
          <li>Data Exfiltration</li>
          <li>Financial Loss</li>
          <li>Malware Infection</li>
        </ul>
      ),
    });

    return pathNodes;
  }, [result]);

  return (
    <div className="flex flex-col items-center gap-4 relative px-12 w-full max-w-4xl mx-auto">
      {nodes.map((node, index) => (
        <React.Fragment key={index}>
          <ThreatPathNode icon={node.icon} title={node.title} nodeColorClass={node.color}>
            {node.content}
          </ThreatPathNode>
          {index < nodes.length - 1 && <ThreatPathArrow />}
        </React.Fragment>
      ))}
    </div>
  );
};

export const ThreatPathTab: React.FC<{ result: AnalysisResult }> = ({ result }) => (
  <div className="animate-fade-in">
    <TabSummary>This illustrates the logical flow of the potential attack, from the sender's origin and delivery vector to the attacker's objective and potential impact. It helps in understanding the 'story' of the threat.</TabSummary>
    <Section title="Threat Path" icon={<span className="material-symbols-outlined text-2xl text-accent-primary">share</span>}>
      <div className="py-8">
        <ThreatPath result={result} />
      </div>
    </Section>
  </div>
);
