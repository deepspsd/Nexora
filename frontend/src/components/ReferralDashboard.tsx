import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Users, DollarSign, Copy, Check, Share2, Twitter, Facebook, Linkedin, Mail } from 'lucide-react';
import { getReferralCode, getReferralStats, copyReferralLink, shareReferralLink, ReferralStats } from '@/lib/referrals/referralSystem';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import LoadingSkeleton from './LoadingSkeleton';

const ReferralDashboard = () => {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const [code, referralStats] = await Promise.all([
        getReferralCode(),
        getReferralStats(),
      ]);
      
      setStats({ ...referralStats, code });
    } catch (error) {
      console.error('Failed to load referral data:', error);
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!stats?.code) return;
    
    try {
      await copyReferralLink(stats.code);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'linkedin' | 'email') => {
    if (!stats?.code) return;
    shareReferralLink(stats.code, platform);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="card" />
        <LoadingSkeleton variant="rectangular" className="h-32" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Failed to load referral data</p>
      </div>
    );
  }

  const referralLink = `${window.location.origin}/register?ref=${stats.code}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Gift className="w-8 h-8" />
          <h2 className="text-3xl font-bold">Refer & Earn</h2>
        </div>
        <p className="text-white/90 text-lg">
          Invite friends and earn 100 credits for each successful referral!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-blue-500" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalReferrals}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Total Referrals</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <Check className="w-8 h-8 text-green-500" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.successfulReferrals}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Successful</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-orange-500" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.creditsEarned}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Credits Earned</p>
        </motion.div>
      </div>

      {/* Referral Link */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Your Referral Link
        </h3>
        
        <div className="flex items-center space-x-3 mb-4">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-sm"
          />
          <button
            onClick={handleCopy}
            className={cn(
              'px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2',
              copied
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg'
            )}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Share Buttons */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Share on:
          </span>
          <button
            onClick={() => handleShare('twitter')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Share on Twitter"
          >
            <Twitter className="w-5 h-5 text-blue-400" />
          </button>
          <button
            onClick={() => handleShare('facebook')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Share on Facebook"
          >
            <Facebook className="w-5 h-5 text-blue-600" />
          </button>
          <button
            onClick={() => handleShare('linkedin')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Share on LinkedIn"
          >
            <Linkedin className="w-5 h-5 text-blue-700" />
          </button>
          <button
            onClick={() => handleShare('email')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Share via Email"
          >
            <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          How It Works
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-orange-600 dark:text-orange-400 font-bold">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Share your link</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Send your unique referral link to friends
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-orange-600 dark:text-orange-400 font-bold">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">They sign up</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your friend creates an account using your link
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-orange-600 dark:text-orange-400 font-bold">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Earn rewards</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get 100 credits when they make their first purchase
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboard;
