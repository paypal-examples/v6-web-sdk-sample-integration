import {
  PaymentSession,
  PaymentSessionOptions,
  StartSessionOptions,
  OrderPromise,
  SdkInstance,
  GooglePaySession,
  ApplePaySession,
  PaymentMethod,
  ErrorCode,
  PayPalSdkError,
  SdkEventType
} from '@paypal-v6/types';
import { EventEmitter } from './events';

/**
 * Base payment session wrapper
 */
export class BasePaymentSession implements PaymentSession {
  protected session: PaymentSession | null = null;
  protected active: boolean = false;
  protected events: EventEmitter;
  protected paymentMethod: PaymentMethod;

  constructor(
    session: PaymentSession,
    paymentMethod: PaymentMethod,
    events: EventEmitter
  ) {
    this.session = session;
    this.paymentMethod = paymentMethod;
    this.events = events;
  }

  /**
   * Start the payment session
   */
  async start(
    options: StartSessionOptions,
    orderPromise: Promise<OrderPromise>
  ): Promise<void> {
    if (this.active) {
      throw new PayPalSdkError(
        ErrorCode.SESSION_ALREADY_ACTIVE,
        'Payment session is already active'
      );
    }

    if (!this.session) {
      throw new PayPalSdkError(
        ErrorCode.SESSION_NOT_FOUND,
        'Payment session not initialized'
      );
    }

    try {
      this.active = true;
      this.events.emit(SdkEventType.SESSION_STARTED, {
        paymentMethod: this.paymentMethod,
        options
      });

      await this.session.start(options, orderPromise);
      
    } catch (error) {
      this.active = false;
      this.events.emit(SdkEventType.SESSION_ENDED, {
        paymentMethod: this.paymentMethod,
        error
      });
      
      if (error instanceof PayPalSdkError) {
        throw error;
      }
      
      throw new PayPalSdkError(
        ErrorCode.PAYMENT_FAILED,
        'Failed to start payment session',
        { originalError: error as Error }
      );
    }
  }

  /**
   * Cancel the current session
   */
  cancel(): void {
    if (!this.active) {
      return;
    }

    if (this.session) {
      this.session.cancel();
    }
    
    this.active = false;
    this.events.emit(SdkEventType.SESSION_ENDED, {
      paymentMethod: this.paymentMethod,
      cancelled: true
    });
  }

  /**
   * Destroy the session and clean up
   */
  destroy(): void {
    if (this.session) {
      this.session.destroy();
      this.session = null;
    }
    
    this.active = false;
    this.events.emit(SdkEventType.SESSION_ENDED, {
      paymentMethod: this.paymentMethod,
      destroyed: true
    });
  }

  /**
   * Check if session is active
   */
  isActive(): boolean {
    return this.active;
  }
}

/**
 * Google Pay session wrapper
 */
export class GooglePaySessionWrapper extends BasePaymentSession implements GooglePaySession {
  private googlePaySession: GooglePaySession;

  constructor(
    session: GooglePaySession,
    events: EventEmitter
  ) {
    super(session, PaymentMethod.GOOGLE_PAY, events);
    this.googlePaySession = session;
  }

  /**
   * Get Google Pay configuration
   */
  async getGooglePayConfig(): Promise<any> {
    if (!this.googlePaySession) {
      throw new PayPalSdkError(
        ErrorCode.SESSION_NOT_FOUND,
        'Google Pay session not initialized'
      );
    }

    try {
      return await this.googlePaySession.getGooglePayConfig();
    } catch (error) {
      throw new PayPalSdkError(
        ErrorCode.INVALID_CONFIGURATION,
        'Failed to get Google Pay configuration',
        { originalError: error as Error }
      );
    }
  }

