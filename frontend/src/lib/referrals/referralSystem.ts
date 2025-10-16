import { apiClient } from '@/lib/api/apiClient';

export interface ReferralStats {
  code: string;
  totalReferrals: number;
  successfulReferrals: number;
  creditsEarned: number;
  pendingRewards: number;
}

export interface Referral {
  id: string;
  referredEmail: string;
  status: 'pending' | 'completed' | 'rewarded';
  createdAt: string;
  rewardAmount: number;
}

export const getReferralCode = async (): Promise<string> => {
  const response = await apiClient.get<{ code: string }>('/api/referrals/code');
  return response.code;
};

export const getReferralStats = async (): Promise<ReferralStats> => {
  return await apiClient.get<ReferralStats>('/api/referrals/stats');
};

export const getReferralHistory = async (): Promise<Referral[]> => {
  return await apiClient.get<Referral[]>('/api/referrals/history');
};

export const trackReferral = async (code: string): Promise<void> => {
  await apiClient.post('/api/referrals/track', { code }, { skipAuth: true });
};

export const generateReferralLink = (code: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/register?ref=${code}`;
};

export const copyReferralLink = async (code: string): Promise<void> => {
  const link = generateReferralLink(code);
  await navigator.clipboard.writeText(link);
};

export const shareReferralLink = (code: string, platform: 'twitter' | 'facebook' | 'linkedin' | 'email') => {
  const link = generateReferralLink(code);
  const text = 'Join NEXORA and get 50 free credits! Build your startup with AI-powered tools.';
  
  const urls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
    email: `mailto:?subject=${encodeURIComponent('Join NEXORA')}&body=${encodeURIComponent(`${text}\n\n${link}`)}`,
  };
  
  window.open(urls[platform], '_blank', 'width=600,height=400');
};
