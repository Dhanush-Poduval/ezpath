import { DisruptionEvent } from '../../types';

export type DisruptionListener = (events: DisruptionEvent[]) => void;

export class LiveEventsService {
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<DisruptionListener> = new Set();
  private pollingTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('accesspath_network_events');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'DISRUPTION_UPDATE') {
          this.notifyListeners();
        }
      };
    }
  }

  subscribe(callback: DisruptionListener): () => void {
    this.listeners.add(callback);
    // Trigger initial notification
    this.notifyListeners();

    // Start background polling fallback
    if (!this.pollingTimer && typeof window !== 'undefined') {
      this.pollingTimer = setInterval(() => {
        this.notifyListeners();
      }, 5000);
    }

    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0 && this.pollingTimer) {
        clearInterval(this.pollingTimer);
        this.pollingTimer = null;
      }
    };
  }

  broadcastUpdate() {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'DISRUPTION_UPDATE', timestamp: Date.now() });
    }
    this.notifyListeners();
  }

  private notifyListeners() {
    try {
      const raw = localStorage.getItem('accesspath_demo_disruptions');
      const events: DisruptionEvent[] = raw ? JSON.parse(raw) : [];
      for (const listener of this.listeners) {
        listener(events.filter(e => e.isActive));
      }
    } catch {
      // Fallback
    }
  }
}

export const liveEventsService = new LiveEventsService();

