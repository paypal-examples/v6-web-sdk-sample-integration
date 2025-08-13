import { SdkEventType, SdkEvent, EventListener } from '@paypal-v6/types';

/**
 * Event emitter for SDK events
 */
export class EventEmitter {
  private events: Map<SdkEventType, Set<EventListener>> = new Map();
  private onceEvents: Map<SdkEventType, Set<EventListener>> = new Map();

  /**
   * Add event listener
   */
  on(event: SdkEventType, listener: EventListener): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(listener);
  }

  /**
   * Remove event listener
   */
  off(event: SdkEventType, listener: EventListener): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.events.delete(event);
      }
    }

    const onceListeners = this.onceEvents.get(event);
    if (onceListeners) {
      onceListeners.delete(listener);
      if (onceListeners.size === 0) {
        this.onceEvents.delete(event);
      }
    }
  }

  /**
   * Add one-time event listener
   */
  once(event: SdkEventType, listener: EventListener): void {
    if (!this.onceEvents.has(event)) {
      this.onceEvents.set(event, new Set());
    }
    this.onceEvents.get(event)!.add(listener);
  }

  /**
   * Emit an event
   */
  emit(event: SdkEventType, payload?: any): void {
    const sdkEvent: SdkEvent = {
      type: event,
      payload,
      timestamp: Date.now()
    };

    // Call regular listeners
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(sdkEvent);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }

    // Call one-time listeners
    const onceListeners = this.onceEvents.get(event);
    if (onceListeners) {
      onceListeners.forEach(listener => {
        try {
          listener(sdkEvent);
        } catch (error) {
          console.error(`Error in once event listener for ${event}:`, error);
        }
      });
      // Clear once listeners after calling
      this.onceEvents.delete(event);
    }
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: SdkEventType): void {
    if (event) {
      this.events.delete(event);
      this.onceEvents.delete(event);
    } else {
      this.events.clear();
      this.onceEvents.clear();
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: SdkEventType): number {
    const regularCount = this.events.get(event)?.size || 0;
    const onceCount = this.onceEvents.get(event)?.size || 0;
    return regularCount + onceCount;
  }

  /**
   * Get all event names that have listeners
   */
  eventNames(): SdkEventType[] {
    const names = new Set<SdkEventType>();
    this.events.forEach((_, key) => names.add(key));
    this.onceEvents.forEach((_, key) => names.add(key));
    return Array.from(names);
  }
}