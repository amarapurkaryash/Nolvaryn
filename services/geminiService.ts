
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, PreliminaryUrlAnalysis } from '../types';

/**
 * Safely extracts a JSON object from a string that may be wrapped in markdown.
 * @param text The raw text response from the model.
 * @returns The parsed JSON object.
 * @throws An error if the response cannot be parsed as JSON.
 */
const extractJson = (text: string): any => {
    const trimmedText = text.trim();
    // Regex to find a JSON block enclosed in ```json ... ``` or ``` ... ```
    const jsonMatch = trimmedText.match(/```(?:json\s*)?([\s\S]*?)```/);

    // If a JSON block is found, try to parse its content
    if (jsonMatch && jsonMatch[1]) {
        try {
            return JSON.parse(jsonMatch[1]);
        } catch (e) {
            console.error("Failed to parse extracted JSON from markdown block:", e);
            // Fallback to parsing the whole string if extraction parsing fails,
            // as the markdown block itself might be malformed.
        }
    }

    // If no markdown block is found, or if parsing it fails, try parsing the whole text
    try {
        return JSON.parse(trimmedText);
    } catch (e) {
        console.error("Failed to parse the entire response as JSON:", e);
        console.error("Raw response text was:", text);
        // Throw a specific error to be caught by the calling function's handler
        throw new Error("Response from the AI model was not valid JSON.");
    }
}

const authResultSchema = {
    type: Type.OBJECT,
    properties: {
        status: { type: Type.STRING, description: "The single-word result status (e.g., 'Pass', 'Fail', 'Neutral', 'SoftFail', 'None')." },
        explanation: { type: Type.STRING, description: "A detailed explanation of what the protocol is, why this email received this status, and the security implication." }
    }
};

const riskFactorSchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING, description: "A concise, one-sentence description of the factor." },
        impact: { type: Type.STRING, description: "The impact level of this factor on the score. Must be one of: 'Low', 'Medium', 'High', 'Critical'." },
    }
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    phishingProbability: {
      type: Type.INTEGER,
      description: "The final risk score from 0 to 100."
    },
     phishingProbabilityExplanation: {
        type: Type.STRING,
        description: "A concise, one or two-sentence explanation that justifies the overall phishingProbability score, highlighting the most critical factors that influenced it."
    },
    riskScoreAnalysis: {
        type: Type.OBJECT,
        description: "A detailed breakdown of factors contributing to the phishing probability score.",
        properties: {
            positiveFactors: {
                type: Type.ARRAY,
                description: "A list of factors that indicate legitimacy. NOTE: These are informational only and do NOT mathematically subtract from the risk score. Examples: 'SPF/DKIM/DMARC all passed', 'Sender domain matches a known, reputable company'.",
                items: riskFactorSchema,
            },
            negativeFactors: {
                type: Type.ARRAY,
                description: "A list of red flags that indicate risk and increased the score. Examples: 'Urgency and threatening language used', 'URL domain is a new, unregistered domain'.",
                items: riskFactorSchema,
            },
            scoreCalculation: {
                type: Type.STRING,
                description: "A step-by-step mathematical breakdown based on the Weighted Component Model. Format: start new lines with '+' for additions. DO NOT show separators like '---' or '==='."
            },
            finalRationale: {
                type: Type.STRING,
                description: "A concluding rationale of how the positive and negative factors were weighed to arrive at the final phishingProbability score. Explain the reasoning clearly."
            }
        }
    },
    keyFindings: {
      type: Type.ARRAY,
      description: "A list of the most critical risk factors identified in the email. Provide specific, actionable findings.",
      items: {
        type: Type.OBJECT,
        properties: {
            finding: { type: Type.STRING, description: "A concise, one-line summary of the risk factor (e.g., 'Sender Impersonation')." },
            explanation: { type: Type.STRING, description: "A detailed explanation of WHY this was flagged. Be specific and quote evidence from the email if possible (e.g., 'The display name 'Bank Support' mismatches the sender's generic email domain 'mailer-usa.com'.')." },
            source: { type: Type.STRING, description: "The exact part of the email where this was found (e.g., 'Email Body', 'From Header', 'URL Query Parameters', 'Attachment: invoice.zip')." },
            severity: { type: Type.STRING, description: "The severity of the finding. Must be one of: 'Low', 'Medium', 'High', 'Critical'." },
        }
      }
    },
    recommendedActions: {
      type: Type.ARRAY,
      description: "A list of clear, actionable steps the user should take. Each item should be an object with a primary 'action' and a list of detailed 'details'.",
      items: {
        type: Type.OBJECT,
        properties: {
          action: { type: Type.STRING, description: "A concise, one-sentence summary of the recommended action (e.g., 'Delete this email immediately')." },
          details: {
            type: Type.ARRAY,
            description: "A list of detailed, step-by-step instructions or explanations for how to perform the action. Each string should be a single step (e.g., 'Do not reply, forward, or click any links.', 'Move the email to your trash or junk folder.').",
            items: { type: Type.STRING }
          }
        },
        required: ["action", "details"]
      }
    },
    emailInfo: {
      type: Type.OBJECT,
      properties: {
        from: { type: Type.STRING, description: "The value of the 'From' header." },
        to: { type: Type.STRING, description: "The value of the 'To' header." },
        subject: { type: Type.STRING, description: "The subject line of the email." },
        date: { type: Type.STRING, description: "The date the email was sent." },
        replyTo: { type: Type.STRING, description: "The 'Reply-To' header, if present. Otherwise, return 'N/A'." },
        authenticationResults: { type: Type.STRING, description: "Summary of authentication results like SPF, DKIM, DMARC. e.g., 'SPF: Pass, DKIM: Fail'. If not present, return 'N/A'." },
        bodySnippet: { type: Type.STRING, description: "A concise AI-generated overview of the entire email's content and intent, roughly 5 to 10 lines long. It should capture the main purpose of the email, such as a notification, a request, or a marketing message, and mention any key entities or calls to action." },
      }
    },
    urls: {
      type: Type.ARRAY,
      description: "A list of all URLs found in the email body, analyzed based on a security checklist.",
      items: {
        type: Type.OBJECT,
        properties: {
            url: { type: Type.STRING },
            safetyScore: { 
                type: Type.INTEGER, 
                description: "A score from 0 to 100 indicating the safety of the URL, derived from the signals found. 0 is highly suspicious, 100 is safe." 
            },
            verdict: {
                type: Type.STRING,
                description: "A single-word verdict for the URL. Must be one of: 'Safe', 'Suspicious', 'Caution', 'Manual Review'."
            },
            positiveSignals: {
                type: Type.ARRAY,
                description: "A list of positive security signals observed for this URL. Example: 'Uses secure HTTPS protocol'.",
                items: { type: Type.STRING }
            },
            negativeSignals: {
                type: Type.ARRAY,
                description: "A list of negative security signals (red flags) observed for this URL. Be specific. Example: 'Domain contains an IP address instead of a name'.",
                items: { type: Type.STRING }
            },
            verdictReason: {
                type: Type.STRING,
                description: "A concise explanation for why this URL received its verdict (e.g., 'Safe', 'Caution', 'Suspicious'), highlighting the key signals that led to this conclusion."
            },
            detailedAnalysis: {
                type: Type.STRING,
                description: "A concise, one or two-sentence overview explaining the synthesized findings and the context of the URL within the email."
            }
        },
        required: ["url", "safetyScore", "verdict", "positiveSignals", "negativeSignals", "verdictReason", "detailedAnalysis"]
      }
    },
    attachments: {
      type: Type.ARRAY,
      description: "A list of all attachments found in the email, identified by their metadata.",
      items: {
        type: Type.OBJECT,
        properties: {
          filename: { type: Type.STRING, description: "The attachment's filename." },
          filetype: { type: Type.STRING, description: "The MIME type of the attachment (e.g., 'application/pdf')." },
          contentId: { type: Type.STRING, description: "The Content-ID header value, if present. Otherwise return 'N/A'." },
          sizeInBytes: { type: Type.INTEGER, description: "The approximate size of the attachment in bytes, calculated from its encoded content. If size cannot be determined, return 0." },
          isInline: { type: Type.BOOLEAN, description: "True if the Content-Disposition is 'inline', false if it is 'attachment' or not specified." },
          warning: { 
              type: Type.STRING, 
              description: "A concise, one-sentence security warning about this attachment, based on its filename and type. Examples: 'This is an executable file, which is high-risk.' or 'Macro-enabled documents can contain malicious code.' or 'Always scan attachments before opening.' If no specific risk is identified from metadata, provide a general caution."
          }
        },
        required: ["filename", "filetype", "contentId", "sizeInBytes", "isInline", "warning"]
      }
    },
    indicators: {
        type: Type.OBJECT,
        description: "Extraction of all Indicators of Compromise (IOCs) from the email.",
        properties: {
            ips: { 
              type: Type.ARRAY, 
              description: "A comprehensive list of every public IPv4 and IPv6 address found anywhere in the email headers or body. Each IP must have a detailed analysis. DO NOT include geolocation data, ISP, latitude or longitude.", 
              items: {
                type: Type.OBJECT,
                properties: {
                  ip: { type: Type.STRING, description: "The IP address." },
                  type: { type: Type.STRING, description: "The type of IP. The first public IP in the 'Received' chain is the 'origin', all subsequent IPs are 'hop's. Mark one as 'origin'." },
                  analysis: { type: Type.STRING, description: "A brief, one-sentence analysis of the IP's reputation. Mention if it's on a blocklist, associated with a known service, or appears suspicious." }
                }
              } 
            },
            domains: { 
                type: Type.ARRAY, 
                description: "A list of all fully qualified domain names found in headers and body, each with contextual analysis.", 
                items: { 
                    type: Type.OBJECT,
                    properties: {
                        domain: { type: Type.STRING, description: "The domain name." },
                        type: { type: Type.STRING, description: "The category of the domain. Must be one of: 'sending-domain', 'mail-server-hop', 'linked-in-url', 'mentioned-in-body'." },
                        analysis: { type: Type.STRING, description: "A brief, one-sentence analysis of the domain's context or reputation. Example: 'This is the claimed sender domain from the From header.' or 'Domain is for a legitimate file sharing service.'" }
                    }
                } 
            },
            emails: { 
                type: Type.ARRAY, 
                description: "A list of all email addresses found in headers (From, To, Reply-To) and the body, each with contextual analysis.", 
                items: { 
                    type: Type.OBJECT,
                    properties: {
                        email: { type: Type.STRING, description: "The email address." },
                        type: { type: Type.STRING, description: "The category of the email address. Must be one of: 'sender', 'recipient', 'reply-to', 'mentioned-in-body'." },
                        analysis: { type: Type.STRING, description: "A brief, one-sentence analysis of the email's context or reputation. Example: 'This is the sender of the email.' or 'This address is known for disposable email services.'" }
                    }
                }
            },
        }
    },
    headerAnalysis: {
        type: Type.OBJECT,
        description: "Detailed analysis of the email headers for forensic purposes.",
        properties: {
            receivedPath: { 
              type: Type.ARRAY, 
              description: "An ordered list of objects, where each object represents a hop in the email's delivery path, derived from parsing the 'Received' headers from bottom to top.", 
              items: { 
                type: Type.OBJECT,
                properties: {
                  from: { type: Type.STRING, description: "The server that sent the email for this hop, including its IP if available. e.g., 'mail-sor-f69.google.com ([209.85.220.69])'." },
                  by: { type: Type.STRING, description: "The server that received the email for this hop. e.g., 'mx.google.com'." },
                  protocol: { type: Type.STRING, description: "The protocol used for the transfer. e.g., 'ESMTPS'." },
                  timestamp: { type: Type.STRING, description: "The full timestamp of when this hop occurred." },
                  analysis: { type: Type.STRING, description: "A brief, one-sentence analysis of this hop. Note any potential spoofing indicators, large delays, or if the server seems legitimate (e.g., 'Legitimate Google mail server')." }
                },
                required: ["from", "by", "protocol", "timestamp", "analysis"]
              } 
            },
            spfResult: { ...authResultSchema, description: "The final SPF check result and explanation." },
            dkimResult: { ...authResultSchema, description: "The final DKIM check result and explanation." },
            dmarcResult: { ...authResultSchema, description: "The final DMARC check result and explanation." },
        }
    },
    mitreAttackTechniques: {
        type: Type.ARRAY,
        description: "A list of relevant MITRE ATT&CK framework techniques observed in the email.",
        items: {
            type: Type.OBJECT,
            properties: {
                techniqueId: { type: Type.STRING, description: "The MITRE ATT&CK technique ID (e.g., 'T1566.001')." },
                techniqueName: { type: Type.STRING, description: "The name of the MITRE ATT&CK technique (e.g., 'Spearphishing Attachment')." },
                description: { 
                    type: Type.STRING, 
                    description: "A detailed but concise explanation of how this technique specifically applies to the analyzed email. For example, if T1566.001 is identified, the description should be something like 'The email contains a ZIP attachment named 'invoice.zip', which is a common method for delivering malicious payloads via spearphishing.'" 
                }
            }
        }
    }
  }
};

