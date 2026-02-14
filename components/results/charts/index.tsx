import React from 'react';
import { AnalysisResult, AnalyzedIp, AnalyzedUrl } from '../../../types';
import { NoDataMessage, getVerdictVisuals } from '../shared';

declare const Chart: any;

export const UrlVerdictLineChart: React.FC<{ urls: AnalyzedUrl[] }> = ({ urls }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const chartRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (!canvasRef.current || typeof Chart === 'undefined') return;
    if (!urls || urls.length === 0) {
      if (chartRef.current) chartRef.current.destroy();
      return;
    }

    const urlCounts = (urls || []).reduce((acc, url) => {
      acc[url.verdict] = (acc[url.verdict] || 0) + 1;
      return acc;
    }, {} as Record<AnalyzedUrl['verdict'], number>);

    const verdictOrder: AnalyzedUrl['verdict'][] = ['Safe', 'Manual Review', 'Suspicious', 'Caution'];
    const labels = verdictOrder.map(v => getVerdictVisuals(v).label);
    const data = verdictOrder.map(v => urlCounts[v] || 0);

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

    const chartData = {
      labels,
      datasets: [
        {
          label: 'URL Count',
          data,
          borderColor: '#8b5cf6',
          backgroundColor: gradient,
          borderWidth: 2,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#8b5cf6',
          pointHoverBackgroundColor: '#8b5cf6',
          pointHoverBorderColor: '#fff',
          tension: 0.3,
          fill: true,
        },
      ],
    };

    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0d0d0d',
            titleFont: { weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 4,
            boxPadding: 4,
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [urls]);

  if (!urls || urls.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center h-80">
        <NoDataMessage message="No URLs were found to visualize." title="No URL Data" />
      </div>
    );
  }
  return (
    <div className="relative h-80">
      <canvas ref={canvasRef} />
    </div>
  );
};

export const IpTypeLineChart: React.FC<{ ips: AnalyzedIp[] }> = ({ ips }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const chartRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (!canvasRef.current || typeof Chart === 'undefined') return;
    if (!ips || ips.length === 0) {
      if (chartRef.current) chartRef.current.destroy();
      return;
    }

    const ipCounts = (ips || []).reduce((acc, ip) => {
      acc[ip.type] = (acc[ip.type] || 0) + 1;
      return acc;
    }, {} as Record<'origin' | 'hop', number>);

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');

    const chartData = {
      labels: ['Origin', 'Hop'],
      datasets: [
        {
          label: 'IP Count',
          data: [ipCounts.origin || 0, ipCounts.hop || 0],
          borderColor: '#ef4444',
          backgroundColor: gradient,
          borderWidth: 2,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#ef4444',
          pointHoverBackgroundColor: '#ef4444',
          pointHoverBorderColor: '#fff',
          tension: 0.3,
          fill: true,
        },
      ],
    };

    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0d0d0d',
            titleFont: { weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 4,
            boxPadding: 4,
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [ips]);

  if (!ips || ips.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center h-80">
        <NoDataMessage message="No IPs were found to visualize." title="No IP Data" />
      </div>
    );
  }
  return (
    <div className="relative h-80">
      <canvas ref={canvasRef} />
    </div>
  );
};

