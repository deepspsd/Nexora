import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Bell, Shield, TrendingUp, Gift, Loader2, Check } from 'lucide-react';
import { getEmailPreferences, updateEmailPreferences, EmailPreferences } from '@/lib/notifications/emailService';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const EmailPreferencesComponent = () => {
  const [preferences, setPreferences] = useState<EmailPreferences>({
    projectUpdates: true,
    weeklyTips: true,
    securityAlerts: true,
    marketingEmails: false,
    referralUpdates: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await getEmailPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof EmailPreferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    
    setPreferences(newPreferences);
    setSaving(true);

    try {
      await updateEmailPreferences({ [key]: newPreferences[key] });
      toast.success('Preferences updated');
    } catch (error) {
      // Revert on error
      setPreferences(preferences);
      toast.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const emailTypes = [
    {
      key: 'projectUpdates' as keyof EmailPreferences,
      icon: Bell,
      title: 'Project Updates',
      description: 'Get notified when your projects are ready or encounter issues',
      color: 'text-blue-500',
    },
    {
      key: 'weeklyTips' as keyof EmailPreferences,
      icon: TrendingUp,
      title: 'Weekly Tips',
      description: 'Receive weekly tips and best practices for building startups',
      color: 'text-green-500',
    },
    {
      key: 'securityAlerts' as keyof EmailPreferences,
      icon: Shield,
      title: 'Security Alerts',
      description: 'Important security updates and account notifications',
      color: 'text-red-500',
      required: true,
    },
    {
      key: 'marketingEmails' as keyof EmailPreferences,
      icon: Mail,
      title: 'Marketing Emails',
      description: 'Product updates, new features, and special offers',
      color: 'text-purple-500',
    },
    {
      key: 'referralUpdates' as keyof EmailPreferences,
      icon: Gift,
      title: 'Referral Updates',
      description: 'Updates about your referrals and earned rewards',
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Mail className="w-5 h-5 text-orange-500" />
          <span>Email Notifications</span>
        </h3>

        <div className="space-y-4">
          {emailTypes.map((type, idx) => (
            <motion.div
              key={type.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <div className="flex items-start space-x-4 flex-1">
                <div className={cn('p-2 rounded-lg bg-white dark:bg-gray-800', type.color)}>
                  <type.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {type.title}
                    </h4>
                    {type.required && (
                      <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {type.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => !type.required && handleToggle(type.key)}
                disabled={type.required || saving}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  preferences[type.key] ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600',
                  type.required && 'opacity-50 cursor-not-allowed'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    preferences[type.key] ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 You can unsubscribe from any email type at any time. Security alerts cannot be disabled for account safety.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailPreferencesComponent;
