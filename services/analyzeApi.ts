import { AnalysisResult } from '../types';

// Function to fetch CSRF token from API
const fetchCsrfToken = async (): Promise<string> => {
  try {
    const response = await fetch('/api/csrf', {
      method: 'GET',
      credentials: 'include' // Important to include cookies in cross-origin requests
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    }
    
    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw new Error('Failed to initialize security token');
  }
};

export const analyzeEmail = async (emlContent: string, apiKey: string): Promise<AnalysisResult> => {
  try {
    // Fetch CSRF token
    const csrfToken = await fetchCsrfToken();
    
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken
      },
      credentials: 'include', // Important to include cookies for CSRF validation
      body: JSON.stringify({ 
        emlContent, 
        apiKey,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to analyze the email.';
      try {
        const errorBody = await response.json();
        if (errorBody?.error) errorMessage = errorBody.error;
      } catch {
        // Ignore JSON parsing errors and use the default message.
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error('Analysis API error:', error);
    throw error;
  }
};