export const KeyStatsLineChart: React.FC<{ result: AnalysisResult }> = ({ result }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const chartRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (!canvasRef.current || typeof Chart === 'undefined') return;

    const urlCounts = (Array.isArray(result.urls) ? result.urls : []).reduce(
      (acc, url) => {
        acc[url.verdict] = (acc[url.verdict] || 0) + 1;
        return acc;
      },
      { Safe: 0, 'Manual Review': 0, Suspicious: 0, Caution: 0 }
    );

    const suspiciousUrlCount = (urlCounts['Caution'] || 0) + (urlCounts['Suspicious'] || 0);
    const highRiskAttachmentCount = (Array.isArray(result.attachments) ? result.attachments : []).filter(
      att => att.warning.toLowerCase().includes('high-risk') || att.warning.toLowerCase().includes('malicious')
    ).length;
    const ipsCount = Array.isArray(result.indicators?.ips) ? result.indicators.ips.length : 0;
    const domainsCount = Array.isArray(result.indicators?.domains) ? result.indicators.domains.length : 0;
    const emailsCount = Array.isArray(result.indicators?.emails) ? result.indicators.emails.length : 0;
    const iocCount = ipsCount + domainsCount + emailsCount;
    const tacticsCount = Array.isArray(result.mitreAttackTechniques) ? result.mitreAttackTechniques.length : 0;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, 'rgba(167, 139, 250, 0.4)');
    gradient.addColorStop(1, 'rgba(167, 139, 250, 0)');

    const chartData = {
      labels: ['Risky URLs', 'High-Risk Attachments', 'Indicators (IOCs)', 'Attack Vectors'],
      datasets: [
        {
          label: 'Count',
          data: [suspiciousUrlCount, highRiskAttachmentCount, iocCount, tacticsCount],
          borderColor: '#a78bfa',
          backgroundColor: gradient,
          borderWidth: 2,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#a78bfa',
          pointHoverBackgroundColor: '#a78bfa',
          pointHoverBorderColor: '#fff',
          tension: 0.3,
          fill: true,
        },
      ],
    };

    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0d0d0d',
            titleFont: { weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 4,
            boxPadding: 4,
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [result]);

  return (
    <div className="relative h-80">
      <canvas ref={canvasRef} />
    </div>
  );
};

export const IpGeolocationChart: React.FC<{ ips: AnalyzedIp[] }> = ({ ips }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const chartRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (!canvasRef.current || typeof Chart === 'undefined') return;
    if (!ips || !ips.some(ip => ip.geolocation?.country && ip.geolocation.country !== 'N/A')) {
      if (chartRef.current) chartRef.current.destroy();
      return;
    }

    const countryCounts = (ips || []).reduce((acc, ip) => {
      const country = ip.geolocation?.country;
      if (country && country !== 'N/A') {
        acc[country] = (acc[country] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const sortedCountries = (Object.entries(countryCounts) as [string, number][]) 
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    if (sortedCountries.length === 0) {
      if (chartRef.current) chartRef.current.destroy();
      return;
    }

    let chartLabels = sortedCountries.map(([country]) => country);
    let chartDataPoints: (number | null)[] = sortedCountries.map(([, count]) => count);

    if (sortedCountries.length === 1) {
      chartLabels = ['', chartLabels[0], ''];
      chartDataPoints = [null, chartDataPoints[0], null];
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

    const chartData = {
      labels: chartLabels,
      datasets: [
        {
          label: 'IP Count',
          data: chartDataPoints,
          backgroundColor: gradient,
          borderColor: '#3b82f6',
          borderWidth: 2,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#3b82f6',
          pointHoverBackgroundColor: '#3b82f6',
          pointHoverBorderColor: '#fff',
          tension: 0.3,
          fill: true,
        },
      ],
    };

    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0d0d0d',
            titleFont: { weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 4,
            boxPadding: 4,
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [ips]);

  if (!ips || !ips.some(ip => ip.geolocation?.country && ip.geolocation.country !== 'N/A')) {
    return (
      <div className="flex-grow flex items-center justify-center h-80">
        <NoDataMessage message="No IP geolocation data was available to visualize." title="No Geolocation Data" />
      </div>
    );
  }
  return (
    <div className="relative h-80">
      <canvas ref={canvasRef} />
    </div>
  );
};

export const useChartDefaults = () => {
  React.useEffect(() => {
    if (typeof Chart !== 'undefined') {
      Chart.defaults.color = '#9ca3af';
      Chart.defaults.borderColor = '#262626';
      Chart.defaults.font.family = '"Work Sans", sans-serif';
    }
  }, []);
};
