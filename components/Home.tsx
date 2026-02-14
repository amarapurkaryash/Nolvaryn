import React, { useState, useEffect } from 'react';

interface HomeProps {
    onAnalyzeClick: () => void;
}

const FeatureHighlight: React.FC<{ icon: string; title: string; description: string; delay: string }> = ({ icon, title, description, delay }) => (
    <div 
        className="bg-secondary-bg/50 backdrop-blur-lg p-6 rounded-xl border border-border-dark/50 text-left animate-fade-in transition-all duration-300 hover:border-accent-primary/50 hover:shadow-2xl hover:shadow-accent-primary/10 hover:-translate-y-1"
        style={{ animationDelay: delay, opacity: 0, animationFillMode: 'forwards' }}
    >
        <div className="flex items-center mb-3">
            <span className="material-symbols-outlined text-3xl text-accent-primary">{icon}</span>
            <h3 className="font-bold text-lg text-text-heading ml-3">{title}</h3>
        </div>
        <p className="text-text-muted-1">{description}</p>
    </div>
);

// Unified Size
const WINDOW_CLASS = "relative w-[28rem] h-80 bg-secondary-bg/95 backdrop-blur-xl border border-border-dark rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-500 ease-in-out ring-1 ring-white/5";
const HEADER_CLASS = "absolute top-0 left-0 right-0 h-10 px-4 flex items-center justify-between z-10 bg-secondary-bg/95 border-b border-border-dark/50";

// --- COMPONENTS FOR DIFFERENT STAGES ---

// 1. UPLOAD
const UploadWindow: React.FC = () => (
    <div className={WINDOW_CLASS}>
        <div className={HEADER_CLASS}>
            <div className="flex space-x-1.5"><div className="w-3 h-3 bg-red-500 rounded-full"></div><div className="w-3 h-3 bg-amber-500 rounded-full"></div><div className="w-3 h-3 bg-green-500 rounded-full"></div></div>
            <span className="text-xs text-text-muted-2 font-mono">Uploading...</span>
        </div>
        <div className="flex-grow flex flex-col items-center justify-center p-8">
            <div className="mb-8 relative group">
                <div className="w-20 h-24 border-2 border-dashed border-border-dark rounded-lg flex items-center justify-center group-hover:border-accent-primary transition-colors">
                     <span className="material-symbols-outlined text-4xl text-text-muted-2 group-hover:text-accent-primary transition-colors">upload_file</span>
                </div>
            </div>
            <div className="w-full space-y-3">
                <div className="flex justify-between text-xs font-mono text-text-muted-1">
                    <span>suspicious_email.eml</span>
                    <span className="text-accent-secondary animate-pulse">Uploading...</span>
                </div>
                <div className="h-1.5 w-full bg-primary-bg rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary animate-progress-fill-live shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
                </div>
            </div>
        </div>
    </div>
);

