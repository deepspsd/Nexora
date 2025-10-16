import { apiClient } from '@/lib/api/apiClient';

export interface EmailPreferences {
  projectUpdates: boolean;
  weeklyTips: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
  referralUpdates: boolean;
}

export interface NotificationSettings {
  email: EmailPreferences;
  push: {
    enabled: boolean;
  };
}

export const getEmailPreferences = async (): Promise<EmailPreferences> => {
  const response = await apiClient.get<{ preferences: EmailPreferences }>('/api/notifications/email/preferences');
  return response.preferences;
};

export const updateEmailPreferences = async (preferences: Partial<EmailPreferences>): Promise<void> => {
  await apiClient.put('/api/notifications/email/preferences', preferences);
};

export const subscribeToNewsletter = async (email: string): Promise<void> => {
  await apiClient.post('/api/notifications/newsletter/subscribe', { email }, { skipAuth: true });
};

export const unsubscribeFromNewsletter = async (token: string): Promise<void> => {
  await apiClient.post('/api/notifications/newsletter/unsubscribe', { token }, { skipAuth: true });
};

export const sendTestEmail = async (): Promise<void> => {
  await apiClient.post('/api/notifications/email/test');
};

export const getNotificationHistory = async (): Promise<Array<{
  id: string;
  type: string;
  subject: string;
  sentAt: string;
  read: boolean;
}>> => {
  return await apiClient.get('/api/notifications/history');
};
