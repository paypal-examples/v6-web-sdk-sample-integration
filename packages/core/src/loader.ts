import {
  Environment,
  SdkConfig,
  SdkState,
  ErrorCode,
  PayPalSdkError,
  Component
} from '@paypal-v6/types';

/**
 * SDK URL builder
 */
export class SdkUrlBuilder {
  private baseUrl: string;
  private params: URLSearchParams;

  constructor(config: SdkConfig) {
    const env = config.environment || Environment.SANDBOX;
    const version = config.version || 'v6';
    
    // Build base URL
    if (config.sdkUrl) {
      this.baseUrl = config.sdkUrl;
    } else {
      const domain = env === Environment.PRODUCTION 
        ? 'https://www.paypal.com'
        : 'https://www.sandbox.paypal.com';
      this.baseUrl = `${domain}/web-sdk/${version}/core`;
    }

    // Build query parameters
    this.params = new URLSearchParams();
    
    if (config.clientId) {
      this.params.set('client-id', config.clientId);
    }
    
    if (config.components?.length) {
      this.params.set('components', config.components.join(','));
    }
    
    if (config.currency) {
      this.params.set('currency', config.currency);
    }
    
    if (config.locale) {
      this.params.set('locale', config.locale);
    }
    
    if (config.buyerCountry) {
      this.params.set('buyer-country', config.buyerCountry);
    }
    
    if (config.debug) {
      this.params.set('debug', 'true');
    }
    
    if (config.disableFunding?.length) {
      this.params.set('disable-funding', config.disableFunding.join(','));
    }
    
    if (config.enableFunding?.length) {
      this.params.set('enable-funding', config.enableFunding.join(','));
    }
    
    if (config.intent) {
      this.params.set('intent', config.intent);
    }
    
    if (config.commit !== undefined) {
      this.params.set('commit', String(config.commit));
    }
    
    if (config.vault !== undefined) {
      this.params.set('vault', typeof config.vault === 'boolean' ? String(config.vault) : 'true');
    }
    
    if (config.merchantId) {
      this.params.set('merchant-id', config.merchantId);
    }
    
    if (config.partnerAttributionId) {
      this.params.set('partner-attribution-id', config.partnerAttributionId);
    }
    
    if (config.clientMetadataId) {
      this.params.set('client-metadata-id', config.clientMetadataId);
    }
    
    if (config.integrationDate) {
      this.params.set('integration-date', config.integrationDate);
    }
    
    if (config.enable3DS) {
      this.params.set('enable-3ds', 'true');
    }
  }

  /**
   * Build the complete SDK URL
   */
  build(): string {
    const queryString = this.params.toString();
    return queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
  }
}

/**
 * SDK script loader
 */
export class SdkLoader {
  private static instance: SdkLoader | null = null;
  private state: SdkState = SdkState.NOT_INITIALIZED;
  private loadPromise: Promise<void> | null = null;
  private script: HTMLScriptElement | null = null;
  private config: SdkConfig | null = null;
  private loadCallbacks: Array<() => void> = [];
  private errorCallbacks: Array<(error: Error) => void> = [];

  /**
   * Get singleton instance
   */
  static getInstance(): SdkLoader {
    if (!SdkLoader.instance) {
      SdkLoader.instance = new SdkLoader();
    }
    return SdkLoader.instance;
  }

  /**
   * Private constructor for singleton
   */
  private constructor() {}

  /**
   * Get current state
   */
  getState(): SdkState {
    return this.state;
  }

  /**
   * Check if SDK is loaded
   */
  isLoaded(): boolean {
    return this.state === SdkState.READY && typeof window !== 'undefined' && window.paypal?.createInstance !== undefined;
  }

  /**
   * Load the PayPal SDK script
   */
  async load(config: SdkConfig): Promise<void> {
    // Return existing promise if already loading
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Check if already loaded
    if (this.isLoaded()) {
      return Promise.resolve();
    }

    // Check for existing PayPal script
    if (typeof window !== 'undefined' && window.paypal?.createInstance) {
      this.state = SdkState.READY;
      return Promise.resolve();
    }

    this.config = config;
    this.state = SdkState.LOADING;

    this.loadPromise = new Promise<void>((resolve, reject) => {
      try {
        // Check if script already exists
        const existingScript = document.querySelector('script[src*="paypal.com/web-sdk"]');
        if (existingScript) {
          // Wait for existing script to load
          this.waitForPayPal(resolve, reject, config.loadTimeout);
          return;
        }

        // Build SDK URL
        const urlBuilder = new SdkUrlBuilder(config);
        const url = urlBuilder.build();

        // Create script element
        this.script = document.createElement('script');
        this.script.src = url;
        this.script.async = true;
        
        // Add CSP nonce if provided
        if (config.cspNonce) {
          this.script.setAttribute('nonce', config.cspNonce);
        }

        // Add data attributes
        if (config.dataAttributes) {
          Object.entries(config.dataAttributes).forEach(([key, value]) => {
            this.script!.setAttribute(`data-${key}`, value);
          });
        }

        // Handle load event
        this.script.onload = () => {
          this.waitForPayPal(resolve, reject, config.loadTimeout);
        };

        // Handle error event
        this.script.onerror = (error) => {
          this.state = SdkState.ERROR;
          const sdkError = new PayPalSdkError(
            ErrorCode.SDK_LOAD_FAILED,
            'Failed to load PayPal SDK script',
            { originalError: error as Error }
          );
          this.errorCallbacks.forEach(cb => cb(sdkError));
          reject(sdkError);
        };

        // Append script to document
        document.head.appendChild(this.script);

      } catch (error) {
        this.state = SdkState.ERROR;
        const sdkError = new PayPalSdkError(
          ErrorCode.SDK_LOAD_FAILED,
          'Error while loading PayPal SDK',
          { originalError: error as Error }
        );
        reject(sdkError);
      }
    });

    return this.loadPromise;
  }

  /**
   * Wait for PayPal global to be available
   */
  private waitForPayPal(
    resolve: () => void,
    reject: (error: Error) => void,
    timeout: number = 30000
  ): void {
    const startTime = Date.now();
    
    const checkInterval = setInterval(() => {
      if (typeof window !== 'undefined' && window.paypal?.createInstance) {
        clearInterval(checkInterval);
        this.state = SdkState.READY;
        this.loadCallbacks.forEach(cb => cb());
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        this.state = SdkState.ERROR;
        const error = new PayPalSdkError(
          ErrorCode.TIMEOUT_ERROR,
          `PayPal SDK failed to load within ${timeout}ms`
        );
        this.errorCallbacks.forEach(cb => cb(error));
        reject(error);
      }
    }, 100);
  }

  /**
   * Unload the SDK
   */
  unload(): void {
    if (this.script && this.script.parentNode) {
      this.script.parentNode.removeChild(this.script);
    }
    
    this.script = null;
    this.loadPromise = null;
    this.state = SdkState.DESTROYED;
    this.config = null;
    
    // Remove PayPal from window
    if (typeof window !== 'undefined' && window.paypal) {
      delete (window as any).paypal;
    }
  }

  /**
   * Add load callback
   */
  onLoad(callback: () => void): void {
    if (this.isLoaded()) {
      callback();
    } else {
      this.loadCallbacks.push(callback);
    }
  }

  /**
   * Add error callback
   */
  onError(callback: (error: Error) => void): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Get loaded configuration
   */
  getConfig(): SdkConfig | null {
    return this.config;
  }
}