  /**
   * Confirm an order with Google Pay
   */
  async confirmOrder(options: {
    orderId: string;
    paymentMethodData: any;
  }): Promise<{ status: string }> {
    if (!this.googlePaySession) {
      throw new PayPalSdkError(
        ErrorCode.SESSION_NOT_FOUND,
        'Google Pay session not initialized'
      );
    }

    try {
      return await this.googlePaySession.confirmOrder(options);
    } catch (error) {
      throw new PayPalSdkError(
        ErrorCode.PAYMENT_FAILED,
        'Failed to confirm Google Pay order',
        { 
          originalError: error as Error,
          orderId: options.orderId
        }
      );
    }
  }
}

/**
 * Apple Pay session wrapper
 */
export class ApplePaySessionWrapper extends BasePaymentSession implements ApplePaySession {
  private applePaySession: ApplePaySession;

  constructor(
    session: ApplePaySession,
    events: EventEmitter
  ) {
    super(session, PaymentMethod.APPLE_PAY, events);
    this.applePaySession = session;
  }

  /**
   * Get Apple Pay configuration
   */
  async getApplePayConfig(): Promise<any> {
    if (!this.applePaySession) {
      throw new PayPalSdkError(
        ErrorCode.SESSION_NOT_FOUND,
        'Apple Pay session not initialized'
      );
    }

    try {
      return await this.applePaySession.getApplePayConfig();
    } catch (error) {
      throw new PayPalSdkError(
        ErrorCode.INVALID_CONFIGURATION,
        'Failed to get Apple Pay configuration',
        { originalError: error as Error }
      );
    }
  }

  /**
   * Validate merchant session
   */
  async validateMerchant(validationURL: string): Promise<any> {
    if (!this.applePaySession) {
      throw new PayPalSdkError(
        ErrorCode.SESSION_NOT_FOUND,
        'Apple Pay session not initialized'
      );
    }

    try {
      return await this.applePaySession.validateMerchant(validationURL);
    } catch (error) {
      throw new PayPalSdkError(
        ErrorCode.PAYMENT_FAILED,
        'Failed to validate Apple Pay merchant',
        { originalError: error as Error }
      );
    }
  }
}

/**
 * Payment session manager
 */
export class PaymentSessionManager {
  private sdkInstance: SdkInstance | null = null;
  private sessions: Map<string, BasePaymentSession> = new Map();
  private events: EventEmitter;

  constructor(events: EventEmitter) {
    this.events = events;
  }

  /**
   * Set SDK instance
   */
  setSdkInstance(instance: SdkInstance): void {
    this.sdkInstance = instance;
  }

  /**
   * Create PayPal payment session
   */
  createPayPalSession(options: PaymentSessionOptions): BasePaymentSession {
    if (!this.sdkInstance) {
      throw new PayPalSdkError(
        ErrorCode.SDK_NOT_INITIALIZED,
        'SDK instance not initialized'
      );
    }

    const sessionOptions = this.wrapSessionOptions(options, PaymentMethod.PAYPAL);
    const session = this.sdkInstance.createPayPalOneTimePaymentSession(sessionOptions);
    const wrappedSession = new BasePaymentSession(session, PaymentMethod.PAYPAL, this.events);
    
    this.sessions.set(`paypal_${Date.now()}`, wrappedSession);
    return wrappedSession;
  }

  /**
   * Create Venmo payment session
   */
  createVenmoSession(options: PaymentSessionOptions): BasePaymentSession {
    if (!this.sdkInstance) {
      throw new PayPalSdkError(
        ErrorCode.SDK_NOT_INITIALIZED,
        'SDK instance not initialized'
      );
    }

    const sessionOptions = this.wrapSessionOptions(options, PaymentMethod.VENMO);
    const session = this.sdkInstance.createVenmoOneTimePaymentSession(sessionOptions);
    const wrappedSession = new BasePaymentSession(session, PaymentMethod.VENMO, this.events);
    
    this.sessions.set(`venmo_${Date.now()}`, wrappedSession);
    return wrappedSession;
  }

