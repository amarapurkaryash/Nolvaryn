import React from 'react';
import { AnalysisResult } from '../../../types';
import { Section, TabSummary } from '../shared';
import { IpGeolocationChart, IpTypeLineChart, KeyStatsLineChart, UrlVerdictLineChart } from '../charts';

export const StatisticsTab: React.FC<{ result: AnalysisResult }> = ({ result }) => (
  <div className="animate-fade-in">
    <TabSummary>Visual charts and graphs presenting the quantitative data from the analysis, such as the breakdown of URL verdicts, IP types, and geolocation distribution.</TabSummary>
    <div className="grid grid-cols-2 gap-6">
      <Section title="URL Verdicts" icon={<span className="material-symbols-outlined text-2xl text-accent-primary">link</span>}>
        <UrlVerdictLineChart urls={result.urls} />
      </Section>
      <Section title="IP Types" icon={<span className="material-symbols-outlined text-2xl text-accent-primary">dns</span>}>
        <IpTypeLineChart ips={result.indicators.ips} />
      </Section>
      <div className="col-span-2">
        <Section title="Key Statistics Overview" icon={<span className="material-symbols-outlined text-2xl text-accent-primary">summarize</span>}>
          <KeyStatsLineChart result={result} />
        </Section>
      </div>
      <div className="col-span-2">
        <Section title="IP Geolocation Distribution (Top Countries)" icon={<span className="material-symbols-outlined text-2xl text-accent-primary">public</span>}>
          <IpGeolocationChart ips={result.indicators.ips} />
        </Section>
      </div>
    </div>
  </div>
);
