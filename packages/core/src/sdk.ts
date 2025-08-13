import {
  SdkInitOptions,
  SdkInstance,
  SdkState,
  SdkEventType,
  SdkMetadata,
  CreateInstanceOptions,
  EligiblePaymentMethods,
  FindEligibleMethodsOptions,
  PaymentSessionOptions,
  ErrorCode,
  PayPalSdkError,
  Environment,
  Component
} from '@paypal-v6/types';
import { SdkLoader } from './loader';
import { EventEmitter } from './events';
import { PaymentSessionManager, BasePaymentSession, GooglePaySessionWrapper, ApplePaySessionWrapper } from './sessions';
import { Logger, retry, isBrowserSupported, parsePayPalError } from './utils';

/**
 * Main PayPal SDK wrapper class
 */
export class PayPalSDK {
  private static instance: PayPalSDK | null = null;
  
  private loader: SdkLoader;
  private events: EventEmitter;
  private sessionManager: PaymentSessionManager;
  private logger: Logger;
  private sdkInstance: SdkInstance | null = null;
  private eligibleMethods: EligiblePaymentMethods | null = null;
  private config: SdkInitOptions;
  private state: SdkState = SdkState.NOT_INITIALIZED;
  private initPromise: Promise<void> | null = null;

  /**
   * Get singleton instance
   */
  static getInstance(config?: SdkInitOptions): PayPalSDK {
    if (!PayPalSDK.instance) {
      if (!config) {
        throw new PayPalSdkError(
          ErrorCode.INVALID_CONFIGURATION,
          'Configuration required for first initialization'
        );
      }
      PayPalSDK.instance = new PayPalSDK(config);
    } else if (config) {
      // Update configuration if provided
      PayPalSDK.instance.updateConfig(config);
    }
    
    return PayPalSDK.instance;
  }

  /**
   * Private constructor for singleton
   */
  private constructor(config: SdkInitOptions) {
    // Check browser support
    if (!isBrowserSupported()) {
      throw new PayPalSdkError(
        ErrorCode.BROWSER_NOT_SUPPORTED,
        'Browser is not supported by PayPal SDK'
      );
    }

    this.config = this.validateConfig(config);
    this.loader = SdkLoader.getInstance();
    this.events = new EventEmitter();
    this.sessionManager = new PaymentSessionManager(this.events);
    this.logger = new Logger(config.logger);
    
    // Set up loader callbacks
    this.setupLoaderCallbacks();
    
    // Auto-load if configured
    if (config.autoLoad !== false) {
      this.initialize().catch(error => {
        this.logger.error('Failed to auto-initialize SDK', error);
      });
    }
  }

  /**
   * Validate configuration
   */
  private validateConfig(config: SdkInitOptions): SdkInitOptions {
    if (!config.clientToken && !config.clientId) {
      throw new PayPalSdkError(
        ErrorCode.INVALID_CONFIGURATION,
        'Either clientToken or clientId is required'
      );
    }

    // Set defaults
    return {
      ...config,
      environment: config.environment || Environment.SANDBOX,
      components: config.components || ['paypal-payments'],
      pageType: config.pageType || 'checkout',
      autoLoad: config.autoLoad !== false,
      loadTimeout: config.loadTimeout || 30000
    };
  }

  /**
   * Update configuration
   */
  private updateConfig(config: Partial<SdkInitOptions>): void {
    this.config = { ...this.config, ...config };
    this.logger = new Logger(this.config.logger);
  }

  /**
   * Set up loader callbacks
   */
  private setupLoaderCallbacks(): void {
    this.loader.onLoad(() => {
      this.logger.info('PayPal SDK script loaded');
      this.events.emit(SdkEventType.LOADED);
      
      if (this.config.callbacks?.onLoad) {
        this.config.callbacks.onLoad();
      }
    });

    this.loader.onError((error) => {
      this.logger.error('PayPal SDK script failed to load', error);
      this.state = SdkState.ERROR;
      this.events.emit(SdkEventType.ERROR, error);
      
      if (this.config.callbacks?.onError) {
        this.config.callbacks.onError(error);
      }
    });
  }

  /**
   * Initialize the SDK
   */
  async initialize(): Promise<void> {
    // Return existing promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }

    // Check if already initialized
    if (this.state === SdkState.READY) {
      return Promise.resolve();
    }

    this.initPromise = this.performInitialization();
    return this.initPromise;
  }

  /**
   * Perform SDK initialization
   */
  private async performInitialization(): Promise<void> {
    try {
      this.state = SdkState.LOADING;
      this.logger.info('Initializing PayPal SDK');

      // Load SDK script
      await retry(
        () => this.loader.load(this.config),
        this.config.retry
      );

      // Create SDK instance
      if (this.config.clientToken) {
        await this.createInstanceWithToken(this.config.clientToken);
      } else {
        // For client-id based initialization, instance is created differently
        // This would typically be handled by the loaded SDK itself
        this.logger.warn('Client ID based initialization may require additional setup');
      }

      this.state = SdkState.READY;
      this.logger.info('PayPal SDK initialized successfully');
      this.events.emit(SdkEventType.READY);
      
      if (this.config.callbacks?.onReady) {
        this.config.callbacks.onReady();
      }

    } catch (error) {
      this.state = SdkState.ERROR;
      const sdkError = parsePayPalError(error);
      this.logger.error('Failed to initialize PayPal SDK', sdkError);
      this.events.emit(SdkEventType.ERROR, sdkError);
      
      if (this.config.callbacks?.onError) {
        this.config.callbacks.onError(sdkError);
      }
      
      throw sdkError;
    } finally {
      this.initPromise = null;
    }
  }

