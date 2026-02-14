import React from 'react';
import { AnalyzedUrl, KeyFinding, RiskFactor } from '../../types';

export interface QuantitativeFinding {
  category: string;
  icon: string;
  impact: 'Positive' | 'Neutral' | 'Low' | 'Medium' | 'High' | 'Critical';
  summary: string;
  details: string[];
}

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const getRiskColor = (s: number) => {
  if (s > 75) return { base: 'text-red-500', stroke: 'stroke-red-500' };
  if (s > 40) return { base: 'text-amber-400', stroke: 'stroke-amber-400' };
  return { base: 'text-green-400', stroke: 'stroke-green-400' };
};

export const RiskScoreGauge: React.FC<{ score: number }> = ({ score }) => {
  const { base, stroke } = getRiskColor(score);
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center h-48 w-48 mx-auto my-4">
      <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 120 120">
        <circle
          className="stroke-current text-border-dark"
          cx="60"
          cy="60"
          r="52"
          strokeWidth="12"
          fill="transparent"
        />
        <circle
          className={`transition-all duration-1000 ease-out ${stroke}`}
          cx="60"
          cy="60"
          r="52"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className={`absolute flex flex-col items-center justify-center ${base}`}>
        <span className="text-5xl font-bold">{score}</span>
        <span className="text-base font-semibold tracking-wider uppercase">Risk</span>
      </div>
    </div>
  );
};

export const getVerdictVisuals = (verdict: AnalyzedUrl['verdict']) => {
  switch (verdict) {
    case 'Caution':
      return {
        label: 'Caution',
        colorClass: 'bg-red-500/20 text-red-400',
        barColor: '#ef4444',
        icon: (
          <span className="material-symbols-outlined text-xl text-red-400 flex-shrink-0">dangerous</span>
        ),
      };
    case 'Suspicious':
      return {
        label: 'Suspicious',
        colorClass: 'bg-amber-500/20 text-amber-400',
        barColor: '#f59e0b',
        icon: (
          <span className="material-symbols-outlined text-xl text-amber-400 flex-shrink-0">warning</span>
        ),
      };
    case 'Manual Review':
      return {
        label: 'Manual Review',
        colorClass: 'bg-sky-500/20 text-sky-400',
        barColor: '#0ea5e9',
        icon: (
          <span className="material-symbols-outlined text-xl text-sky-400 flex-shrink-0">person_search</span>
        ),
      };
    case 'Safe':
    default:
      return {
        label: 'Safe',
        colorClass: 'bg-green-500/20 text-green-400',
        barColor: '#22c55e',
        icon: (
          <span className="material-symbols-outlined text-xl text-green-400 flex-shrink-0">check_circle</span>
        ),
      };
  }
};

export const getAuthStatusVisuals = (status: string | undefined) => {
  const lowerStatus = (status || '').toLowerCase();
  switch (lowerStatus) {
    case 'pass':
      return {
        icon: (
          <span className="material-symbols-outlined text-2xl text-green-400 flex-shrink-0">
            check_circle
          </span>
        ),
        borderColor: 'border-l-green-500',
        badgeColor: 'bg-green-500/20 text-green-400',
        cardBgColor: 'bg-green-500/10',
      };
    case 'fail':
      return {
        icon: (
          <span className="material-symbols-outlined text-2xl text-red-400 flex-shrink-0">cancel</span>
        ),
        borderColor: 'border-l-red-500',
        badgeColor: 'bg-red-500/20 text-red-400',
        cardBgColor: 'bg-red-500/10',
      };
    case 'softfail':
    case 'temperror':
      return {
        icon: (
          <span className="material-symbols-outlined text-2xl text-amber-400 flex-shrink-0">
            warning
          </span>
        ),
        borderColor: 'border-l-amber-500',
        badgeColor: 'bg-amber-500/20 text-amber-400',
        cardBgColor: 'bg-amber-500/10',
      };
    default:
      return {
        icon: (
          <span className="material-symbols-outlined text-2xl text-gray-400 flex-shrink-0">info</span>
        ),
        borderColor: 'border-l-gray-500',
        badgeColor: 'bg-gray-500/20 text-gray-400',
        cardBgColor: 'bg-primary-bg',
      };
  }
};

