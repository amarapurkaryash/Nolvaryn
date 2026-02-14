import React, { useState } from 'react';

const FaqItem: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-border-dark">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-5 px-2 hover:bg-secondary-bg/50 focus:outline-none"
                aria-expanded={isOpen}
            >
                <h3 className="text-lg font-semibold text-text-heading">{title}</h3>
                <span className={`material-symbols-outlined text-3xl text-accent-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>
            {isOpen && (
                <div className="px-2 pb-5 animate-fade-in-down">
                    <div className="text-base text-text-muted-1 space-y-4 leading-relaxed border-l-2 border-accent-primary/50 pl-4">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

export const FAQ: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
            <h1 className="text-4xl font-extrabold text-text-heading text-center mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-text-muted-1 text-center mb-10">
                Have questions? We've got answers. If you can't find what you're for, feel free to reach out.
            </p>

            <div className="bg-secondary-bg p-6 rounded-lg border border-border-dark">
                <FaqItem title="What is Nolvaryn?">
                    <p>
                        Nolvaryn is an advanced, AI-powered security tool designed to instantly analyze suspicious email files (<code className="bg-primary-bg text-accent-secondary px-1.5 py-0.5 rounded-md text-base">.eml</code>) and determine if they are phishing attempts. It provides a comprehensive breakdown of potential threats, helping users and security professionals make informed decisions quickly.
                    </p>
                </FaqItem>
                <FaqItem title="How is my data handled? Is it private?">
                    <p>
                        Your privacy is a top priority. Nolvaryn processes your uploaded email on our serverless backend (hosted on Vercel) to run the analysis. We do not store or log your email content or analysis report; the data is processed in memory and discarded after the response is returned to your browser.
                    </p>
                    <p>
                        To perform its comprehensive analysis, the app securely interacts with two specialized, third-party services:
                    </p>
                    <ol className="list-decimal list-inside space-y-3 pl-2">
                        <li>
                            <strong>Google Gemini API:</strong> The full content of your uploaded <code className="bg-primary-bg text-accent-secondary px-1 py-0.5 rounded-md text-sm">.eml</code> file is sent for the core AI security analysis. This is essential for the AI to understand the email's context, headers, and content.
                        </li>
                        <li>
                            <strong>ipwho.is Service:</strong> Any public IP addresses found within the email are sent to this service to retrieve geolocation data (e.g., city, country, ISP). <strong>Only the IP addresses are sent</strong>, not the rest of the email content.
                        </li>
                    </ol>
                    <p>
                        The complete analysis report you see is generated and held only in your browser's memory and is permanently deleted when you close the tab or start a new analysis. For full details on these third-party services, please see the <strong>Privacy Policy</strong> page.
                    </p>
                </FaqItem>
                <FaqItem title="Why am I getting an error when I try to analyze a file?">
                    <p>
                        This application requires you to use your own free Google Gemini API key to function. All analysis requests are made using the key you provide.
                    </p>
                     <p>
                        If you see an error, it is likely due to one of the following reasons:
                    </p>
                    <ul className="list-disc list-inside space-y-2 pl-2">
                        <li>You have not set your API key yet.</li>
                        <li>The API key you provided is invalid or has been copied incorrectly.</li>
                        <li>Your personal API key has reached its own free-tier usage limits (quota) set by Google.</li>
                    </ul>
                    <p>
                        <strong>How to Fix:</strong> Click the <span className="inline-flex items-center"><span className="material-symbols-outlined text-base mx-1">vpn_key</span></span> icon in the top-right navigation bar to enter a valid Gemini API key. Your key is stored in your browser's session storage for the duration of your visit. When you run an analysis, the key is sent to our serverless backend so it can call Gemini on your behalf. We do not store or log your key. You can get a free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-secondary hover:underline">Google AI Studio</a>.
                    </p>
                </FaqItem>
                <FaqItem title="Can Nolvaryn analyze emails directly from my inbox?">
                     <p>
                        No, not at this time. For security and privacy reasons, Nolvaryn requires you to manually download the email as an <code className="bg-primary-bg text-accent-secondary px-1.5 py-0.5 rounded-md text-base">.eml</code> file and upload it. This ensures that the application never has access to your email account credentials or inbox.
                    </p>
                </FaqItem>
                <FaqItem title="How does attachment analysis work? What is actually scanned?">
                    <p>
                        This is an excellent question that touches on an important security aspect of Nolvaryn. The tool analyzes attachments that are <strong>embedded within the <code>.eml</code> file itself</strong>. Here’s a detailed breakdown of what that means:
                    </p>
                    <ul className="list-disc list-inside space-y-2 pl-2">
                        <li>
                            <strong>Metadata-Only Analysis:</strong> When you upload an <code>.eml</code> file, the tool reads its source code. It looks for attachment information like the <strong>filename</strong> (e.g., <code>"invoice.pdf"</code>), <strong>file type</strong> (MIME type, e.g., <code>"application/pdf"</code>), and <strong>size</strong>. The AI's analysis is based purely on this metadata.
                        </li>
                        <li>
                            <strong>No Content Scanning:</strong> Nolvaryn <strong>does not download, open, execute, or scan the actual content</strong> of any attached file. In a job application example, the tool would see that a file named <code>"resume.pdf"</code> is attached, but it will not open or read the PDF itself.
                        </li>
                        <li>
                            <strong>Risk Assessment Based on Type:</strong> The security warning provided is an inference based on the file's characteristics. For example, a file named <code>"payment_update.exe"</code> would be flagged as extremely high-risk because executable files are a common way to deliver malware. A macro-enabled Word document (<code>.docm</code>) would also receive a high-risk warning. A standard image file (<code>.jpg</code>) would receive a general caution.
                        </li>
                        <li>
                            <strong>Why this approach?</strong> This is a deliberate security design choice. By never actually handling or executing the content of attachments, Nolvaryn ensures that the analysis process itself cannot be compromised by a malicious file. It provides a safe "first look" at the potential threat an attachment poses without ever touching the payload.
                        </li>
                    </ul>
                    <p>
                        In short, the "Attachments" section tells you <strong>what attachments are present and the potential risk they represent based on their type and name</strong>, not an analysis of their internal content.
                    </p>
                </FaqItem>
                <FaqItem title="What is an .eml file?">
                    <p>
                        An <code className="bg-primary-bg text-accent-secondary px-1.5 py-0.5 rounded-md text-base">.eml</code> file is a standard format for saving a single email message. It contains the full, raw content of the email, including the headers, body, and any attachments, exactly as it was received by the mail server. This raw data is essential for a thorough forensic analysis.
                    </p>
                </FaqItem>
                <FaqItem title="How accurate is the AI analysis?">
                    <p>
                        The analysis is powered by Google's state-of-the-art Gemini model, which is highly capable of identifying complex phishing techniques. However, no automated system is perfect. Nolvaryn should be used as a powerful advisory tool to augment your own judgment. Always treat unexpected emails with caution, even if they receive a low risk score.
                    </p>
                </FaqItem>
                <FaqItem title="Why do I get the same result for a file, but the report disappears if I refresh the page?">
                    <p>
                        This excellent question highlights two core principles of Nolvaryn: <strong>ephemeral data (for privacy)</strong> and <strong>deterministic analysis (for reliability)</strong>. They seem contradictory, but here's how they work together:
                    </p>
                    <ol className="list-decimal list-inside space-y-4 pl-2">
                        <li>
                            <strong className="text-text-body">The Web UI is Temporary:</strong> Everything you see on the screen after an analysis—the risk score, the charts, the detailed tabs—is what we call the "report." This report is returned to your browser and held only in temporary memory for your current session. It is <strong>not saved to any server or database</strong>. When you refresh the page, close the tab, or start a new analysis, that report data is permanently deleted from your browser's memory. This is a key privacy feature.
                        </li>
                        <li>
                            <strong className="text-text-body">The Analysis is Repeatable:</strong> The reason you get an identical report when you re-upload the same file is because our AI process is <strong>deterministic</strong>. Think of it like a calculator: 2+2 will always give you 4. Similarly, given the exact same <code className="bg-primary-bg text-accent-secondary px-1.5 py-0.5 rounded-md text-base">.eml</code> file as input, our AI will always follow the same steps and produce the exact same analysis as output.
                        </li>
                    </ol>
                    <p className="mt-4">
                        <strong>In summary:</strong> The report isn't being retrieved from storage when you re-analyze a file; a brand new, identical report is being perfectly <strong>re-created</strong> from scratch and displayed in the web UI. The consistency comes from the reliable, repeatable nature of the analysis, while your privacy is protected because the result is immediately discarded after you're done viewing it.
                    </p>
                </FaqItem>
                <FaqItem title="Why is some IP geolocation data missing from my report?">
                    <p>
                        Nolvaryn uses the ipwho.is service for IP address geolocation. This service has a free tier with usage limits. If data is missing, it could be because:
                    </p>
                    <ul className="list-disc list-inside space-y-2 pl-2">
                        <li>The service's rate limit was temporarily reached during high traffic.</li>
                        <li>The IP is a private/internal address (e.g., <code className="bg-primary-bg text-accent-secondary px-1 py-0.5 rounded-md text-sm">192.168.1.1</code>) and has no public location.</li>
                        <li>The IP is very new, obscure, or does not have public geolocation data associated with it.</li>
                    </ul>
                     <p>
                        Even if some geolocation data is missing, the rest of the email analysis will still be complete and valid.
                    </p>
                </FaqItem>
                <FaqItem title="If the tool says an email is safe but it's malicious, are you responsible?">
                    <p>
                        No. As stated in our disclaimer, Nolvaryn is an advisory tool intended for informational purposes and is not a substitute for professional cybersecurity judgment or commercial security solutions. AI models can make mistakes, and attackers are constantly creating new techniques.
                    </p>
                     <p>
                        You are solely responsible for your own actions and digital safety. If an email feels suspicious, you should treat it as such, regardless of the tool's score. Never rely on a single tool for your security.
                    </p>
                </FaqItem>
            </div>
        </div>
    );
};