// 2. SCANNER
const ScannerWindow: React.FC = () => {
    const steps = ["Parsing headers...", "Extracting IOCs...", "Checking reputation...", "AI analysis initiated...", "Mapping TTPs...", "Generating report..."];
    return (
        <div className={WINDOW_CLASS}>
            <div className={HEADER_CLASS}>
                <div className="flex space-x-1.5"><div className="w-3 h-3 bg-red-500 rounded-full"></div><div className="w-3 h-3 bg-amber-500 rounded-full"></div><div className="w-3 h-3 bg-green-500 rounded-full"></div></div>
                <span className="text-xs text-accent-secondary font-mono animate-pulse">LIVE SCANNER</span>
            </div>
            <div className="flex-grow p-6 pt-12 font-mono text-xs overflow-hidden relative bg-black/20">
                <div className="absolute inset-0 top-10 p-6 log-mask">
                    <ul className="animate-log-scroll space-y-3">
                        {steps.map((s, i) => <li key={i} className="text-green-400 flex items-center"><span className="mr-2 text-[10px]">▶</span> {s}</li>)}
                        {steps.map((s, i) => <li key={`dup-${i}`} className="text-green-400 flex items-center"><span className="mr-2 text-[10px]">▶</span> {s}</li>)}
                    </ul>
                </div>
                {/* Grid Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,18,18,0)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20"></div>
            </div>
        </div>
    );
};

// 3. GENERIC RESULT TAB PREVIEW
const ResultPreviewWindow: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className={WINDOW_CLASS}>
        <div className={HEADER_CLASS}>
            <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-lg text-accent-primary">{icon}</span>
                <span className="text-sm font-bold text-text-heading tracking-wide">{title}</span>
            </div>
            <div className="flex items-center space-x-2">
                 <div className="px-2 py-0.5 rounded-full bg-border-dark/50 text-[10px] text-text-muted-2 font-mono">READ-ONLY</div>
            </div>
        </div>
        <div className="flex-grow pt-10 px-6 pb-6 flex flex-col justify-center animate-fade-in relative">
            {children}
        </div>
    </div>
);

// MOCK CONTENT FOR TABS
const TabContent: React.FC<{ type: string }> = ({ type }) => {
    switch (type) {
        case 'details': return (
            <div className="w-full bg-primary-bg rounded-lg border border-border-dark p-4 shadow-lg space-y-3">
                <div className="flex items-center space-x-3 pb-3 border-b border-border-dark/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                        S
                    </div>
                    <div>
                        <div className="text-sm font-bold text-text-heading">support@secure-bank.com</div>
                        <div className="text-xs text-text-muted-2">To: you@company.com</div>
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="text-xs text-text-muted-2 uppercase tracking-wider">Subject</div>
                    <div className="text-sm font-medium text-text-body">Urgent: Verify Your Account Activity</div>
                </div>
                <div className="pt-2 flex justify-between items-center">
                    <span className="text-xs text-text-muted-2">Oct 24, 2023 10:42 AM</span>
                    <span className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 rounded border border-red-500/20">High Priority</span>
                </div>
            </div>
        );
        case 'raw': return (
            <div className="w-full h-full bg-primary-bg rounded-lg border border-border-dark p-3 font-mono text-[9px] leading-relaxed text-gray-400 overflow-hidden relative">
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-secondary-bg border-r border-border-dark flex flex-col items-center pt-3 text-gray-600 select-none text-[8px]">
                    {Array.from({length: 18}).map((_, i) => <div key={i}>{i+1}</div>)}
                </div>
                <div className="pl-10 space-y-0.5">
                    <div><span className="text-purple-400">Return-Path:</span> &lt;bounce@attacker.net&gt;</div>
                    <div><span className="text-purple-400">Delivered-To:</span> victim@company.com</div>
                    <div><span className="text-purple-400">Received:</span> from mail.attacker.net (192.0.2.1)</div>
                    <div><span className="text-purple-400">Message-ID:</span> &lt;xyz@mail.com&gt;</div>
                    <div><span className="text-purple-400">Date:</span> Wed, 24 Oct 2023 10:42:00 +0000</div>
                    <div><span className="text-purple-400">Subject:</span> Urgent: Verify Your Account</div>
                    <div><span className="text-purple-400">From:</span> "Security Team" &lt;support@secure-bank.com&gt;</div>
                    <div><span className="text-purple-400">MIME-Version:</span> 1.0</div>
                    <div><span className="text-purple-400">Content-Type:</span> multipart/mixed; boundary="xx"</div>
                    <br/>
                    <div className="text-gray-500">--xx</div>
                    <div className="text-gray-500">Content-Type: text/html; charset="UTF-8"</div>
                    <br/>
                    <div className="text-green-700/50 break-all">PGRpdiBjbGFzcz0ibWFpbiI+...</div>
                    <div className="text-green-700/50 break-all">VHlwaWNhbCBwaGlzaGluZyB0ZXh0...</div>
                    <div className="text-green-700/50 break-all">ZnJvbSB0aGUgYm9keSBvZiB0aGUgbWFpbC4u</div>
                </div>
            </div>
        );
        case 'domains': return (
            <div className="w-full space-y-2">
                <div className="bg-primary-bg rounded-lg border border-border-dark p-2.5 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <span className="material-symbols-outlined text-text-muted-2">language</span>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-text-heading">secure-bank.com</span>
                            <span className="text-[10px] text-text-muted-2">Sender Domain</span>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded">Spoofed</span>
                </div>
                <div className="bg-primary-bg rounded-lg border border-border-dark p-2.5 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <span className="material-symbols-outlined text-text-muted-2">link</span>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-text-heading">malicious-link.net</span>
                            <span className="text-[10px] text-text-muted-2">Link Destination</span>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded">Malware</span>
                </div>
                {/* Added Safe Domain */}
                <div className="bg-primary-bg rounded-lg border border-border-dark p-2.5 flex justify-between items-center opacity-75">
                    <div className="flex items-center space-x-3">
                        <span className="material-symbols-outlined text-text-muted-2">shield</span>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-text-heading">google.com</span>
                            <span className="text-[10px] text-text-muted-2">Infrastructure</span>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">Legitimate</span>
                </div>
            </div>
        );
        case 'headers': return (
            <div className="w-full flex flex-col gap-3 h-full justify-center">
                {/* SPF: Green/Pass */}
                <div className="bg-primary-bg border border-green-500/30 rounded-lg p-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center mr-3">
                            <span className="material-symbols-outlined text-green-400 text-lg">check_circle</span>
                        </div>
                        <span className="text-sm font-bold text-text-heading">SPF</span>
                    </div>
                    <span className="text-xs font-extrabold text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">PASS</span>
                </div>
                {/* DKIM: Red/Fail */}
                <div className="bg-primary-bg border border-red-500/30 rounded-lg p-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center mr-3">
                            <span className="material-symbols-outlined text-red-400 text-lg">cancel</span>
                        </div>
                        <span className="text-sm font-bold text-text-heading">DKIM</span>
                    </div>
                    <span className="text-xs font-extrabold text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">FAIL</span>
                </div>
                {/* DMARC: Yellow/None */}
                <div className="bg-primary-bg border border-amber-500/30 rounded-lg p-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center mr-3">
                            <span className="material-symbols-outlined text-amber-400 text-lg">warning</span>
                        </div>
                        <span className="text-sm font-bold text-text-heading">DMARC</span>
                    </div>
                    <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">NONE</span>
                </div>
            </div>
        );
        case 'score': return (
            <div className="w-full bg-primary-bg border border-border-dark rounded-lg p-4">
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-border-dark">
                        <span className="text-text-muted-1">Baseline Score</span>
                        <span className="font-mono text-text-heading">50</span>
                    </div>
                    <div className="flex justify-between items-center text-red-400">
                        <span className="flex items-center"><span className="material-symbols-outlined text-sm mr-1">arrow_upward</span> Suspicious Link</span>
                        <span className="font-mono font-bold">+20</span>
                    </div>
                    <div className="flex justify-between items-center text-red-400">
                        <span className="flex items-center"><span className="material-symbols-outlined text-sm mr-1">arrow_upward</span> Auth Failed</span>
                        <span className="font-mono font-bold">+25</span>
                    </div>
                    {/* Added Positive Score */}
                    <div className="flex justify-between items-center text-green-400">
                        <span className="flex items-center"><span className="material-symbols-outlined text-sm mr-1">arrow_downward</span> SPF Passed</span>
                        <span className="font-mono font-bold">-10</span>
                    </div>
                    <div className="pt-2 border-t border-border-dark flex justify-between items-center">
                        <span className="font-bold text-text-heading">Total Risk Score</span>
                        <span className="text-xl font-extrabold text-red-500 font-mono">85</span>
                    </div>
                </div>
            </div>
        );
        case 'findings': return (
            <div className="w-full space-y-2">
                <div className="bg-red-500/5 border-l-4 border-red-500 p-2.5 rounded-r-lg">
                    <div className="flex items-center text-red-400 font-bold text-xs mb-0.5">
                        <span className="material-symbols-outlined text-base mr-2">gpp_bad</span>
                        CRITICAL
                    </div>
                    <p className="text-text-muted-1 text-[10px] leading-relaxed">Sender address spoofing detected. The 'From' header does not match the originating server.</p>
                </div>
                <div className="bg-amber-500/5 border-l-4 border-amber-500 p-2.5 rounded-r-lg">
                    <div className="flex items-center text-amber-400 font-bold text-xs mb-0.5">
                        <span className="material-symbols-outlined text-base mr-2">warning</span>
                        HIGH
                    </div>
                    <p className="text-text-muted-1 text-[10px] leading-relaxed">URL pattern matches known phishing kit landing pages.</p>
                </div>
                {/* NEW ITEM */}
                <div className="bg-orange-500/5 border-l-4 border-orange-500 p-2.5 rounded-r-lg">
                    <div className="flex items-center text-orange-400 font-bold text-xs mb-0.5">
                        <span className="material-symbols-outlined text-base mr-2">priority_high</span>
                        MEDIUM
                    </div>
                    <p className="text-text-muted-1 text-[10px] leading-relaxed">Urgency keywords ("Immediate Action Required") detected in subject line.</p>
                </div>
            </div>
        );
        case 'risk': return (
            <div className="w-full bg-primary-bg rounded-lg border border-border-dark p-4">
                <h4 className="text-xs font-bold text-text-muted-2 uppercase tracking-wider mb-3">Identified Risk Factors</h4>
                <div className="space-y-2">
                    <div className="flex items-start">
                        <span className="material-symbols-outlined text-red-400 text-base mr-2 mt-0.5">remove_circle</span>
                        <span className="text-sm text-text-muted-1">Domain created &lt; 24 hours ago</span>
                    </div>
                    <div className="flex items-start">
                        <span className="material-symbols-outlined text-red-400 text-base mr-2 mt-0.5">remove_circle</span>
                        <span className="text-sm text-text-muted-1">Origin IP on 3 blocklists</span>
                    </div>
                    <div className="flex items-start">
                        <span className="material-symbols-outlined text-red-400 text-base mr-2 mt-0.5">remove_circle</span>
                        <span className="text-sm text-text-muted-1">Mismatched Return-Path</span>
                    </div>
                     {/* NEW POSITIVE ITEM */}
                    <div className="flex items-start mt-3 pt-3 border-t border-border-dark/50">
                        <span className="material-symbols-outlined text-green-400 text-base mr-2 mt-0.5">add_circle</span>
                        <span className="text-sm text-text-muted-1">Valid TLS Encryption Used</span>
                    </div>
                </div>
            </div>
        );
        case 'path': return (
            <div className="w-full flex items-center justify-between px-6 relative h-full">
                <style>{`
                    @keyframes mailTravel {
                        0% { left: 15%; opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                        10% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                        90% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                        100% { left: 85%; opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                    }
                    @keyframes pulseRed {
                        0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                        70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                    }
                    @keyframes pulseBlue {
                        0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
                        70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                    }
                `}</style>
                
                {/* Attacker Node */}
                <div className="flex flex-col items-center relative z-20">
                    <div className="w-16 h-16 rounded-full bg-primary-bg border-2 border-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)]" style={{ animation: 'pulseRed 2s infinite' }}>
                        <span className="material-symbols-outlined text-red-500 text-3xl">person_off</span>
                    </div>
                    <span className="text-xs font-bold mt-3 text-red-400 uppercase tracking-wide">Attacker</span>
                </div>
                
                {/* Connection Area */}
                <div className="flex-grow relative h-full flex flex-col justify-center mx-4">
                    {/* The Line */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-red-500/50 via-purple-500/50 to-blue-500/50 rounded-full"></div>
                    
                    {/* Moving Email Object */}
                    <div 
                        className="absolute top-1/2 left-0 flex flex-col items-center z-30"
                        style={{
                            animation: 'mailTravel 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                        }}
                    >
                         <div className="bg-secondary-bg border border-accent-primary p-2 rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.6)]">
                            <span className="material-symbols-outlined text-accent-primary text-lg block">mail</span>
                         </div>
                         <span className="text-[9px] text-accent-primary mt-1 font-mono">phish.eml</span>
                    </div>
                </div>

                {/* Victim Node */}
                <div className="flex flex-col items-center relative z-20">
                    <div className="w-16 h-16 rounded-full bg-primary-bg border-2 border-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]" style={{ animation: 'pulseBlue 2s infinite', animationDelay: '1.25s' }}>
                        <span className="material-symbols-outlined text-blue-500 text-3xl">person</span>
                    </div>
                    <span className="text-xs font-bold mt-3 text-blue-400 uppercase tracking-wide">Target User</span>
                </div>
            </div>
        );
        case 'vectors': return (
            <div className="w-full flex flex-col gap-2">
                <div className="bg-primary-bg border border-violet-500/40 p-2.5 rounded-lg flex items-center shadow-lg shadow-violet-500/10">
                    <div className="bg-violet-500/10 p-1.5 rounded mr-3">
                        <span className="material-symbols-outlined text-violet-400 text-lg">link</span>
                    </div>
                    <div className="flex-grow">
                        <div className="flex justify-between items-center mb-0.5">
                            <span className="text-xs font-semibold text-text-heading">Spearphishing Link</span>
                            <span className="text-[9px] font-bold text-violet-300 bg-violet-500/10 px-1.5 py-0.5 rounded">T1566.002</span>
                        </div>
                        <div className="text-[9px] text-text-muted-2">Credential harvesting via malicious URL.</div>
                    </div>
                </div>
                <div className="bg-primary-bg border border-violet-500/40 p-2.5 rounded-lg flex items-center shadow-lg shadow-violet-500/10">
                    <div className="bg-violet-500/10 p-1.5 rounded mr-3">
                        <span className="material-symbols-outlined text-violet-400 text-lg">person_off</span>
                    </div>
                    <div className="flex-grow">
                        <div className="flex justify-between items-center mb-0.5">
                            <span className="text-xs font-semibold text-text-heading">Impersonation</span>
                            <span className="text-[9px] font-bold text-violet-300 bg-violet-500/10 px-1.5 py-0.5 rounded">T1656</span>
                        </div>
                        <div className="text-[9px] text-text-muted-2">Sender impersonating trusted entity.</div>
                    </div>
                </div>
                <div className="bg-primary-bg border border-violet-500/40 p-2.5 rounded-lg flex items-center shadow-lg shadow-violet-500/10">
                    <div className="bg-violet-500/10 p-1.5 rounded mr-3">
                        <span className="material-symbols-outlined text-violet-400 text-lg">terminal</span>
                    </div>
                    <div className="flex-grow">
                        <div className="flex justify-between items-center mb-0.5">
                            <span className="text-xs font-semibold text-text-heading">Command Script</span>
                            <span className="text-[9px] font-bold text-violet-300 bg-violet-500/10 px-1.5 py-0.5 rounded">T1059</span>
                        </div>
                        <div className="text-[9px] text-text-muted-2">Obfuscated script in attachment.</div>
                    </div>
                </div>
            </div>
        );
        case 'ips': return (
            <div className="w-full space-y-2">
                <div className="bg-primary-bg border border-border-dark p-2.5 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="material-symbols-outlined text-red-400 mr-2">public</span>
                        <div>
                            <div className="text-sm font-bold text-text-heading">192.0.2.1</div>
                            <div className="text-[9px] text-red-400 uppercase tracking-wider font-bold">Origin</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-text-muted-1">Moscow, RU</div>
                        <div className="text-[9px] text-text-muted-2">FakeNet Corp</div>
                    </div>
                </div>
                <div className="bg-primary-bg border border-border-dark p-2.5 rounded-lg flex items-center justify-between opacity-80">
                    <div className="flex items-center">
                        <span className="material-symbols-outlined text-text-muted-1 mr-2">router</span>
                        <div>
                            <div className="text-sm font-bold text-text-muted-1">10.0.0.5</div>
                            <div className="text-[9px] text-text-muted-2 uppercase tracking-wider font-bold">Hop</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-text-muted-1">Internal</div>
                        <div className="text-[9px] text-text-muted-2">Private Network</div>
                    </div>
                </div>
                <div className="bg-primary-bg border border-border-dark p-2.5 rounded-lg flex items-center justify-between opacity-60">
                    <div className="flex items-center">
                        <span className="material-symbols-outlined text-text-muted-1 mr-2">dns</span>
                        <div>
                            <div className="text-sm font-bold text-text-muted-1">172.16.0.1</div>
                            <div className="text-[9px] text-text-muted-2 uppercase tracking-wider">Hop</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-text-muted-1">Frankfurt, DE</div>
                        <div className="text-[9px] text-text-muted-2">Cloud Host</div>
                    </div>
                </div>
            </div>
        );
        case 'urls': return (
            <div className="w-full space-y-2">
                <div className="bg-primary-bg p-2.5 rounded-lg border-l-4 border-red-500 flex justify-between items-center shadow-sm">
                    <div className="overflow-hidden mr-2">
                        <div className="text-xs text-text-body truncate font-mono">http://login-verify-account.com...</div>
                        <div className="text-[9px] text-red-400 mt-0.5">Suspicious Pattern Detected</div>
                    </div>
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[9px] font-bold rounded uppercase">Malicious</span>
                </div>
                <div className="bg-primary-bg p-2.5 rounded-lg border-l-4 border-green-500 flex justify-between items-center opacity-80">
                    <div className="overflow-hidden mr-2">
                        <div className="text-xs text-text-body truncate font-mono">https://google.com/privacy</div>
                        <div className="text-[9px] text-green-400 mt-0.5">Known Legitimate Domain</div>
                    </div>
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[9px] font-bold rounded uppercase">Safe</span>
                </div>
                <div className="bg-primary-bg p-2.5 rounded-lg border-l-4 border-amber-500 flex justify-between items-center opacity-70">
                    <div className="overflow-hidden mr-2">
                        <div className="text-xs text-text-body truncate font-mono">http://short.ly/xyz123</div>
                        <div className="text-[9px] text-amber-400 mt-0.5">URL Shortener</div>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[9px] font-bold rounded uppercase">Suspicious</span>
                </div>
            </div>
        );
        case 'stats': return (
            <div className="w-full grid grid-cols-2 gap-4">
                <div className="bg-primary-bg p-3 rounded-lg border border-border-dark flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-red-500 mb-1">85</div>
                    <div className="text-[10px] text-text-muted-2 uppercase tracking-wide">Risk Score</div>
                </div>
                <div className="bg-primary-bg p-3 rounded-lg border border-border-dark flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-amber-400 mb-1">5</div>
                    <div className="text-[10px] text-text-muted-2 uppercase tracking-wide">URLs Found</div>
                </div>
                <div className="bg-primary-bg p-3 rounded-lg border border-border-dark flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-blue-400 mb-1">2</div>
                    <div className="text-[10px] text-text-muted-2 uppercase tracking-wide">Attachments</div>
                </div>
                <div className="bg-primary-bg p-3 rounded-lg border border-border-dark flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-violet-400 mb-1">12</div>
                    <div className="text-[10px] text-text-muted-2 uppercase tracking-wide">IOCs</div>
                </div>
            </div>
        );
        case 'dashboard': return (
            <div className="flex flex-col h-full gap-2 p-1 overflow-hidden">
                {/* Verdict Header - Reduced padding/margins to fit */}
                <div className="flex flex-row items-center justify-between bg-red-500/10 border border-red-500/30 rounded-lg p-2.5 shrink-0">
                    <div>
                        <h3 className="text-text-muted-1 text-[9px] uppercase font-bold tracking-wider">Security Risk Score</h3>
                        <div className="flex items-baseline mt-0.5">
                            <span className="text-3xl font-extrabold text-white">85</span>
                            <span className="text-xs text-text-muted-2 ml-1 font-bold">/ 100</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end justify-center">
                         <div className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse">
                            Critical
                         </div>
                         <span className="text-[9px] text-red-300 mt-1 font-medium">Malware Detected</span>
                    </div>
                </div>

                {/* Metrics Grid - Adjusted to fit 4 items comfortably */}
                <div className="grid grid-cols-2 gap-2 flex-grow min-h-0">
                    <div className="bg-primary-bg border border-border-dark p-2 rounded-lg flex flex-col justify-center items-center">
                        <span className="material-symbols-outlined text-amber-400 text-lg mb-0.5">link</span>
                        <span className="text-base font-bold text-text-heading">5</span>
                        <span className="text-[8px] text-text-muted-2 uppercase">Suspicious URLs</span>
                    </div>
                    <div className="bg-primary-bg border border-border-dark p-2 rounded-lg flex flex-col justify-center items-center">
                        <span className="material-symbols-outlined text-red-400 text-lg mb-0.5">attachment</span>
                        <span className="text-base font-bold text-text-heading">1</span>
                        <span className="text-[8px] text-text-muted-2 uppercase">Malicious Files</span>
                    </div>
                    <div className="bg-primary-bg border border-border-dark p-2 rounded-lg flex flex-col justify-center items-center">
                        <span className="material-symbols-outlined text-blue-400 text-lg mb-0.5">fingerprint</span>
                        <span className="text-base font-bold text-text-heading">12</span>
                        <span className="text-[8px] text-text-muted-2 uppercase">IOCs Found</span>
                    </div>
                    <div className="bg-primary-bg border border-border-dark p-2 rounded-lg flex flex-col justify-center items-center">
                        <span className="material-symbols-outlined text-violet-400 text-lg mb-0.5">flag</span>
                        <span className="text-base font-bold text-text-heading">2</span>
                        <span className="text-[8px] text-text-muted-2 uppercase">Attack Tactics</span>
                    </div>
                </div>

                {/* Recommendation - Compacted */}
                <div className="bg-secondary-bg border border-border-dark p-2.5 rounded-lg flex items-center shadow-lg shrink-0">
                     <div className="p-1 bg-red-500/20 rounded-full mr-3">
                        <span className="material-symbols-outlined text-red-400 text-lg">delete_forever</span>
                     </div>
                     <div className="overflow-hidden">
                        <div className="text-[8px] text-text-muted-2 uppercase font-bold tracking-wide">Recommendation</div>
                        <div className="text-xs font-bold text-text-body truncate">Delete email immediately</div>
                     </div>
                </div>
            </div>
        );
        default: return null;
    }
}

// 4. MAIN ANIMATION CONTROLLER
const AnimationController: React.FC = () => {
    // 0: Upload, 1: Scan, 2...14: Tabs (Geo and Graph removed), 14: Dashboard
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Fix: Use ReturnType<typeof setTimeout> instead of NodeJS.Timeout to work in both browser and node environments
        let timer: ReturnType<typeof setTimeout>;
        const nextStep = () => {
            setStep(prev => {
                // If at end (Dashboard), loop back to upload (0)
                if (prev >= 14) return 0;
                return prev + 1;
            });
        };

        // Timing logic
        if (step === 0) {
            // Upload: 3.5s
            timer = setTimeout(nextStep, 3500); 
        } else if (step === 1) {
            // Scanner: 4s
            timer = setTimeout(nextStep, 4000);
        } else if (step >= 2 && step < 14) {
            // Quick Tabs: 2s each to allow viewing details
            timer = setTimeout(nextStep, 2000);
        } else if (step === 14) {
            // Dashboard: 5s
            timer = setTimeout(nextStep, 5000);
        }

        return () => clearTimeout(timer);
    }, [step]);

    // Render logic
    if (step === 0) return <UploadWindow />;
    if (step === 1) return <ScannerWindow />;
    
    // Tab previews
    let title = "";
    let icon = "";
    let type = "";

    switch(step) {
        case 2: title = "Email Details"; icon = "mail"; type = "details"; break;
        case 3: title = "Raw Source"; icon = "code"; type = "raw"; break;
        case 4: title = "Domains & Emails"; icon = "public"; type = "domains"; break;
        case 5: title = "Headers"; icon = "receipt_long"; type = "headers"; break;
        case 6: title = "Score Calculation"; icon = "calculate"; type = "score"; break;
        case 7: title = "Key Findings"; icon = "fact_check"; type = "findings"; break;
        case 8: title = "Risk Factors"; icon = "rule"; type = "risk"; break;
        case 9: title = "Threat Path"; icon = "share"; type = "path"; break;
        case 10: title = "Attack Vectors"; icon = "flag"; type = "vectors"; break;
        case 11: title = "IP Analysis"; icon = "dns"; type = "ips"; break;
        // Skipped Geo
        case 12: title = "URLs"; icon = "link"; type = "urls"; break;
        case 13: title = "Statistics"; icon = "monitoring"; type = "stats"; break;
        // Skipped Network Graph
        case 14: title = "Dashboard"; icon = "dashboard"; type = "dashboard"; break;
    }

    return (
        <ResultPreviewWindow title={title} icon={icon}>
            <TabContent type={type} />
        </ResultPreviewWindow>
    );
};

