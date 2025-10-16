import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Moon, 
  Sun, 
  Globe, 
  Trash2,
  Save,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Building,
  Key,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/Breadcrumbs";

const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, user, setUser } = useStore();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    company: "",
    phone: "",
    bio: "",
    website: "",
    timezone: "America/New_York"
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    weeklyReports: true,
    securityAlerts: true,
    productUpdates: true
  });

  const [billingData, setBillingData] = useState({
    plan: "Professional",
    credits: user?.credits || 0,
    billingCycle: "monthly",
    nextBilling: "2025-02-01"
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "preferences", label: "Preferences", icon: Globe }
  ];

  const handleSave = async (section: string) => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage("Settings saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    }, 1000);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        // In production, call API to delete account
        // await apiDelete('/user/account');
        alert("Account deletion requested. Please contact support to complete this process.");
      } catch (error) {
        alert("Failed to delete account. Please try again or contact support.");
      }
    }
  };

  const handleExportData = async () => {
    try {
      // In production, call API to export user data
      // const data = await apiGet('/user/export');
      alert("Data export will be sent to your email within 24 hours.");
    } catch (error) {
      alert("Failed to export data. Please try again later.");
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={profileData.company}
                onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            rows={4}
            value={profileData.bio}
            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave("profile")}
          disabled={isSaving}
          className="flex items-center bg-pulse-500 hover:bg-pulse-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Change Password
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Password
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={securityData.currentPassword}
                onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={securityData.newPassword}
                onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={securityData.confirmPassword}
                onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Two-Factor Authentication
        </h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Enable 2FA</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add an extra layer of security to your account
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={securityData.twoFactorEnabled}
              onChange={(e) => setSecurityData({ ...securityData, twoFactorEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pulse-300 dark:peer-focus:ring-pulse-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pulse-600"></div>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave("security")}
          disabled={isSaving}
          className="flex items-center bg-pulse-500 hover:bg-pulse-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Update Security
        </button>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Notification Preferences
        </h3>
        <div className="space-y-4">
          {Object.entries(notificationSettings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {key === 'emailNotifications' && 'Receive notifications via email'}
                  {key === 'pushNotifications' && 'Receive push notifications in browser'}
                  {key === 'marketingEmails' && 'Receive marketing and promotional emails'}
                  {key === 'weeklyReports' && 'Get weekly progress reports'}
                  {key === 'securityAlerts' && 'Important security notifications'}
                  {key === 'productUpdates' && 'Updates about new features'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotificationSettings({ 
                    ...notificationSettings, 
                    [key]: e.target.checked 
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pulse-300 dark:peer-focus:ring-pulse-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pulse-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave("notifications")}
          disabled={isSaving}
          className="flex items-center bg-pulse-500 hover:bg-pulse-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Save Preferences
        </button>
      </div>
    </div>
  );

  const renderBillingTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Current Plan
        </h3>
        <div className="bg-gradient-to-r from-pulse-500 to-pulse-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold">{billingData.plan}</h4>
              <p className="opacity-90">Billed {billingData.billingCycle}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{billingData.credits}</div>
              <div className="text-sm opacity-90">Credits remaining</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Billing Information
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Next Billing Date</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{billingData.nextBilling}</p>
            </div>
            <button className="text-pulse-600 hover:text-pulse-700 font-medium">
              Update Payment Method
            </button>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => navigate("/pricing")}
          className="flex items-center bg-pulse-500 hover:bg-pulse-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Upgrade Plan
        </button>
        <button className="flex items-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold px-6 py-3 rounded-lg transition-colors">
          <Download className="w-5 h-5 mr-2" />
          Download Invoice
        </button>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Appearance
        </h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Theme</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose your preferred theme
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center space-x-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Data & Privacy
        </h3>
        <div className="space-y-4">
          <button
            onClick={handleExportData}
            className="flex items-center justify-between w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center">
              <Download className="w-5 h-5 mr-3 text-gray-400" />
              <div className="text-left">
                <h4 className="font-medium text-gray-900 dark:text-white">Export Data</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Download all your data in JSON format
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={handleDeleteAccount}
            className="flex items-center justify-between w-full p-4 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800"
          >
            <div className="flex items-center">
              <Trash2 className="w-5 h-5 mr-3 text-red-500" />
              <div className="text-left">
                <h4 className="font-medium text-red-900 dark:text-red-100">Delete Account</h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Permanently delete your account and all data
                </p>
              </div>
            </div>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <Breadcrumbs />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your account settings and preferences
            </p>
          </div>

          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center"
            >
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
              <span className="text-green-800 dark:text-green-200">{saveMessage}</span>
            </motion.div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-pulse-100 dark:bg-pulse-900/30 text-pulse-600 dark:text-pulse-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                {activeTab === "profile" && renderProfileTab()}
                {activeTab === "security" && renderSecurityTab()}
                {activeTab === "notifications" && renderNotificationsTab()}
                {activeTab === "billing" && renderBillingTab()}
                {activeTab === "preferences" && renderPreferencesTab()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
