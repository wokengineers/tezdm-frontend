/**
 * Security Manager for TezDM Frontend
 * Handles token management, data integrity, and secure storage
 */

// Types
interface StoredDataMeta {
  data: any;
  timestamp: number;
  version: string;
  checksum: string;
  encrypted?: boolean;
}

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  group_id: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar: string;
  connectedAccounts: Array<{
    id: string;
    platform: string;
    username: string;
    isPrimary: boolean;
    avatar: string;
    status: string;
  }>;
  plan: string;
  notifications: boolean;
  createdAt: string;
  lastLogin: string;
}

/**
 * Security Manager Class
 */
export class SecurityManager {
  private static readonly APP_VERSION = '1.0.0';
  private static readonly MAX_DATA_AGE = parseInt(process.env.REACT_APP_MAX_DATA_AGE || '86400000'); // 24 hours
  private static readonly TOKEN_REFRESH_THRESHOLD = parseInt(process.env.REACT_APP_TOKEN_REFRESH_THRESHOLD || '300000'); // 5 minutes before expiry
  private static readonly ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'tezdm_secure_key_2024'; // In production, use environment variable
  private static readonly ENABLE_SECURITY_LOGGING = process.env.REACT_APP_ENABLE_SECURITY_LOGGING === 'true';

  /**
   * Generate a hash for data integrity
   */
  private static generateHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Simple encryption (for demo - use proper encryption in production)
   */
  private static encrypt(data: string): string {
    return btoa(data + this.ENCRYPTION_KEY);
  }

  /**
   * Simple decryption (for demo - use proper decryption in production)
   */
  private static decrypt(encryptedData: string): string {
    try {
      const decoded = atob(encryptedData);
      return decoded.replace(this.ENCRYPTION_KEY, '');
    } catch {
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Check if token is expired or will expire soon
   */
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      const currentTime = Date.now();
      
      // Check if token is expired or will expire within threshold
      return currentTime >= (expiryTime - this.TOKEN_REFRESH_THRESHOLD);
    } catch {
      return true; // If we can't decode, assume expired
    }
  }

