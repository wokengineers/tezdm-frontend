/**
 * Production-ready logging utility for TezDM Frontend
 * Handles different log levels and environment-based logging
 */

import { PRODUCTION_CONFIG } from '../config/api';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

class Logger {
  private logLevel: LogLevel;

  constructor() {
    // Set log level based on environment
    if (PRODUCTION_CONFIG.ENABLE_DEBUG_LOGS) {
      this.logLevel = LogLevel.DEBUG;
    } else if (process.env.NODE_ENV === 'production') {
      this.logLevel = LogLevel.ERROR; // Only errors in production
    } else {
      this.logLevel = LogLevel.INFO; // Info and above in development
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data)}`;
    }
    return `${prefix} ${message}`;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage('DEBUG', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, data));
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message, error));
    }
  }

  // Security-specific logging
  security(event: string, data?: any): void {
    if (PRODUCTION_CONFIG.ENABLE_SECURITY_LOGGING) {
      console.log(this.formatMessage('SECURITY', event, data));
    }
  }

  // API-specific logging
  api(endpoint: string, method: string, data?: any): void {
    if (PRODUCTION_CONFIG.ENABLE_DEBUG_LOGS) {
      console.log(this.formatMessage('API', `${method} ${endpoint}`, data));
    }
  }
}

// Export singleton instance
export const logger = new Logger(); 