// Console-based audit logging for Vercel (no filesystem)
interface AuditEvent {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  event: string;
  data: Record<string, any>;
  requestId?: string;
  fingerprint?: string;
}

class ConsoleAuditLogger {
  logSecurityEvent(event: string, data: Record<string, any>, level: AuditEvent['level'] = 'WARN'): void {
    const auditEvent: AuditEvent = {
      timestamp: new Date().toISOString(),
      level,
      event,
      data: {
        ...data,
        apiKey: data.apiKey ? data.apiKey.substring(0, 8) + '...' : undefined,
      },
      requestId: crypto.randomUUID(),
    };
    
    // Log to console with structured format
    console.log(JSON.stringify({
      type: 'AUDIT_LOG',
      ...auditEvent
    }));
  }
  
  logApiRequest(event: string, data: Record<string, any>): void {
    const auditEvent: AuditEvent = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      event,
      data: {
        ...data,
        apiKeyHash: data.apiKey ? require('./security').hashForLogging(data.apiKey) : undefined,
      },
      requestId: crypto.randomUUID(),
    };
    
    console.log(JSON.stringify({
      type: 'AUDIT_LOG',
      ...auditEvent
    }));
  }
}

export const auditLogger = new ConsoleAuditLogger();