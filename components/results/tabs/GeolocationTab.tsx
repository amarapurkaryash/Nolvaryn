import React from 'react';
import { AnalysisResult, AnalyzedIp } from '../../../types';
import { NoDataMessage, TabSummary, IpFilterControls } from '../shared';
import { WorldMap } from '../../WorldMap';

interface GeolocationTabProps {
  result: AnalysisResult;
  visibleIps: string[];
  filteredIps: AnalyzedIp[];
  ipVersionFilter: 'all' | 'ipv4' | 'ipv6';
  ipTypeFilter: 'all' | 'origin' | 'hop';
  onIpVersionFilterChange: (value: 'all' | 'ipv4' | 'ipv6') => void;
  onIpTypeFilterChange: (value: 'all' | 'origin' | 'hop') => void;
  onToggleIpVisibility: (ip: string) => void;
}

export const GeolocationTab: React.FC<GeolocationTabProps> = ({
  result,
  visibleIps,
  filteredIps,
  ipVersionFilter,
  ipTypeFilter,
  onIpVersionFilterChange,
  onIpTypeFilterChange,
  onToggleIpVisibility,
}) => (
  <div className="animate-fade-in">
    <TabSummary>Explore the geographical journey of the email. This interactive map plots the locations of all servers (IP addresses) involved in the email's transit, helping to identify unusual or international routing paths.</TabSummary>
    {(Array.isArray(result.indicators?.ips) ? result.indicators.ips : []).length > 0 ? (
      <div className="space-y-6">
        <section>
          <div className="flex items-center mb-4">
            <span className="material-symbols-outlined text-2xl text-accent-primary">public</span>
            <h4 className="text-xl font-bold text-text-heading ml-3">Geolocation Intelligence</h4>
          </div>
          <div className="h-[500px] bg-primary-bg p-2 border border-border-dark rounded-lg relative overflow-hidden">
            <WorldMap
              locations={[
                ...(Array.isArray(result.indicators?.ips) ? result.indicators.ips : [])
                  .filter(ip => visibleIps.includes(ip.ip))
                  .map(ip => ({
                    ip: ip.ip,
                    latitude: ip.latitude || null,
                    longitude: ip.longitude || null,
                    type: ip.type,
                    geolocation: `${ip.geolocation?.city || 'Unknown'}, ${ip.geolocation?.country || 'Unknown'}`,
                  })),
              ]}
            />
          </div>
        </section>
        <section>
          <div className="flex items-center mb-4">
            <span className="material-symbols-outlined text-2xl text-accent-secondary">tune</span>
            <h4 className="text-xl font-bold text-text-heading ml-3">IP Visibility Control</h4>
          </div>
          <IpFilterControls
            ipVersionFilter={ipVersionFilter}
            ipTypeFilter={ipTypeFilter}
            onIpVersionFilterChange={onIpVersionFilterChange}
            onIpTypeFilterChange={onIpTypeFilterChange}
          />
          <div className="bg-primary-bg p-4 border border-border-dark rounded-lg">
            <div className="grid grid-cols-2 gap-3">
              {filteredIps.length > 0 ? filteredIps.map((ipInfo, index) => {
                const isVisible = visibleIps.includes(ipInfo.ip);
                const isGeoAvailable = ipInfo.latitude != null && ipInfo.longitude != null && !(ipInfo.latitude === 0 && ipInfo.longitude === 0);
                return (
                  <div key={index} className="flex items-center justify-between p-2 bg-secondary-bg border border-border-dark rounded-md">
                    <div className="flex items-center min-w-0">
                      <span className={`material-symbols-outlined text-lg flex-shrink-0 ${ipInfo.type === 'origin' ? 'text-red-400' : 'text-text-muted-2'}`}>
                        {ipInfo.type === 'origin' ? 'person' : 'dns'}
                      </span>
                      <div className="ml-3 min-w-0">
                        <code className="text-base font-medium text-text-body truncate" title={ipInfo.ip}>{ipInfo.ip}</code>
                        <p className="text-sm text-text-muted-2 capitalize">{ipInfo.type}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onToggleIpVisibility(ipInfo.ip)}
                      disabled={!isGeoAvailable}
                      className="p-1.5 rounded-full text-text-muted-2 hover:bg-border-dark hover:text-text-body transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={isGeoAvailable ? (isVisible ? 'Hide on map' : 'Show on map') : 'Geolocation not available'}
                    >
                      <span className={`material-symbols-outlined text-xl ${!isGeoAvailable ? '' : (isVisible ? 'text-accent-secondary' : '')}`}>
                        {!isGeoAvailable ? 'visibility_off' : (isVisible ? 'visibility' : 'visibility_off')}
                      </span>
                    </button>
                  </div>
                );
              }) : (
                <p className="text-text-muted-1 text-sm text-center p-4 col-span-full">No IPs match the current filters.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    ) : (
      <NoDataMessage message="No IP addresses were found in the email to geolocate." title="No Geolocation Data" />
    )}
  </div>
);
