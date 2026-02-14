
import { PreliminaryUrlAnalysis } from '../types';

interface ExtractedUrl {
  url: string;
  context: string | null; // e.g., anchor text
}

// --- Constants for Checks ---
const SUSPICIOUS_TLDS = ['.zip', '.mov', '.xyz', '.top', '.info', '.club', '.site', '.live', '.online'];
const SUSPICIOUS_KEYWORDS = ['login', 'verify', 'account', 'secure', 'update', 'password', 'confirm', 'bank'];
const MAX_URL_LENGTH = 150;

/**
 * A simplified, non-robust way to extract URLs and their anchor text from HTML content.
 * This is a best-effort approach without a full DOM parser.
 */
const extractUrlsFromHtml = (htmlContent: string): ExtractedUrl[] => {
    const results: ExtractedUrl[] = [];
    const anchorRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*?>(.*?)<\/a>/gi;
    let match;
    while ((match = anchorRegex.exec(htmlContent)) !== null) {
        const url = match[2];
        const rawContext = match[3];
        // Clean up context: remove inner HTML tags for a simple text representation
        const context = rawContext.replace(/<[^>]+>/g, '').trim();
        results.push({ url, context });
    }
    return results;
};


/**
 * Extracts URLs from plain text content using a general regex.
 */
const extractUrlsFromText = (textContent: string): ExtractedUrl[] => {
    const urlRegex = /(https?:\/\/[^\s"'<>`\])]+)/gi;
    const urls = textContent.match(urlRegex) || [];
    // Remove duplicates and map to the expected structure
    return [...new Set(urls)].map(url => ({ url, context: null }));
};

/**
 * Performs a series of deterministic checks on a given URL.
 */
const performChecks = (extracted: ExtractedUrl): PreliminaryUrlAnalysis => {
    const { url, context } = extracted;
    const signals: string[] = [];
    let score = 100; // Start with a perfect score

    try {
        const urlObject = new URL(url);
        const domain = urlObject.hostname;
        const path = urlObject.pathname + urlObject.search;

        // 1. Protocol Check
        if (urlObject.protocol !== 'https:') {
            signals.push('Protocol is not secure HTTPs.');
            score -= 25;
        }

        // 2. Domain Check: IP Address
        const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
        if (ipRegex.test(domain)) {
            signals.push('Domain is a numeric IP address.');
            score -= 40;
        }
        
        // 3. Domain Check: Suspicious TLD
        for (const tld of SUSPICIOUS_TLDS) {
            if (domain.endsWith(tld)) {
                signals.push(`Uses suspicious TLD: ${tld}.`);
                score -= 30;
                break;
            }
        }

        // 4. Path/Query Check: Suspicious Keywords
        for (const keyword of SUSPICIOUS_KEYWORDS) {
            if (path.toLowerCase().includes(keyword)) {
                signals.push(`URL contains suspicious keyword: "${keyword}".`);
                score -= 15;
                break; // only count first keyword found
            }
        }

        // 5. Length Check
        if (url.length > MAX_URL_LENGTH) {
            signals.push(`URL is excessively long (${url.length} chars).`);
            score -= 10;
        }

        // 6. Context Mismatch Check
        if (context && context.length > 0 && !url.includes(context) && !domain.includes(context.split('.')[0])) {
            // A simple check: if the anchor text (e.g., "google.com") isn't found in the URL.
            const domainFromContext = context.match(/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/);
            if(domainFromContext && !domain.includes(domainFromContext[0])){
               signals.push(`Link text "${context}" mismatches the actual domain "${domain}".`);
               score -= 50;
            }
        }

    } catch (e) {
        // Handle invalid URLs
        signals.push('URL is malformed or could not be parsed.');
        score = 0;
    }

    // Clamp score between 0 and 100
    const preliminaryScore = Math.max(0, Math.min(100, Math.floor(score)));

    return { url, context, preliminaryScore, signals };
};


/**
 * Main function to extract and pre-analyze URLs from raw EML content.
 * This is a simplified implementation that uses regex and does not handle
 * complex MIME structures or encodings like base64 or quoted-printable.
 */
export const preAnalyzeUrls = (emlContent: string): PreliminaryUrlAnalysis[] => {
    // A very basic way to check if there's an HTML part.
    const isHtmlMail = /content-type: text\/html/i.test(emlContent);
    
    let extractedUrls: ExtractedUrl[];

    if (isHtmlMail) {
        // Best-effort extraction from the whole content as if it's HTML
        extractedUrls = extractUrlsFromHtml(emlContent);
    } else {
        // Fallback to plain text extraction
        extractedUrls = extractUrlsFromText(emlContent);
    }
    
    // Also run plain text extractor to catch URLs not in <a> tags
    const textUrls = extractUrlsFromText(emlContent);
    
    // Combine and deduplicate
    const allUrls = new Map<string, ExtractedUrl>();
    [...extractedUrls, ...textUrls].forEach(u => {
        // Prefer entries with context
        if (!allUrls.has(u.url) || (u.context && !allUrls.get(u.url)?.context)) {
            allUrls.set(u.url, u);
        }
    });

    const uniqueExtractedUrls = Array.from(allUrls.values());

    return uniqueExtractedUrls.map(performChecks);
};