export const getImpactVisuals = (
  impact: QuantitativeFinding['impact'] | KeyFinding['severity'] | RiskFactor['impact']
) => {
  switch (impact) {
    case 'Critical':
      return { color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-500', icon: 'gpp_bad' };
    case 'High':
      return { color: 'text-orange-400', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500', icon: 'error' };
    case 'Medium':
      return { color: 'text-amber-400', bgColor: 'bg-amber-500/20', borderColor: 'border-amber-500', icon: 'warning' };
    case 'Low':
      return { color: 'text-sky-400', bgColor: 'bg-sky-500/20', borderColor: 'border-sky-500', icon: 'info' };
    case 'Positive':
      return { color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500', icon: 'add_circle' };
    default:
      return { color: 'text-gray-400', bgColor: 'bg-gray-500/20', borderColor: 'border-gray-500', icon: 'horizontal_rule' };
  }
};

export const getFileTypeIcon = (filename: string, filetype: string): React.ReactNode => {
  const iconClass = 'material-symbols-outlined text-2xl text-text-muted-1 flex-shrink-0';
  const extension = filename.split('.').pop()?.toLowerCase() || '';

  let iconName = 'attachment';

  if (extension === 'pdf' || filetype.includes('pdf')) {
    iconName = 'picture_as_pdf';
  } else if (
    ['doc', 'docx', 'txt', 'rtf'].includes(extension) ||
    filetype.includes('wordprocessingml') ||
    filetype.startsWith('text/')
  ) {
    iconName = 'description';
  } else if (
    ['xls', 'xlsx', 'csv'].includes(extension) ||
    filetype.includes('spreadsheetml') ||
    filetype.includes('csv')
  ) {
    iconName = 'table_chart';
  } else if (
    ['zip', 'rar', '7z', 'gz', 'tar'].includes(extension) ||
    filetype.includes('zip') ||
    filetype.includes('compressed') ||
    filetype.includes('archive')
  ) {
    iconName = 'archive';
  } else if (
    ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp'].includes(extension) ||
    filetype.startsWith('image/')
  ) {
    iconName = 'image';
  } else if (
    ['exe', 'dll', 'bat', 'sh', 'js', 'vbs', 'ps1'].includes(extension) ||
    filetype.includes('octet-stream') ||
    filetype.includes('x-msdownload')
  ) {
    iconName = 'terminal';
  }

  return <span className={iconClass}>{iconName}</span>;
};

export const InfoButton: React.FC<{ text: string }> = ({ text }) => (
  <div className="group relative flex items-center ml-2">
    <button className="text-text-muted-2 hover:text-text-body transition-colors">
      <span className="material-symbols-outlined text-lg">help</span>
    </button>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-primary-bg border border-border-dark rounded-lg shadow-lg text-sm text-text-muted-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-border-dark" />
    </div>
  </div>
);

export const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string; infoText?: string }> = ({
  title,
  icon,
  children,
  className,
  infoText,
}) => (
  <div className={`bg-secondary-bg p-6 rounded-lg border border-border-dark flex flex-col ${className || ''}`}>
    <div className="flex items-center mb-4">
      {icon}
      <h3 className="text-xl font-bold text-text-heading ml-3">{title}</h3>
      {infoText && <InfoButton text={infoText} />}
    </div>
    <div className="flex-grow flex flex-col">{children}</div>
  </div>
);

export const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md hover:bg-border-dark text-text-muted-2 hover:text-text-body transition-colors flex-shrink-0"
      aria-label="Copy"
    >
      {copied ? (
        <span className="material-symbols-outlined text-base leading-none text-green-400">check</span>
      ) : (
        <span className="material-symbols-outlined text-base leading-none">content_copy</span>
      )}
    </button>
  );
};

export const NoDataMessage: React.FC<{ message: string; title?: string }> = ({ message, title = 'No Data Available' }) => (
  <div className="text-center py-12 px-6 bg-primary-bg rounded-lg border-2 border-dashed border-border-dark h-full flex flex-col justify-center items-center">
    <span className="material-symbols-outlined text-5xl mx-auto text-text-muted-2 mb-4">search_off</span>
    <h4 className="text-lg font-semibold text-text-muted-1">{title}</h4>
    <p className="text-base text-text-muted-2 mt-1 max-w-sm leading-relaxed">{message}</p>
  </div>
);

