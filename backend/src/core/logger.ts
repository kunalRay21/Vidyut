/**
 * Structured Observability Logger
 * Role: Phase 6 Production Hardening & Observability
 * 
 * Provides structured logging without external dependencies.
 * Automatically sanitizes sensitive data (passwords, JWTs, database credentials, API keys).
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  /**
   * Recursively sanitizes data to prevent credential and secret leakage in logs.
   */
  public sanitize(data: any): any {
    if (!data) return data;
    if (typeof data === 'string') {
      return data
        .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED]')
        .replace(/(password|secret|key|token)["']?\s*[:=]\s*["']?[^"',\s}]+/gi, '$1: [REDACTED]')
        .replace(/postgres(?:ql)?:\/\/[^@]+@/gi, 'postgresql://[REDACTED]@');
    }
    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        return data.map(item => this.sanitize(item));
      }
      const sanitized: Record<string, any> = {};
      for (const [k, v] of Object.entries(data)) {
        if (/password|secret|token|authorization|apiKey|key/i.test(k)) {
          sanitized[k] = '[REDACTED]';
        } else {
          sanitized[k] = this.sanitize(v);
        }
      }
      return sanitized;
    }
    return data;
  }

  private formatMessage(level: LogLevel, tag: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta !== undefined ? ` | meta: ${JSON.stringify(this.sanitize(meta))}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${tag}]: ${message}${metaStr}`;
  }

  public info(tag: string, message: string, meta?: any): void {
    console.log(this.formatMessage('info', tag, message, meta));
  }

  public warn(tag: string, message: string, meta?: any): void {
    console.warn(this.formatMessage('warn', tag, message, meta));
  }

  public error(tag: string, message: string, meta?: any): void {
    console.error(this.formatMessage('error', tag, message, meta));
  }

  public debug(tag: string, message: string, meta?: any): void {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
      console.debug(this.formatMessage('debug', tag, message, meta));
    }
  }
}

export const logger = new Logger();
