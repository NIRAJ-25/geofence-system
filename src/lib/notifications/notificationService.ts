export type NotificationPermissionStatus = 'default' | 'granted' | 'denied' | 'unsupported';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'ENTER' | 'EXIT' | 'DWELL' | 'INFO';
  timestamp: string;
}

export class NotificationService {
  private inAppSubscribers: Array<(notification: AppNotification) => void> = [];

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermission(): NotificationPermissionStatus {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermissionStatus> {
    if (!this.isSupported()) return 'unsupported';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return 'denied';
    }
  }

  public notify(title: string, body: string, type: AppNotification['type'] = 'INFO'): void {
    const notification: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      body,
      type,
      timestamp: new Date().toISOString()
    };

    // Emit to in-app toast subscribers
    this.inAppSubscribers.forEach((subscriber) => subscriber(notification));

    // Emit browser native notification if permitted
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico'
        });
      } catch (err) {
        console.warn('Native notification failed:', err);
      }
    }
  }

  public subscribeInApp(callback: (notification: AppNotification) => void): () => void {
    this.inAppSubscribers.push(callback);
    return () => {
      this.inAppSubscribers = this.inAppSubscribers.filter((cb) => cb !== callback);
    };
  }
}

export const notificationService = new NotificationService();