  /**
   * Get token expiry time
   */
  static getTokenExpiry(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000;
    } catch {
      return null;
    }
  }

  /**
   * Store data with integrity checks and optional encryption
   */
  static storeData(
    key: string, 
    data: any, 
    options: {
      encrypt?: boolean;
      validateSchema?: (data: any) => boolean;
      maxAge?: number;
    } = {}
  ): void {
    try {
      // Schema validation
      if (options.validateSchema && !options.validateSchema(data)) {
        throw new Error(`Invalid data structure for key: ${key}`);
      }

      const dataWithMeta: StoredDataMeta = {
        data,
        timestamp: Date.now(),
        version: this.APP_VERSION,
        checksum: this.generateHash(JSON.stringify(data)),
        encrypted: options.encrypt || false
      };

      let dataToStore = JSON.stringify(dataWithMeta);
      
      // Encrypt if requested
      if (options.encrypt) {
        dataToStore = this.encrypt(dataToStore);
      }

      localStorage.setItem(key, dataToStore);
      
      // Security logging
      if (this.ENABLE_SECURITY_LOGGING) {
        console.log(`🔒 [SECURITY] Data stored securely: ${key}`, {
          encrypted: options.encrypt || false,
          timestamp: new Date().toISOString(),
          checksum: dataWithMeta.checksum
        });
      }
    } catch (error) {
      console.error(`Failed to store data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Read data with integrity validation
   */
  static readData<T = any>(
    key: string, 
    options: {
      validateSchema?: (data: any) => boolean;
      maxAge?: number;
    } = {}
  ): T | null {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      let dataToParse = stored;
      let isEncrypted = false;

      // Try to decrypt if it's encrypted
      try {
        const decrypted = this.decrypt(stored);
        dataToParse = decrypted;
        isEncrypted = true;
      } catch {
        // Not encrypted, use as is
        isEncrypted = false;
      }

      const parsed: StoredDataMeta = JSON.parse(dataToParse);

      // Version check
      if (parsed.version !== this.APP_VERSION) {
        console.warn(`Data version mismatch for ${key}, clearing...`);
        localStorage.removeItem(key);
        return null;
      }

      // Age check
      const maxAge = options.maxAge || this.MAX_DATA_AGE;
      const age = Date.now() - parsed.timestamp;
      if (age > maxAge) {
        console.warn(`Data too old for ${key}, clearing...`);
        localStorage.removeItem(key);
        return null;
      }

      // Checksum validation
      const calculatedChecksum = this.generateHash(JSON.stringify(parsed.data));
      if (calculatedChecksum !== parsed.checksum) {
        console.error(`Data integrity check failed for ${key}, clearing...`);
        localStorage.removeItem(key);
        return null;
      }

      // Schema validation
      if (options.validateSchema && !options.validateSchema(parsed.data)) {
        console.error(`Schema validation failed for ${key}, clearing...`);
        localStorage.removeItem(key);
        return null;
      }

      return parsed.data as T;
    } catch (error) {
      console.error(`Error reading data for ${key}:`, error);
      localStorage.removeItem(key);
      return null;
    }
  }

  /**
   * Store tokens securely
   */
  static storeTokens(tokens: TokenData): void {
    this.storeData('tokens', tokens, {
      encrypt: true,
      validateSchema: (data) => 
        data && 
        typeof data.access_token === 'string' &&
        typeof data.refresh_token === 'string' &&
        typeof data.expires_at === 'number' &&
        typeof data.group_id === 'number'
    });
  }

  /**
   * Get stored tokens
   */
  static getTokens(): TokenData | null {
    return this.readData<TokenData>('tokens', {
      validateSchema: (data) => 
        data && 
        typeof data.access_token === 'string' &&
        typeof data.refresh_token === 'string' &&
        typeof data.expires_at === 'number' &&
        typeof data.group_id === 'number'
    });
  }

  /**
   * Store user data securely
   */
  static storeUser(user: UserData): void {
    this.storeData('user', user, {
      validateSchema: (data) => 
        data && 
        typeof data.id === 'string' &&
        typeof data.email === 'string' &&
        typeof data.name === 'string' &&
        data.email.includes('@')
    });
  }

  /**
   * Get stored user data
   */
  static getUser(): UserData | null {
    return this.readData<UserData>('user', {
      validateSchema: (data) => 
        data && 
        typeof data.id === 'string' &&
        typeof data.email === 'string' &&
        typeof data.name === 'string' &&
        data.email.includes('@')
    });
  }

  /**
   * Check if user is authenticated with valid tokens
   */
  static isAuthenticated(): boolean {
    const tokens = this.getTokens();
    const user = this.getUser();
    
    if (!tokens || !user) {
      return false;
    }

    // Check if access token is still valid
    if (this.isTokenExpired(tokens.access_token)) {
      return false;
    }

    return true;
  }

  /**
   * Get valid access token (refresh if needed)
   */
  static getValidAccessToken(): string | null {
    const tokens = this.getTokens();
    if (!tokens) return null;

    if (this.isTokenExpired(tokens.access_token)) {
      // Token is expired, needs refresh
      return null;
    }

    return tokens.access_token;
  }

  /**
   * Clear all secure data
   */
  static clearAllData(): void {
    const keys = [
      'tokens',
      'user',
      'access_token',
      'refresh_token', 
      'group_id'
    ];
    
    keys.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Validate all stored data integrity
   */
  static validateAllData(): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Check tokens
    const tokens = this.getTokens();
    if (!tokens) {
      errors.push('No valid tokens found');
    } else if (this.isTokenExpired(tokens.access_token)) {
      errors.push('Access token is expired');
    }

    // Check user data
    const user = this.getUser();
    if (!user) {
      errors.push('No valid user data found');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const securityManager = new SecurityManager(); 