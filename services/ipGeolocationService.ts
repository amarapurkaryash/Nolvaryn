
import { AnalyzedIp, GeolocationInfo, NetworkInfo, SecurityInfo } from '../types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * Fetches geolocation data for a single IP address using curl to call ipwho.is service.
 * This approach uses curl which works well on Vercel's free tier and has no API limits.
 * @param ip The IP address (v4 or v6) to look up.
 * @returns A promise that resolves to a partial AnalyzedIp object with geolocation data.
 */
async function curlWithRetry(ip: string, maxRetries = 3): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Use curl with reasonable timeout and retry parameters
      const { stdout, stderr } = await execPromise(
        `curl -L -s --connect-timeout 8 --max-time 8 "https://ipwho.is/${ip}"`,
        { timeout: 10000 } // Total timeout including retry
      );

      if (stderr) {
        console.warn(`Curl attempt ${attempt + 1} for ${ip} produced stderr:`, stderr);
      }

      if (stdout) {
        return stdout;
      }

      throw new Error('Empty response from server');

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      console.error(`Curl attempt ${attempt + 1} failed:`, {
        error: lastError.message,
        ip,
      });
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

const getGeolocationForIp = async (ip: string): Promise<Partial<AnalyzedIp>> => {
  const emptyGeo: GeolocationInfo = { 
    city: 'N/A', 
    region: 'N/A', 
    country: 'N/A', 
    countryCode: 'N/A',
    postalCode: 'N/A', 
    latitude: 0,
    longitude: 0,
    timezoneId: 'N/A',
    timezoneOffset: 'N/A'
  };
  
  const emptyNetwork: NetworkInfo = {
    organization: 'N/A',
    isp: 'N/A',
    asn: 0,
    asnRoute: 'N/A',
    asnDomain: 'N/A'
  };
  
  const emptySecurity: SecurityInfo = {
    anonymous: false,
    proxy: false,
    vpn: false,
    tor: false,
    hosting: false
  };
  
  const failedResult: Partial<AnalyzedIp> = { 
    geolocation: emptyGeo, 
    network: emptyNetwork,
    security: emptySecurity,
    latitude: null, 
    longitude: null, 
    hostname: 'N/A', 
    isAnycast: false 
  };

  try {
    const response = await curlWithRetry(ip);
    const data = JSON.parse(response);

    if (!data.success) {
      console.warn(`Geolocation lookup failed for ${ip}: ${data.message}`);
      return failedResult;
    }

    // Check for private/bogon IP addresses
    const isPrivateIp = (() => {
      const ipv4Regex = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|127\.)/;
      const ipv6Regex = /^(::1|fe80:|fd00:)/;
      return ipv4Regex.test(ip) || ipv6Regex.test(ip);
    })();

    if (isPrivateIp) {
      console.log(`Geolocation not available for private IP ${ip}.`);
      return {
        geolocation: {
          city: 'Private Network',
          region: 'N/A',
          country: 'N/A',
          countryCode: 'N/A',
          postalCode: 'N/A',
          latitude: 0,
          longitude: 0,
          timezoneId: 'N/A',
          timezoneOffset: 'N/A'
        },
        network: {
          ...emptyNetwork,
          organization: 'Unroutable (Private) IP Address',
        },
        security: emptySecurity,
        latitude: null,
        longitude: null,
        hostname: 'N/A',
        isAnycast: false,
      };
    }

    // Sanitize and validate geolocation data
    const validateGeolocationData = (data: any) => {
      return {
        city: String(data.city || 'N/A').trim(),
        region: String(data.region || 'N/A').trim(),
        country: String(data.country || 'N/A').trim(),
        countryCode: String(data.country_code || 'N/A').trim(),
        postalCode: String(data.postal || 'N/A').trim(),
        latitude: Number(data.latitude) || 0,
        longitude: Number(data.longitude) || 0,
        timezoneId: String(data.timezone?.id || 'N/A').trim(),
        timezoneOffset: String(data.timezone?.utc || 'N/A').trim(),
      };
    };

    const validateNetworkData = (data: any) => {
      return {
        organization: String(data.connection?.org || 'N/A').trim(),
        isp: String(data.connection?.isp || 'N/A').trim(),
        asn: Number(data.connection?.asn || 0),
        asnRoute: data.connection?.asn ? `AS${data.connection.asn}` : 'N/A',
        asnDomain: String(data.connection?.domain || 'N/A').trim(),
      };
    };

    const validateSecurityData = (data: any) => {
      return {
        anonymous: Boolean(data.security?.anonymous),
        proxy: Boolean(data.security?.proxy),
        vpn: Boolean(data.security?.vpn),
        tor: Boolean(data.security?.tor),
        hosting: Boolean(data.security?.hosting),
      };
    };

    return {
      geolocation: validateGeolocationData(data),
      network: validateNetworkData(data),
      security: validateSecurityData(data),
      latitude: Number(data.latitude) || null,
      longitude: Number(data.longitude) || null,
      hostname: String(data.connection?.domain || 'N/A').trim(),
      isAnycast: false,
    };
  } catch (error) {
    console.error(`Error fetching geolocation for ${ip} from ipwho.is:`, error);
    return failedResult;
  }
};


export const augmentIpsWithGeolocation = async (ips: AnalyzedIp[] | undefined): Promise<AnalyzedIp[]> => {
    if (!ips || ips.length === 0) {
        return [];
    }

    const geoLookups = ips.map((ip) => getGeolocationForIp(ip.ip));
    const geoResults = await Promise.all(geoLookups);

    return ips.map((ip, index) => ({
        ...ip,
        ...geoResults[index],
    }));
};