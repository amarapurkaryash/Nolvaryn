import React from 'react';

const FeatureCard: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-secondary-bg p-6 rounded-lg border border-border-dark animate-fade-in-down h-full transition-all duration-300 hover:border-accent-primary/50 hover:shadow-2xl hover:shadow-accent-primary/10 hover:-translate-y-1">
        <div className="flex items-center mb-4">
            <span className="material-symbols-outlined text-3xl text-accent-primary">{icon}</span>
            <h3 className="text-2xl font-bold text-text-heading ml-3">{title}</h3>
        </div>
        <div className="text-lg text-text-muted-1 space-y-4 leading-relaxed">
            {children}
        </div>
    </div>
);

export const Features: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-fade-in">
      <h1 className="text-4xl font-extrabold text-text-heading text-center mb-10">Key Features of Nolvaryn</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FeatureCard title="AI-Powered Deep Analysis" icon="auto_awesome">
          <p>
            Nolvaryn utilizes Google's advanced Gemini model to perform a deep forensic analysis of email files. It goes beyond simple keyword matching to understand context, identify sophisticated social engineering tactics, and analyze technical headers for signs of spoofing or misconfiguration.
          </p>
        </FeatureCard>

        <FeatureCard title="Interactive Geolocation Mapping" icon="public">
          <p>
            Visualize the email's journey across the globe. Nolvaryn parses the email headers to trace the delivery path, enriches IP addresses with geolocation data, and plots them on an interactive world map. This helps identify unusual or suspicious routing patterns at a glance.
          </p>
        </FeatureCard>

        <FeatureCard title="MITRE ATT&CK® Framework Integration" icon="flag">
          <p>
            For security professionals, context is key. Nolvaryn automatically maps the characteristics of a potential phishing attempt to the relevant techniques in the MITRE ATT&CK® framework, such as <code className="bg-primary-bg text-accent-secondary px-1.5 py-0.5 rounded-md text-base">T1566.002 (Spearphishing Link)</code>.
          </p>
        </FeatureCard>

        <FeatureCard title="Comprehensive IOC Extraction" icon="fingerprint">
          <p>
            Quickly gather all critical security indicators. Nolvaryn extracts every IP address, domain, and email address from both headers and body, categorizes them by context, and provides a preliminary analysis, ready for ingestion into other security tools.
          </p>
        </FeatureCard>

         <FeatureCard title="Detailed & Actionable Reporting" icon="summarize">
          <p>
            Understand threats instantly with a clear, multi-tab interface. The dashboard provides a high-level risk score, while dedicated tabs allow you to dive deep into URLs, attachments, headers, and more. Comprehensive Markdown and JSON reports can be generated for archiving or sharing.
          </p>
        </FeatureCard>

        <FeatureCard title="Deterministic & Repeatable" icon="published_with_changes">
          <p>
            Consistency is crucial for analysis. Nolvaryn is configured to provide deterministic results, meaning the same email file will always produce the same analysis and risk score, ensuring reliable and repeatable assessments.
          </p>
        </FeatureCard>
      </div>
    </div>
  );
};