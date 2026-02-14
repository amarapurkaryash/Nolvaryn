import React from 'react';

const StepCard: React.FC<{ title: string; step: number; icon: string; children: React.ReactNode }> = ({ title, step, icon, children }) => (
    <div className="relative pl-16">
        <div className="absolute left-0 top-0 flex items-center justify-center w-12 h-12 rounded-full bg-secondary-bg border-2 border-accent-primary/50">
            <span className="material-symbols-outlined text-3xl text-accent-primary">{icon}</span>
        </div>
        <div className="absolute left-6 top-14 bottom-0 w-px bg-border-dark"></div>
        
        <p className="text-sm font-bold text-accent-secondary tracking-wider mb-1">STEP {step}</p>
        <h3 className="text-2xl font-bold text-text-heading mb-3">{title}</h3>
        <div className="text-lg text-text-muted-1 space-y-4 leading-relaxed pb-12">
            {children}
        </div>
    </div>
);


export const HowToUse: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <h1 className="text-4xl font-extrabold text-text-heading text-center mb-16">How To Use Nolvaryn</h1>
      <div className="relative">
        <StepCard title="Obtain the .eml File" step={1} icon="file_download">
          <p>
            To begin, you need the suspicious email saved as an <code className="bg-primary-bg text-accent-secondary px-1.5 py-0.5 rounded-md text-base">.eml</code> file. This format contains the email's raw source code, which is essential for a deep analysis.
          </p>
          <div className="bg-primary-bg p-4 rounded-lg border border-border-dark mt-4">
              <h4 className="font-semibold text-text-body mb-2">Common Email Clients:</h4>
              <ul className="list-disc list-inside space-y-2 pl-2 text-base">
                <li><strong>Gmail:</strong> Open the email, click the three-dot menu icon (More), and select "Download message".</li>
                <li><strong>Outlook (Desktop App):</strong> Open the email in a new window, then go to File &gt; Save As, and choose "Outlook Message Format - Unicode (*.msg)" or another raw format. Some versions allow direct "Save as .eml".</li>
                 <li><strong>Apple Mail:</strong> Select the email, then go to File &gt; Save As, and choose "Raw Message Source" from the format dropdown.</li>
                <li><strong>Outlook (Web):</strong> Open the email, click the three-dot menu, go to 'View', and then 'View message details'. Copy the entire content and paste it into a plain text file, saving it with a <code className="bg-secondary-bg text-accent-secondary px-1 py-0.5 rounded-md text-sm">.eml</code> extension.</li>
              </ul>
          </div>
        </StepCard>

        <StepCard title="Upload and Analyze" step={2} icon="cloud_upload">
            <p>
                Navigate to the Nolvaryn homepage. You can either drag and drop your <code className="bg-primary-bg text-accent-secondary px-1.5 py-0.5 rounded-md text-base">.eml</code> file directly onto the upload area or click it to browse your computer and select the file. The analysis will begin automatically.
            </p>
        </StepCard>

        <StepCard title="Review the Report" step={3} icon="plagiarism">
            <p>
                Once the analysis is complete, you'll see a comprehensive, multi-tab report. Start with the <strong>Dashboard</strong> for the overall risk score and key takeaways. Use the tabs to dig deeper into specific areas like <strong>Threat Tactics (MITRE ATT&CK®)</strong>, <strong>URLs</strong>, <strong>Attachments</strong>, and <strong>IP Geolocation</strong>.
            </p>
        </StepCard>
        
        <StepCard title="Take Action" step={4} icon="task_alt">
            <p>
                Based on the findings, consult the <strong>Recommended Actions</strong> tab for clear, actionable steps. If the email is deemed high-risk, these actions will guide you on how to safely handle the threat, such as deleting the email, blocking the sender, and reporting it to the appropriate authorities.
            </p>
        </StepCard>
      </div>

      <div className="mt-8 bg-secondary-bg p-6 rounded-lg border border-border-dark flex items-start">
        <div>
            <h3 className="text-xl font-bold text-amber-300">Pro Tip</h3>
            <p className="text-lg text-text-muted-1 mt-2 leading-relaxed">
                For the most accurate analysis, always use the "Download message" or "Save as Raw Source" option if available. Copy-pasting can sometimes miss critical header information that is vital for tracing an email's origin and authenticity.
            </p>
        </div>
      </div>
    </div>
  );
};