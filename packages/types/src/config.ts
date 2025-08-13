import type { Component, PageType } from './components';
import type { RetryConfig, ErrorRecoveryConfig } from './errors';

/**
 * SDK environment
 */
export enum Environment {
  SANDBOX = 'sandbox',
  PRODUCTION = 'production',
  LOCAL = 'local'
}

/**
 * SDK configuration
 */
export interface SdkConfig {
  /** Environment to use */
  environment?: Environment;
  
  /** Client ID (for direct initialization) */
  clientId?: string;
  
  /** Client token (for server-side initialization) */
  clientToken?: string;
  
  /** Components to load */
  components?: Component[];
  
  /** Page type */
  pageType?: PageType;
  
  /** Locale */
  locale?: string;
  
  /** Currency */
  currency?: string;
  
  /** Buyer country */
  buyerCountry?: string;
  
  /** Partner attribution ID */
  partnerAttributionId?: string;
  
  /** Client metadata ID */
  clientMetadataId?: string;
  
  /** Merchant ID */
  merchantId?: string;
  
  /** Data attributes for the script tag */
  dataAttributes?: Record<string, string>;
  
  /** Custom SDK URL */
  sdkUrl?: string;
  
  /** SDK version to load */
  version?: string;
  
  /** Debug mode */
  debug?: boolean;
  
  /** Disable funding sources */
  disableFunding?: string[];
  
  /** Enable funding sources */
  enableFunding?: string[];
  
  /** Commit (true = "Pay Now", false = "Continue") */
  commit?: boolean;
  
  /** Vault configuration */
  vault?: boolean | {
    /** Show vaulted payment methods */
    showSavedPaymentMethods?: boolean;
    
    /** Allow vault without purchase */
    allowVaultWithoutPurchase?: boolean;
  };
  
  /** Intent */
  intent?: 'capture' | 'authorize' | 'tokenize' | 'subscription';
  
  /** Enable 3D Secure */
  enable3DS?: boolean;
  
  /** CSP nonce */
  cspNonce?: string;
  
  /** Integration date (YYYY-MM-DD) */
  integrationDate?: string;
  
  /** User ID token */
  userIdToken?: string;
  
  /** SDK integration source */
  sdkIntegrationSource?: string;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  /** Enable logging */
  enabled?: boolean;
  
  /** Log level */
  level?: 'debug' | 'info' | 'warn' | 'error';
  
  /** Custom logger implementation */
  logger?: {
    debug: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
  };
  
  /** Include timestamp in logs */
  includeTimestamp?: boolean;
  
  /** Include stack traces */
  includeStackTrace?: boolean;
}

/**
 * Performance monitoring configuration
 */
export interface PerformanceConfig {
  /** Enable performance monitoring */
  enabled?: boolean;
  
  /** Sample rate (0-1) */
  sampleRate?: number;
  
  /** Custom performance observer */
  observer?: (metric: PerformanceMetric) => void;
}

/**
 * Performance metric
 */
export interface PerformanceMetric {
  /** Metric name */
  name: string;
  
  /** Metric value */
  value: number;
  
  /** Unit of measurement */
  unit?: string;
  
  /** Additional tags */
  tags?: Record<string, string>;
  
  /** Timestamp */
  timestamp: number;
}

/**
 * Complete SDK initialization options
 */
export interface SdkInitOptions extends SdkConfig {
  /** Logger configuration */
  logger?: LoggerConfig;
  
  /** Performance monitoring */
  performance?: PerformanceConfig;
  
  /** Retry configuration */
  retry?: RetryConfig;
  
  /** Error recovery configuration */
  errorRecovery?: ErrorRecoveryConfig;
  
  /** Auto-load SDK on initialization */
  autoLoad?: boolean;
  
  /** Timeout for SDK loading (ms) */
  loadTimeout?: number;
  
  /** Callbacks */
  callbacks?: {
    /** Called when SDK is loaded */
    onLoad?: () => void;
    
    /** Called when SDK is ready */
    onReady?: () => void;
    
    /** Called on SDK error */
    onError?: (error: Error) => void;
  };
}

/**
 * SDK metadata
 */
export interface SdkMetadata {
  /** SDK version */
  version: string;
  
  /** Build timestamp */
  buildTime?: string;
  
  /** Git commit hash */
  commit?: string;
  
  /** Environment */
  environment: Environment;
  
  /** Loaded components */
  components: Component[];
  
  /** Supported features */
  features?: string[];
}

/**
 * SDK state
 */
export enum SdkState {
  /** Not initialized */
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  
  /** Loading */
  LOADING = 'LOADING',
  
  /** Loaded but not ready */
  LOADED = 'LOADED',
  
  /** Ready to use */
  READY = 'READY',
  
  /** Error state */
  ERROR = 'ERROR',
  
  /** Destroyed */
  DESTROYED = 'DESTROYED'
}