export const TabSummary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-6 p-4 bg-primary-bg border-l-4 border-accent-primary/50 rounded-r-md text-text-muted-1 leading-relaxed">
    {children}
  </div>
);

export const StatCard: React.FC<{
  icon: React.ReactNode;
  value: string | number;
  label: string;
  subValue?: string | number;
  subLabel?: string;
  colorClass?: string;
}> = ({ icon, value, label, subValue, subLabel, colorClass = 'text-accent-secondary' }) => (
  <div className="bg-secondary-bg p-4 rounded-lg border border-border-dark h-full flex flex-col justify-between">
    <div>
      <div className={`text-3xl ${colorClass}`}>{icon}</div>
      <p className="text-3xl font-bold text-text-heading mt-2">{value}</p>
      <p className="text-sm text-text-muted-1">{label}</p>
    </div>
    {subValue != null && <p className={`text-sm font-semibold mt-2 ${colorClass}`}>{subValue} {subLabel}</p>}
  </div>
);

export const IpFilterControls: React.FC<{
  ipVersionFilter: 'all' | 'ipv4' | 'ipv6';
  ipTypeFilter: 'all' | 'origin' | 'hop';
  onIpVersionFilterChange: (value: 'all' | 'ipv4' | 'ipv6') => void;
  onIpTypeFilterChange: (value: 'all' | 'origin' | 'hop') => void;
}> = ({ ipVersionFilter, ipTypeFilter, onIpVersionFilterChange, onIpTypeFilterChange }) => (
  <div className="flex flex-row flex-wrap gap-x-6 gap-y-3 mb-4 p-4 bg-primary-bg border border-border-dark rounded-lg">
    <div>
      <h5 className="text-base font-semibold text-text-muted-1 mb-2">Filter by IP Version</h5>
      <div className="flex items-center space-x-2">
        <button onClick={() => onIpVersionFilterChange('all')} className={`px-3 py-1 text-sm rounded-md transition-colors ${ipVersionFilter === 'all' ? 'bg-accent-primary text-white font-semibold' : 'bg-secondary-bg hover:bg-border-dark text-text-muted-1'}`}>All</button>
        <button onClick={() => onIpVersionFilterChange('ipv4')} className={`px-3 py-1 text-sm rounded-md transition-colors ${ipVersionFilter === 'ipv4' ? 'bg-accent-primary text-white font-semibold' : 'bg-secondary-bg hover:bg-border-dark text-text-muted-1'}`}>IPv4</button>
        <button onClick={() => onIpVersionFilterChange('ipv6')} className={`px-3 py-1 text-sm rounded-md transition-colors ${ipVersionFilter === 'ipv6' ? 'bg-accent-primary text-white font-semibold' : 'bg-secondary-bg hover:bg-border-dark text-text-muted-1'}`}>IPv6</button>
      </div>
    </div>
    <div>
      <h5 className="text-base font-semibold text-text-muted-1 mb-2">Filter by Type</h5>
      <div className="flex items-center space-x-2">
        <button onClick={() => onIpTypeFilterChange('all')} className={`px-3 py-1 text-sm rounded-md transition-colors ${ipTypeFilter === 'all' ? 'bg-accent-primary text-white font-semibold' : 'bg-secondary-bg hover:bg-border-dark text-text-muted-1'}`}>All Types</button>
        <button onClick={() => onIpTypeFilterChange('origin')} className={`px-3 py-1 text-sm rounded-md transition-colors ${ipTypeFilter === 'origin' ? 'bg-accent-primary text-white font-semibold' : 'bg-secondary-bg hover:bg-border-dark text-text-muted-1'}`}>Origin</button>
        <button onClick={() => onIpTypeFilterChange('hop')} className={`px-3 py-1 text-sm rounded-md transition-colors ${ipTypeFilter === 'hop' ? 'bg-accent-primary text-white font-semibold' : 'bg-secondary-bg hover:bg-border-dark text-text-muted-1'}`}>Hop</button>
      </div>
    </div>
  </div>
);