export const analyzeEmail = async (emlContent: string, preliminaryUrlAnalyses: PreliminaryUrlAnalysis[], apiKey: string): Promise<AnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey });

    const urlAnalysisContext = preliminaryUrlAnalyses.length > 0
        ? preliminaryUrlAnalyses.map(analysis =>
            `- URL: ${analysis.url}\n` +
            `  - Context Text: ${analysis.context || 'N/A'}\n` +
            `  - Preliminary Score: ${analysis.preliminaryScore}/100\n` +
            `  - Deterministic Signals Found: ${analysis.signals.join(', ') || 'None'}`
        ).join('\n\n')
        : 'No URLs were found by the pre-analysis script.';

    const mainPrompt = `Perform a deep security analysis of the following raw .eml file content for a security professional. The analysis must be thorough and structured according to the provided schema. It is absolutely critical that your analysis is deterministic and repeatable; given the same .eml input, you must always return the exact same JSON output.
      - Evaluate phishing probability, key findings, and actions based on a consistent internal rubric.
      - **Risk Score Explanation:** You MUST provide a detailed breakdown of the factors contributing to the phishingProbability score in the 'riskScoreAnalysis' object. List positive factors that indicate legitimacy and negative factors that indicate risk. Assign an impact level to each factor and provide a final summary explaining how these factors were weighed to arrive at the score.
      
      - **Score Calculation Logic (WEIGHTED COMPONENT MODEL):**
        You MUST calculate the risk score (0-100) by evaluating these 4 specific components. The maximum points for all components sum to exactly 100.
        This model ensures the score includes every factor, covers all analysis aspects, and naturally caps at 100 without artificial limits.
        
        **1. Threat Indicators (URLs & Attachments) [Max 40 pts]**
           - Assess the maliciousness of links and attachments.
           - 40 pts: Malware, known phishing kits, or high-risk executables found.
           - 20-30 pts: Suspicious links, credential harvesting patterns, or macro-enabled docs.
           - 0-10 pts: Low-risk file types or ambiguous links.

        **2. Sender Identity & Authentication [Max 30 pts]**
           - Assess who sent it and if they are authorized.
           - 30 pts: Confirmed spoofing, failed DMARC (reject/quarantine), or mismatched From/Reply-To.
           - 15-20 pts: Soft-fail SPF/DKIM, new domains (<24h), or free email providers for business context.
           - 0 pts: Fully authenticated, trusted sender (Pass/Pass/Pass).

        **3. Content Analysis (Social Engineering) [Max 20 pts]**
           - Assess the psychological manipulation involved.
           - 20 pts: Extreme urgency ("Immediate Action"), threats of loss, or authority impersonation (CEO Fraud).
           - 10-15 pts: Requests for sensitive data (PII, credentials, finance) or unusual tone.
           - 0 pts: Neutral, expected business communication.

        **4. Technical Anomalies [Max 10 pts]**
           - Assess the technical headers and infrastructure.
           - 10 pts: Origin IP on blocklists, bad reputation, or impossible travel (geo-anomaly).
           - 5 pts: Broken headers, inconsistent client IDs, or mass-mailer indicators.
           - 0 pts: Clean headers and reputable infrastructure.

        **Output Format for 'scoreCalculation':**
        - Start with "Baseline Score: 0 pts".
        - For each component where points are added (>0), output a line starting with "+".
        - The description in the parenthesis must explicitly state the specific impact or severity reason.
        - **DO NOT** show separator lines (like '---' or '===').
        - End with "Final Score: [Total] / 100".
        
        Example:
        "Baseline Score: 0 pts
         + 30 pts (Threat Indicators: High-severity phishing link detected)
         + 20 pts (Sender Identity: Critical DMARC failure)
         + 15 pts (Content Analysis: Medium impact urgency detected)
         + 5 pts (Technical Anomalies: Origin IP has low reputation)
         Final Score: 70 / 100"

      - **Recommended Actions:** You MUST provide a list of actions as objects, each with a concise 'action' title and an array of 'details' strings providing specific steps for the user. For example: { action: 'Secure Your Account', details: ['Change your password immediately.', 'Enable two-factor authentication.'] }
      - If the email body is empty but attachments are present, highlight this as a potential tactic to evade content scanners and focus the analysis on the attachments as the primary payload delivery mechanism.
      - For any attachments found within the .eml file, extract their full metadata: filename, MIME file type, Content-ID (return 'N/A' if not present), and Content-Disposition. Determine if the disposition is 'inline' (true) or 'attachment'/'unspecified' (false). You MUST also calculate the approximate size in bytes from the encoded content (return 0 if unable to determine). Based on all this metadata, provide a concise, one-sentence security warning. Do not perform a deep analysis or provide a safety score.
      - Extract ALL Indicators of Compromise (IOCs). This is a critical step. Examine every line of the headers and body. You MUST extract every single public IPv4 and IPv6 address found. For each IP, provide a detailed reputation analysis and determine its type ('origin' or 'hop'). Do NOT provide geolocation data, ISP, latitude, or longitude; this will be handled externally. For all extracted domains and emails, categorize them based on their context (e.g., 'sender', 'recipient', 'linked-in-url') and provide a brief one-sentence analysis of its reputation or role.
      - Perform a detailed header analysis: parse each 'Received' header from bottom to top to trace the email's path. For each hop, extract the sending server ('from'), receiving server ('by'), the protocol ('with'), and the full timestamp. Provide a brief analysis for each hop, noting potential spoofing indicators like mismatches in server names or unusual delays. For the final SPF, DKIM, and DMARC checks, provide the single-word status (e.g. 'Pass', 'Fail') and a detailed explanation in the respective fields. The explanation should cover what each protocol does, why the email passed or failed, and the security implications.
      - Identify and map the email's characteristics to the MITRE ATT&CK framework. This is a critical step for understanding the attacker's methodology. Thoroughly evaluate the email against the following comprehensive list of observable email-related techniques. You MUST only select techniques from this list. For each technique you identify as present, you MUST provide the correct ID, name, and a specific, contextual description explaining exactly *how* the email exhibits that technique. Be specific and tie your description directly to the email's content.

      LIST OF APPLICABLE MITRE ATT&CK® TECHNIQUES (Sorted by ID):
      - T1027: Obfuscated Files or Information: The email uses techniques to hide its true intent, such as using URL shorteners, hiding text with CSS, embedding encoded scripts, or using non-standard file attachments to evade detection.
      - T1059: Command and Scripting Interpreter: The email contains an attachment, such as a macro-enabled Office document (.docm, .xlsm), or a script file (.vbs, .js, .ps1, .bat), which, when executed by the user, runs code via a command-line interface or scripting language interpreter.
      - T1189: Drive-by Compromise: The email attempts to lure the user to a website that could potentially exploit their browser to deliver malware without further user interaction beyond clicking the link.
      - T1204.002: User Execution: Malicious File: The email contains an attachment of a type that requires the user to open it to trigger a malicious action, such as an executable (.exe), a script, or a macro-enabled document. This is a general category for user-initiated execution.
      - T1534: Internal Spearphishing: The sender's address is spoofed or originates from a compromised account to appear as if it originates from within the recipient's own organization.
      - T1566.001: Spearphishing Attachment: The email contains an attachment of any type (e.g., PDF, ZIP, document) intended to be opened by the user to deliver a payload or malicious link.
      - T1566.002: Spearphishing Link: The email contains a hyperlink for the user to click, which leads to a malicious site for payload delivery or credential theft.
      - T1566.003: Spearphishing via Service: The email contains a link to a legitimate, well-known service (e.g., Google Drive, Dropbox, OneDrive, WeTransfer) that is being used to host the malicious payload or phishing page.
      - T1598: Phishing for Information: The email's primary goal is to solicit sensitive information (credentials, financial details, PII) from the victim, often through a linked form or by asking for a direct reply.
      - T1656.001: Brand Impersonation: The email's content, sender name, or visual elements mimic a well-known company, service, or brand to appear legitimate.
      - T1656.002: Person Impersonation: The email sender is pretending to be a specific, real person, often someone of authority or a trusted colleague (e.g., CEO fraud, business email compromise).

      --- URL ANALYSIS ---
      The following URLs were extracted and pre-analyzed by a deterministic script. Your task is to act as an expert reviewer. You must:
      1. Review the preliminary data and verify the URLs against the full email context. You may find more URLs the script missed; analyze those as well.
      2. Perform your own deep analysis, looking for things the script cannot, such as brand impersonation, domain reputation, newly registered domains, and other contextual clues.
      3. Synthesize both the script's findings and your own to populate the 'urls' field in the JSON output for EACH URL. For each URL, you MUST assign one of the following four verdicts:
         - 'Safe': Confirmed to be not a threat. Use for well-known, legitimate domains with no red flags.
         - 'Suspicious': There are potential red flags, but it's not a confirmed threat. The user should be wary.
         - 'Caution': This is a confirmed or highly likely threat. Use for URLs with multiple strong red flags like domain impersonation or known malicious patterns. The user should not click this.
         - 'Manual Review': There is not enough information to make a determination, or the URL's nature is ambiguous (e.g., a generic file-sharing link). The user should investigate it themselves before trusting it.
      4. The 'positiveSignals' and 'negativeSignals' lists must be a comprehensive combination of the script's signals and your own findings.
      5. For the 'verdictReason' field, you MUST provide a concise explanation for why the URL received its verdict, highlighting the key signals that led to the conclusion.
      6. The 'detailedAnalysis' field must be the final, synthesized overview of the URL's context within the email.

      PRELIMINARY URL FINDINGS:
      ${urlAnalysisContext}
      ---
      `;

    const fullPrompt = `${mainPrompt}\n\n---\n\n${emlContent}`;

    const parts: any[] = [{ text: fullPrompt }];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        systemInstruction: "You are a meticulous cybersecurity analyst. Your primary goal is to provide a deterministic, repeatable, and factually accurate analysis of email files. Given the same input, you MUST produce the exact same output, including scores, extracted indicators, and reasons. Prioritize consistency and precision over creativity.",
        temperature: 0.2,
        seed: 42,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const result = extractJson(response.text || '');

    // Basic validation to ensure the result matches the expected structure.
    if (!result || typeof result.phishingProbability !== 'number' || !result.indicators) {
        throw new Error("Invalid response structure from API.");
    }

    return result as AnalysisResult;

  } catch (error) {
    console.error("Error calling Gemini API:", error);

    // Default error message
    let detailedErrorMessage = "Failed to get analysis from the AI model. An unknown error occurred.";

    if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        // Check for specific error patterns from Google's API
        if (errorMessage.includes('api key not valid') || errorMessage.includes('invalid api key')) {
            detailedErrorMessage = "The provided Gemini API key is invalid or has been copied incorrectly. Please verify your key and try again.";
        } else if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('resource has been exhausted')) {
            detailedErrorMessage = "You have exceeded your usage quota for the Gemini API. Please check your Google AI account for quota details. This is a personal limit on your key, not an issue with the application.";
        } else if (errorMessage.includes('500') || errorMessage.includes('503') || errorMessage.includes('service unavailable') || errorMessage.includes('internal error')) {
            detailedErrorMessage = "The Gemini API service is temporarily unavailable or experiencing an internal error. This is likely a temporary issue on Google's end. Please try again in a few minutes.";
        } else if (errorMessage.includes('network request failed') || errorMessage.includes('failed to fetch')) {
             detailedErrorMessage = "A network error occurred while trying to contact the Gemini API. Please check your internet connection and try again.";
        } else if (errorMessage.includes('api key')) { // A more generic API key error
            detailedErrorMessage = "Failed to authenticate with the Gemini API. The provided API key may be invalid, expired, or lack the necessary permissions.";
        } else {
             // Keep the original error message for unknown errors to aid debugging.
             detailedErrorMessage = `An unexpected error occurred during analysis. Details: ${error.message}`;
        }
    }
    
    throw new Error(detailedErrorMessage);
  }
};