export const Home: React.FC<HomeProps> = ({ onAnalyzeClick }) => {
    return (
        <div className="flex flex-col relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1200px] max-w-7xl pointer-events-none z-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-accent-primary/20 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-secondary/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Hero Section */}
            <section className="min-h-[calc(100vh-64px)] flex items-center relative z-10 py-12">
                <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    
                    {/* Left Column: Text */}
                    <div className="text-left">
                        <div className="inline-flex items-center px-3 py-1 rounded-full border border-accent-secondary/30 bg-accent-secondary/10 text-accent-secondary text-sm font-medium mb-8 animate-fade-in-up">
                            <span className="flex h-2 w-2 relative mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-secondary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-secondary"></span>
                            </span>
                            New Generation Phishing Detection
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold text-text-heading tracking-tight mb-6 animate-fade-in-up leading-tight" style={{ animationDelay: '0.1s' }}>
                            Uncover the Truth <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">
                                Behind Every Email
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-text-muted-1 max-w-xl mb-10 animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
                            Nolvaryn uses advanced AI and deterministic analysis to dissect suspicious emails, trace their origins, and expose hidden threats in seconds.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                            <button
                                onClick={onAnalyzeClick}
                                className="px-8 py-4 bg-accent-primary text-white text-lg font-bold rounded-lg shadow-lg shadow-accent-primary/25 hover:bg-violet-600 hover:shadow-accent-primary/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined mr-2">upload_file</span>
                                Analyze .eml File
                            </button>
                        </div>
                    </div>

                    {/* Right Column: React State-Driven Animation */}
                    <div className="relative w-full h-[600px] flex items-center justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
                         {/* Grid background */}
                         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] rounded-3xl border border-white/5"></div>
                         
                         {/* Animation Container */}
                         <div className="relative w-[28rem] h-80 flex items-center justify-center transform scale-[1.3]">
                             <AnimationController />
                         </div>
                    </div>
                </div>
            </section>

            {/* Feature Highlights - Below the Fold */}
            <section className="max-w-7xl mx-auto px-6 py-24 w-full z-10 relative bg-primary-bg/50 backdrop-blur-sm border-t border-border-dark/30">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-text-heading mb-4">Why Nolvaryn?</h2>
                    <p className="text-text-muted-1 max-w-2xl mx-auto">Advanced capabilities designed for the modern threat landscape.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left" id="how-it-works">
                    <FeatureHighlight 
                        icon="psychology" 
                        title="AI-Driven Forensics" 
                        description="Beyond simple keyword matching. Our AI understands context, intent, and social engineering tactics." 
                        delay="0s"
                    />
                    <FeatureHighlight 
                        icon="public" 
                        title="Global Tracking" 
                        description="Visualize the attack path. We trace email headers and map server locations to identify suspicious routing." 
                        delay="0.1s"
                    />
                    <FeatureHighlight 
                        icon="verified_user" 
                        title="Instant Verdict" 
                        description="Get a clear risk score and actionable advice immediately. No waiting, no complex setup." 
                        delay="0.2s"
                    />
                </div>
            </section>
        </div>
    );
};