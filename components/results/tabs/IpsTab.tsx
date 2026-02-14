import React from 'react';
import { AnalysisResult, AnalyzedIp } from '../../../types';
import { CopyButton, IpFilterControls, NoDataMessage, TabSummary } from '../shared';

interface IpsTabProps {
  result: AnalysisResult;
  filteredIps: AnalyzedIp[];
  ipVersionFilter: 'all' | 'ipv4' | 'ipv6';
  ipTypeFilter: 'all' | 'origin' | 'hop';
  onIpVersionFilterChange: (value: 'all' | 'ipv4' | 'ipv6') => void;
  onIpTypeFilterChange: (value: 'all' | 'origin' | 'hop') => void;
}

export const IpsTab: React.FC<IpsTabProps> = ({
  result,
  filteredIps,
  ipVersionFilter,
  ipTypeFilter,
  onIpVersionFilterChange,
  onIpTypeFilterChange,
}) => (
  <div className="animate-fade-in">
    <TabSummary>A deep dive into every IP address found in the email's headers and body. This includes detailed geolocation, network/ISP information, and an AI-generated analysis for each IP.</TabSummary>
    {(Array.isArray(result.indicators?.ips) ? result.indicators.ips : []).length > 0 ? (
      <div className="space-y-6">
        <section>
          <div className="flex items-center mb-4">
            <span className="material-symbols-outlined text-2xl text-accent-secondary">dns</span>
            <h4 className="text-xl font-bold text-text-heading ml-3">IP Address Analysis</h4>
          </div>
          <IpFilterControls
            ipVersionFilter={ipVersionFilter}
            ipTypeFilter={ipTypeFilter}
            onIpVersionFilterChange={onIpVersionFilterChange}
            onIpTypeFilterChange={onIpTypeFilterChange}
          />
          <div className="grid grid-cols-2 gap-4">
            {filteredIps.length > 0 ? filteredIps.map((ipInfo, index) => {
              const isBogon = ipInfo.network?.organization === 'Unroutable (Private) IP Address';
              return (
                <div key={index} className={`bg-primary-bg p-4 border border-border-dark rounded-lg space-y-3 border-l-4 ${ipInfo.type === 'origin' ? 'border-l-red-500' : 'border-l-gray-600'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`material-symbols-outlined text-xl flex-shrink-0 ${ipInfo.type === 'origin' ? 'text-red-400' : 'text-text-muted-2'}`}>
                        {ipInfo.type === 'origin' ? 'person' : 'dns'}
                      </span>
                      <code className="font-bold text-lg text-text-body">{ipInfo.ip}</code>
                      <span className={`px-2 py-0.5 text-sm font-semibold rounded-full ${
                        ipInfo.type === 'origin'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-gray-600/30 text-text-muted-1'
                      }`}>
                        {ipInfo.type === 'origin' ? 'Sender Origin' : 'Mail Hop'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CopyButton text={ipInfo.ip} />
                    </div>
                  </div>
                   {isBogon ? (
                    <div className="text-sm p-3 bg-sky-900/40 border border-sky-500/30 rounded-md mt-2">
                      <div className="flex items-center">
                        <span className="material-symbols-outlined mr-2 text-sky-400 flex-shrink-0">info</span>
                        <h5 className="font-semibold text-sky-300 text-base">Private or Reserved IP Address</h5>
                      </div>
                      <p className="text-sky-300/80 mt-1.5 pl-7 text-sm">
                        This IP address (e.g., from a home router or internal corporate network) is not publicly routable on the internet. Therefore, no public geolocation data is available. This is often normal for internal mail servers.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm pt-2">
                      <div>
                        <h5 className="text-sm font-semibold uppercase tracking-wider text-text-muted-2 mb-2">Geolocation</h5>
                        <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                          <div className="flex items-center" title="City"><span className="material-symbols-outlined text-base mr-2 text-text-muted-2 flex-shrink-0">location_on</span><span className="text-text-muted-1 mr-2">City:</span><span className="text-base text-text-body">{ipInfo.geolocation?.city || 'N/A'}</span></div>
                          <div className="flex items-center" title="State/Region"><span className="material-symbols-outlined text-base mr-2 text-text-muted-2 flex-shrink-0">apartment</span><span className="text-text-muted-1 mr-2">Region:</span><span className="text-base text-text-body">{ipInfo.geolocation?.region || 'N/A'}</span></div>
                          <div className="flex items-center" title="Country"><span className="material-symbols-outlined text-base mr-2 text-text-muted-2 flex-shrink-0">flag</span><span className="text-text-muted-1 mr-2">Country:</span><span className="text-base text-text-body">{ipInfo.geolocation?.country || 'N/A'}</span></div>
                          <div className="flex items-center" title="Country Code"><span className="material-symbols-outlined text-base mr-2 text-text-muted-2 flex-shrink-0">flag</span><span className="text-text-muted-1 mr-2">Code:</span><span className="text-base text-text-body">{ipInfo.geolocation?.countryCode || 'N/A'}</span></div>
                          <div className="flex items-center" title="Postal Code"><span className="material-symbols-outlined text-base mr-2 text-text-muted-2 flex-shrink-0">tag</span><span className="text-text-muted-1 mr-2">Postal:</span><span className="text-base text-text-body">{ipInfo.geolocation?.postalCode || 'N/A'}</span></div>
                          <div className="flex items-center" title="Latitude"><span className="material-symbols-outlined text-base mr-2 text-text-muted-2 flex-shrink-0">pin_drop</span><span className="text-text-muted-1 mr-2">Latitude:</span><span className="text-base text-text-body">{ipInfo.latitude ?? 'N/A'}</span></div>
                          <div className="flex items-center" title="Longitude"><span className="material-symbols-outlined text-base mr-2 text-text-muted-2 flex-shrink-0">pin_drop</span><span className="text-text-muted-1 mr-2">Longitude:</span><span className="text-base text-text-body">{ipInfo.longitude ?? 'N/A'}</span></div>
                          <div className="flex items-center col-span-2" title="Timezone"><span className="material-symbols-outlined text-base mr-2 text-text-muted-2 flex-shrink-0">schedule</span><span className="text-text-muted-1 mr-2">Timezone:</span><span className="text-base text-text-body">{ipInfo.geolocation?.timezoneId || 'N/A'}</span></div>
                          <div className="flex items-center" title="Timezone Offset"><span className="material-symbols-outlined text-base mr-2 text-text-muted-2 flex-shrink-0">schedule</span><span className="text-text-muted-1 mr-2">Offset:</span><span className="text-base text-text-body">{ipInfo.geolocation?.timezoneOffset || 'N/A'}</span></div>
                        </div>
                      </div>
                      <div className="pt-2">
                        <h5 className="text-sm font-semibold uppercase tracking-wider text-text-muted-2 mb-2">Network Details</h5>
                        <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                          <div className="flex items-center min-w-0 col-span-2" title="Organization"><span className="material-symbols-outlined text-base mr-2 text-text-muted-2 flex-shrink-0">business_center</span><span className="text-text-muted-1 mr-2">Organization:</span><span className="text-base text-text-body truncate">{ipInfo.network?.organization || 'N/A'}</span></div>
                          <div className="flex items-center min-w-0" title="ISP"><span className="material-symbols-outlined text-base mr-2 text-text-muted-2 flex-shrink-0">router</span><span className="text-text-muted-1 mr-2">ISP:</span><span className="text-base text-text-body truncate">{ipInfo.network?.isp || 'N/A'}</span></div>
                          <div className="flex items-center min-w-0" title="ASN"><span className="material-symbols-outlined text-base mr-2 text-text-muted-2 flex-shrink-0">hub</span><span className="text-text-muted-1 mr-2">ASN:</span><span className="text-base text-text-body truncate">{ipInfo.network?.asnRoute || 'N/A'}</span></div>
                          <div className="flex items-center min-w-0" title="ASN Number"><span className="material-symbols-outlined text-base mr-2 text-text-muted-2 flex-shrink-0">hub</span><span className="text-text-muted-1 mr-2">ASN#:</span><span className="text-base text-text-body truncate">{ipInfo.network?.asn || 'N/A'}</span></div>
                          <div className="flex items-center min-w-0 col-span-2" title="Domain"><span className="material-symbols-outlined text-base mr-2 text-text-muted-2 flex-shrink-0">domain</span><span className="text-text-muted-1 mr-2">Domain:</span><span className="text-base text-text-body truncate">{ipInfo.network?.asnDomain || 'N/A'}</span></div>
                          <div className="flex items-center" title="Anycast IP"><span className="material-symbols-outlined text-base mr-2 text-text-muted-2 flex-shrink-0">shuffle</span><span className="text-text-muted-1 mr-2">Anycast:</span><span className={`font-semibold ${ipInfo.isAnycast ? 'text-green-400' : 'text-text-body'}`}>{ipInfo.isAnycast ? 'Yes' : 'No'}</span></div>
                          <div className="flex items-center min-w-0 col-span-3" title="Hostname"><span className="material-symbols-outlined text-base mr-2 text-text-muted-2 flex-shrink-0">desktop_windows</span><span className="text-text-muted-1 mr-2">Hostname:</span><span className="text-base text-text-body truncate">{ipInfo.hostname || 'N/A'}</span></div>
                        </div>
                      </div>
                      <div className="pt-2">
                        <h5 className="text-sm font-semibold uppercase tracking-wider text-text-muted-2 mb-2">Security Info</h5>
                        <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                          <div className="flex items-center" title="Anonymous"><span className="material-symbols-outlined text-base mr-2 text-text-muted-2 flex-shrink-0">visibility_off</span><span className="text-text-muted-1 mr-2">Anonymous:</span><span className={`font-semibold ${ipInfo.security?.anonymous ? 'text-red-400' : 'text-text-body'}`}>{ipInfo.security?.anonymous ? 'Yes' : 'No'}</span></div>
                          <div className="flex items-center" title="Proxy"><span className="material-symbols-outlined text-base mr-2 text-text-muted-2 flex-shrink-0">https</span><span className="text-text-muted-1 mr-2">Proxy:</span><span className={`font-semibold ${ipInfo.security?.proxy ? 'text-red-400' : 'text-text-body'}`}>{ipInfo.security?.proxy ? 'Yes' : 'No'}</span></div>
                          <div className="flex items-center" title="VPN"><span className="material-symbols-outlined text-base mr-2 text-text-muted-2 flex-shrink-0">vpn_key</span><span className="text-text-muted-1 mr-2">VPN:</span><span className={`font-semibold ${ipInfo.security?.vpn ? 'text-red-400' : 'text-text-body'}`}>{ipInfo.security?.vpn ? 'Yes' : 'No'}</span></div>
                          <div className="flex items-center" title="Tor"><span className="material-symbols-outlined text-base mr-2 text-text-muted-2 flex-shrink-0">shield</span><span className="text-text-muted-1 mr-2">Tor:</span><span className={`font-semibold ${ipInfo.security?.tor ? 'text-red-400' : 'text-text-body'}`}>{ipInfo.security?.tor ? 'Yes' : 'No'}</span></div>
                          <div className="flex items-center col-span-2" title="Hosting"><span className="material-symbols-outlined text-base mr-2 text-text-muted-2 flex-shrink-0">cloud</span><span className="text-text-muted-1 mr-2">Hosting:</span><span className={`font-semibold ${ipInfo.security?.hosting ? 'text-yellow-400' : 'text-text-body'}`}>{ipInfo.security?.hosting ? 'Yes' : 'No'}</span></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="pt-2">
                    <h5 className="text-sm font-semibold uppercase tracking-wider text-text-muted-2 mb-2">AI Analysis</h5>
                    <p className="text-base text-text-muted-1 p-3 bg-secondary-bg border border-border-dark rounded-md leading-relaxed">
                      {ipInfo.analysis}
                    </p>
                  </div>
                </div>
              );
            }) : (
              <p className="text-text-muted-1 text-sm col-span-2 p-4 text-center">No IPs match the current filters.</p>
            )}
          </div>
        </section>
      </div>
    ) : (
      <NoDataMessage message="No IP addresses were found in the email to analyze." title="No IP Addresses Found" />
    )}
  </div>
);
