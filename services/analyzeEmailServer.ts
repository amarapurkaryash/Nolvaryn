import crypto from 'crypto';
import { AnalysisResult } from '../types';
import { preAnalyzeUrls } from './manualUrlAnalyzer';
import { analyzeEmail as analyzeWithGemini } from './geminiService';
import { augmentIpsWithGeolocation } from './ipGeolocationService';

export const analyzeEmailServer = async (emlContent: string, apiKey: string): Promise<AnalysisResult & { analysisTime?: number }> => {
  const startTime = Date.now();
  
  const preliminaryUrlAnalyses = preAnalyzeUrls(emlContent);
  const initialResult = await analyzeWithGemini(emlContent, preliminaryUrlAnalyses, apiKey);
  const augmentedIps = await augmentIpsWithGeolocation(initialResult.indicators?.ips);
  
  const fileHash = crypto.createHash('sha256').update(emlContent).digest('hex');
  const analysisTime = Date.now() - startTime;
  
  // Calculate risk level based on phishing probability
  let riskLevel: string;
  const probability = initialResult.phishingProbability;
  if (probability >= 80) {
    riskLevel = 'Critical';
  } else if (probability >= 60) {
    riskLevel = 'High';
  } else if (probability >= 40) {
    riskLevel = 'Medium';
  } else if (probability >= 20) {
    riskLevel = 'Low';
  } else {
    riskLevel = 'Very Low';
  }
  
  return {
    ...initialResult,
    riskLevel, // Add calculated risk level
    emailInfo: {
      ...initialResult.emailInfo,
      fileHash,
    },
    indicators: {
      ...initialResult.indicators,
      ips: augmentedIps,
    },
    rawEml: emlContent,
    analysisTime, // Add timing information
  };
};
