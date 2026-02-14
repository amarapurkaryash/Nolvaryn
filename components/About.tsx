import React from 'react';

const AboutSection: React.FC<{ title: string; icon: string; children: React.ReactNode; noPadding?: boolean }> = ({ title, icon, children, noPadding = false }) => (
    <div className={`bg-secondary-bg rounded-lg border border-border-dark animate-fade-in-down mb-8 ${noPadding ? '' : 'p-6'}`}>
        <div className={noPadding ? 'p-6 pb-2' : ''}>
            <div className="flex items-center mb-4">
                <span className="material-symbols-outlined text-3xl text-accent-primary">{icon}</span>
                <h2 className="text-2xl font-bold text-text-heading ml-3">{title}</h2>
            </div>
        </div>
        <div className={`text-lg text-text-muted-1 space-y-4 leading-relaxed ${noPadding ? 'px-6 pb-6' : ''}`}>
            {children}
        </div>
    </div>
);

const TimelineItem: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <li className="mb-10 ml-8">            
        <span className="absolute flex items-center justify-center w-10 h-10 bg-secondary-bg rounded-full -left-5 ring-4 ring-secondary-bg border border-border-dark">
            <span className="material-symbols-outlined text-2xl text-accent-secondary">{icon}</span>
        </span>
        <h3 className="flex items-center mb-1 text-xl font-semibold text-text-body">{title}</h3>
        <p className="mb-4 text-base font-normal text-text-muted-1">{children}</p>
    </li>
);

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <h1 className="text-4xl font-extrabold text-text-heading text-center mb-10">About Nolvaryn</h1>

      <AboutSection title="Our Mission" icon="rocket_launch">
        <p>
            Our mission is to democratize email security analysis. In a world where phishing attacks are increasingly sophisticated, Nolvaryn provides a free, powerful, and accessible tool for anyone—from individuals to security professionals—to quickly assess email threats and protect themselves from digital harm.
        </p>
      </AboutSection>

      <AboutSection title="How It Works" icon="settings_suggest" noPadding>
        <div className="p-6 pt-0">
          <ol className="relative border-l border-border-dark">                  
              <TimelineItem icon="upload_file" title="1. Upload">
                  You provide a raw <code className="bg-primary-bg text-accent-secondary px-1.5 py-0.5 rounded-md text-base">.eml</code> file, the standard format for single email messages.
              </TimelineItem>
              <TimelineItem icon="rule" title="2. Pre-Analysis">
                  The application performs initial, deterministic checks, extracting key indicators like URLs and calculating the file's hash for integrity.
              </TimelineItem>
              <TimelineItem icon="auto_awesome" title="3. AI Deep Dive">
                  The file content and pre-analysis data are sent to Google's Gemini AI model for a deep forensic analysis based on a specialized cybersecurity prompt.
              </TimelineItem>
              <TimelineItem icon="travel_explore" title="4. Data Enrichment">
                  Key indicators, such as IP addresses, are enriched with external data sources to provide geolocation and network information.
              </TimelineItem>
              <TimelineItem icon="summarize" title="5. Report Generation">
                  All analyzed data is compiled into a detailed, interactive report, complete with a risk score, identified threat tactics, and actionable recommendations.
              </TimelineItem>
          </ol>
        </div>
      </AboutSection>
      
    </div>
  );
};