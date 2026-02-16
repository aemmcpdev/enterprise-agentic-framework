import { logger } from '@eaf/core';

export interface Notification {
  id: string;
  type: 'approval_needed' | 'task_complete' | 'error' | 'escalation' | 'info';
  title: string;
  message: string;
  agentId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  timestamp: Date;
}

export class NotificationManager {
  private notifications: Notification[] = [];
  private handlers: ((notification: Notification) => void)[] = [];

  notify(type: Notification['type'], title: string, message: string, priority: Notification['priority'] = 'medium', agentId?: string): Notification {
    const notification: Notification = {
      id: `notif_${Date.now()}`,
      type,
      title,
      message,
      agentId,
      priority,
      read: false,
      timestamp: new Date(),
    };

    this.notifications.push(notification);

    for (const handler of this.handlers) {
      handler(notification);
    }

    logger.info('Notification sent', { type, title, priority });
    return notification;
  }

  markRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) notif.read = true;
  }

  getUnread(): Notification[] {
    return this.notifications.filter((n) => !n.read);
  }

  onNotification(handler: (notification: Notification) => void): void {
    this.handlers.push(handler);
  }
}
