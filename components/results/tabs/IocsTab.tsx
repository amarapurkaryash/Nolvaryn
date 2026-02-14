import React from 'react';
import { AnalysisResult, AnalyzedEmail, AnalyzedDomain, DomainIndicatorType, EmailIndicatorType } from '../../../types';
import { CopyButton, NoDataMessage, TabSummary } from '../shared';

export const IocsTab: React.FC<{ result: AnalysisResult }> = ({ result }) => {
  const otherIndicatorsCount =
    (Array.isArray(result.indicators?.domains) ? result.indicators.domains.length : 0) +
    (Array.isArray(result.indicators?.emails) ? result.indicators.emails.length : 0);

  const groupedEmails = React.useMemo(() => {
    return (Array.isArray(result.indicators?.emails) ? result.indicators.emails : []).reduce((acc, email) => {
      (acc[email.type] = acc[email.type] || []).push(email);
      return acc;
    }, {} as Record<EmailIndicatorType, AnalyzedEmail[]>);
  }, [result.indicators?.emails]);

  const groupedDomains = React.useMemo(() => {
    return (Array.isArray(result.indicators?.domains) ? result.indicators.domains : []).reduce((acc, domain) => {
      (acc[domain.type] = acc[domain.type] || []).push(domain);
      return acc;
    }, {} as Record<DomainIndicatorType, AnalyzedDomain[]>);
  }, [result.indicators?.domains]);

  const emailCategories: { type: EmailIndicatorType; title: string; icon: React.ReactNode }[] = [
    { type: 'sender', title: 'Sender', icon: <span className="material-symbols-outlined text-xl text-accent-secondary">send</span> },
    { type: 'recipient', title: 'Recipient(s)', icon: <span className="material-symbols-outlined text-xl text-accent-secondary">inbox</span> },
    { type: 'reply-to', title: 'Reply-To Address', icon: <span className="material-symbols-outlined text-xl text-accent-secondary">reply</span> },
    { type: 'mentioned-in-body', title: 'Mentioned in Body', icon: <span className="material-symbols-outlined text-xl text-accent-secondary">description</span> },
  ];

  const domainCategories: { type: DomainIndicatorType; title: string; icon: React.ReactNode }[] = [
    { type: 'sending-domain', title: 'Sending Domain', icon: <span className="material-symbols-outlined text-xl text-accent-secondary">send</span> },
    { type: 'mail-server-hop', title: 'Mail Server Hops', icon: <span className="material-symbols-outlined text-xl text-accent-secondary">dns</span> },
    { type: 'linked-in-url', title: 'Domains in URLs', icon: <span className="material-symbols-outlined text-xl text-accent-secondary">link</span> },
    { type: 'mentioned-in-body', title: 'Mentioned in Body', icon: <span className="material-symbols-outlined text-xl text-accent-secondary">description</span> },
  ];

  return (
    <div className="animate-fade-in">
      <TabSummary>A comprehensive list of all Indicators of Compromise (IOCs) other than IP addresses. This includes all extracted email addresses and domains, categorized by their role and context within the email.</TabSummary>
      {otherIndicatorsCount > 0 ? (
        <div className="space-y-8">
          <section className="space-y-4">
            <h4 className="text-lg font-bold text-text-heading flex items-center"><span className="material-symbols-outlined text-2xl mr-3 text-accent-primary">mail</span> Email Indicators</h4>
            {(Array.isArray(result.indicators?.emails) ? result.indicators.emails : []).length > 0 ? (
              emailCategories.map(category => (
                groupedEmails[category.type]?.length > 0 && (
                  <div key={category.type}>
                    <div className="flex items-center mb-3">
                      {category.icon}
                      <h5 className="text-md font-semibold text-text-body ml-2">{category.title}</h5>
                    </div>
                    <div className="space-y-2">
                      {groupedEmails[category.type].map((item, index) => (
                        <div key={index} className="p-3 bg-primary-bg border border-border-dark rounded-lg">
                          <div className="flex items-center justify-between gap-2">
                            <code className="text-text-body text-base break-all truncate">{item.email}</code>
                            <CopyButton text={item.email} />
                          </div>
                          <p className="text-base text-text-muted-1 mt-1 pl-1">{item.analysis}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))
            ) : (
              <p className="text-text-muted-1 text-sm p-4 text-center bg-primary-bg rounded-md border border-dashed border-border-dark">No email indicators found.</p>
            )}
          </section>

          <section className="space-y-4">
            <h4 className="text-lg font-bold text-text-heading flex items-center"><span className="material-symbols-outlined text-2xl mr-3 text-accent-primary">public</span> Domain Indicators</h4>
            {(Array.isArray(result.indicators?.domains) ? result.indicators.domains : []).length > 0 ? (
              domainCategories.map(category => (
                groupedDomains[category.type]?.length > 0 && (
                  <div key={category.type}>
                    <div className="flex items-center mb-3">
                      {category.icon}
                      <h5 className="text-md font-semibold text-text-body ml-2">{category.title}</h5>
                    </div>
                    <div className="space-y-2">
                      {groupedDomains[category.type].map((item, index) => (
                        <div key={index} className="p-3 bg-primary-bg border border-border-dark rounded-lg">
                          <div className="flex items-center justify-between gap-2">
                            <code className="text-text-body text-base break-all truncate">{item.domain}</code>
                            <CopyButton text={item.domain} />
                          </div>
                          <p className="text-base text-text-muted-1 mt-1 pl-1">{item.analysis}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))
            ) : (
              <p className="text-text-muted-1 text-sm p-4 text-center bg-primary-bg rounded-md border border-dashed border-border-dark">No domain indicators found.</p>
            )}
          </section>
        </div>
      ) : (
        <NoDataMessage message="No email or domain indicators of compromise were found." title="No IOCs Found" />
      )}
    </div>
  );
};