  /**
   * Create SDK instance with client token
   */
  async createInstanceWithToken(clientToken: string): Promise<void> {
    if (!window.paypal?.createInstance) {
      throw new PayPalSdkError(
        ErrorCode.SDK_NOT_INITIALIZED,
        'PayPal global not available'
      );
    }

    const options: CreateInstanceOptions = {
      clientToken,
      components: this.config.components as Component[],
      pageType: this.config.pageType,
      locale: this.config.locale,
      partnerAttributionId: this.config.partnerAttributionId,
      clientMetadataId: this.config.clientMetadataId
    };

    try {
      this.sdkInstance = await window.paypal.createInstance(options);
      this.sessionManager.setSdkInstance(this.sdkInstance);
      this.logger.debug('SDK instance created successfully');
    } catch (error) {
      throw parsePayPalError(error);
    }
  }

  /**
   * Find eligible payment methods
   */
  async findEligibleMethods(
    options?: FindEligibleMethodsOptions
  ): Promise<EligiblePaymentMethods> {
    await this.ensureInitialized();

    if (!this.sdkInstance) {
      throw new PayPalSdkError(
        ErrorCode.SDK_NOT_INITIALIZED,
        'SDK instance not available'
      );
    }

    try {
      const findOptions: FindEligibleMethodsOptions = {
        currencyCode: options?.currencyCode || this.config.currency || 'USD',
        countryCode: options?.countryCode || this.config.buyerCountry,
        amount: options?.amount
      };

      this.eligibleMethods = await this.sdkInstance.findEligibleMethods(findOptions);
      this.logger.debug('Eligible payment methods found', {
        methods: this.eligibleMethods.getAllEligible()
      });
      
      return this.eligibleMethods;
    } catch (error) {
      throw parsePayPalError(error);
    }
  }

  /**
   * Check if a payment method is eligible
   */
  async isPaymentMethodEligible(method: string): Promise<boolean> {
    if (!this.eligibleMethods) {
      await this.findEligibleMethods();
    }
    
    return this.eligibleMethods?.isEligible(method) || false;
  }

  /**
   * Create PayPal payment session
   */
  createPayPalSession(options: PaymentSessionOptions): BasePaymentSession {
    this.ensureInitializedSync();
    return this.sessionManager.createPayPalSession(options);
  }

  /**
   * Create Venmo payment session
   */
  createVenmoSession(options: PaymentSessionOptions): BasePaymentSession {
    this.ensureInitializedSync();
    return this.sessionManager.createVenmoSession(options);
  }

  /**
   * Create Pay Later payment session
   */
  createPayLaterSession(options: PaymentSessionOptions): BasePaymentSession {
    this.ensureInitializedSync();
    return this.sessionManager.createPayLaterSession(options);
  }

  /**
   * Create PayPal Credit payment session
   */
  createCreditSession(options: PaymentSessionOptions): BasePaymentSession {
    this.ensureInitializedSync();
    return this.sessionManager.createCreditSession(options);
  }

  /**
   * Create Google Pay payment session
   */
  createGooglePaySession(): GooglePaySessionWrapper {
    this.ensureInitializedSync();
    return this.sessionManager.createGooglePaySession();
  }

  /**
   * Create Apple Pay payment session
   */
  createApplePaySession(options: PaymentSessionOptions): ApplePaySessionWrapper {
    this.ensureInitializedSync();
    return this.sessionManager.createApplePaySession(options);
  }

  /**
   * Ensure SDK is initialized (async)
   */
  private async ensureInitialized(): Promise<void> {
    if (this.state !== SdkState.READY) {
      await this.initialize();
    }
  }

  /**
   * Ensure SDK is initialized (sync check)
   */
  private ensureInitializedSync(): void {
    if (this.state !== SdkState.READY) {
      throw new PayPalSdkError(
        ErrorCode.SDK_NOT_INITIALIZED,
        'SDK must be initialized before creating sessions. Call initialize() first.'
      );
    }
  }

  /**
   * Get SDK metadata
   */
  getMetadata(): SdkMetadata {
    return {
      version: window.paypal?.version || 'unknown',
      environment: this.config.environment!,
      components: this.config.components as Component[],
      features: this.eligibleMethods?.getAllEligible()
    };
  }

  /**
   * Get SDK state
   */
  getState(): SdkState {
    return this.state;
  }

  /**
   * Get event emitter
   */
  getEvents(): EventEmitter {
    return this.events;
  }

  /**
   * Destroy the SDK
   */
  destroy(): void {
    this.logger.info('Destroying PayPal SDK');
    
    // Destroy all sessions
    this.sessionManager.destroyAll();
    
    // Unload script
    this.loader.unload();
    
    // Clear references
    this.sdkInstance = null;
    this.eligibleMethods = null;
    this.state = SdkState.DESTROYED;
    
    // Clear singleton
    PayPalSDK.instance = null;
    
    this.events.emit(SdkEventType.DESTROYED);
    this.events.removeAllListeners();
  }

  /**
   * Reset the SDK (destroy and reinitialize)
   */
  async reset(): Promise<void> {
    const config = { ...this.config };
    this.destroy();
    PayPalSDK.instance = new PayPalSDK(config);
    await PayPalSDK.instance.initialize();
  }
}