  /**
   * Create Pay Later payment session
   */
  createPayLaterSession(options: PaymentSessionOptions): BasePaymentSession {
    if (!this.sdkInstance) {
      throw new PayPalSdkError(
        ErrorCode.SDK_NOT_INITIALIZED,
        'SDK instance not initialized'
      );
    }

    const sessionOptions = this.wrapSessionOptions(options, PaymentMethod.PAYLATER);
    const session = this.sdkInstance.createPayLaterOneTimePaymentSession(sessionOptions);
    const wrappedSession = new BasePaymentSession(session, PaymentMethod.PAYLATER, this.events);
    
    this.sessions.set(`paylater_${Date.now()}`, wrappedSession);
    return wrappedSession;
  }

  /**
   * Create PayPal Credit payment session
   */
  createCreditSession(options: PaymentSessionOptions): BasePaymentSession {
    if (!this.sdkInstance) {
      throw new PayPalSdkError(
        ErrorCode.SDK_NOT_INITIALIZED,
        'SDK instance not initialized'
      );
    }

    const sessionOptions = this.wrapSessionOptions(options, PaymentMethod.CREDIT);
    const session = this.sdkInstance.createPayPalCreditOneTimePaymentSession(sessionOptions);
    const wrappedSession = new BasePaymentSession(session, PaymentMethod.CREDIT, this.events);
    
    this.sessions.set(`credit_${Date.now()}`, wrappedSession);
    return wrappedSession;
  }

  /**
   * Create Google Pay payment session
   */
  createGooglePaySession(): GooglePaySessionWrapper {
    if (!this.sdkInstance) {
      throw new PayPalSdkError(
        ErrorCode.SDK_NOT_INITIALIZED,
        'SDK instance not initialized'
      );
    }

    const session = this.sdkInstance.createGooglePayOneTimePaymentSession();
    const wrappedSession = new GooglePaySessionWrapper(session, this.events);
    
    this.sessions.set(`googlepay_${Date.now()}`, wrappedSession);
    return wrappedSession;
  }

  /**
   * Create Apple Pay payment session
   */
  createApplePaySession(options: PaymentSessionOptions): ApplePaySessionWrapper {
    if (!this.sdkInstance) {
      throw new PayPalSdkError(
        ErrorCode.SDK_NOT_INITIALIZED,
        'SDK instance not initialized'
      );
    }

    const sessionOptions = this.wrapSessionOptions(options, PaymentMethod.APPLE_PAY);
    const session = this.sdkInstance.createApplePayOneTimePaymentSession(sessionOptions);
    const wrappedSession = new ApplePaySessionWrapper(session, this.events);
    
    this.sessions.set(`applepay_${Date.now()}`, wrappedSession);
    return wrappedSession;
  }

  /**
   * Wrap session options with event emitters
   */
  private wrapSessionOptions(
    options: PaymentSessionOptions,
    paymentMethod: PaymentMethod
  ): PaymentSessionOptions {
    return {
      ...options,
      onApprove: async (data) => {
        this.events.emit(SdkEventType.PAYMENT_APPROVED, {
          paymentMethod,
          data
        });
        
        if (options.onApprove) {
          await options.onApprove(data);
        }
      },
      onCancel: (data) => {
        this.events.emit(SdkEventType.PAYMENT_CANCELLED, {
          paymentMethod,
          data
        });
        
        if (options.onCancel) {
          options.onCancel(data);
        }
      },
      onError: (error) => {
        this.events.emit(SdkEventType.PAYMENT_ERROR, {
          paymentMethod,
          error
        });
        
        if (options.onError) {
          options.onError(error);
        }
      }
    };
  }

  /**
   * Destroy all sessions
   */
  destroyAll(): void {
    this.sessions.forEach(session => {
      try {
        session.destroy();
      } catch (error) {
        console.error('Error destroying session:', error);
      }
    });
    this.sessions.clear();
  }

  /**
   * Get active sessions count
   */
  getActiveSessionsCount(): number {
    let count = 0;
    this.sessions.forEach(session => {
      if (session.isActive()) {
        count++;
      }
    });
    return count;
  }
}