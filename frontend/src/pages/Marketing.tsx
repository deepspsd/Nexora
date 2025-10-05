import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Users,
  Mail,
  Share2,
  Megaphone,
  BarChart3,
  Loader2,
  Sparkles,
  CheckCircle,
  Calendar,
  Zap,
  Globe,
  Instagram,
  Linkedin,
  Youtube
} from "lucide-react";
import { buildMarketingStrategy, type MarketingStrategy } from "@/lib/api";

const Marketing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    idea: location.state?.idea || "",
    target_audience: "",
    budget: 10000
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [marketingStrategy, setMarketingStrategy] = useState<MarketingStrategy | null>(null);
  const [error, setError] = useState("");

  const budgetOptions = [
    { value: 5000, label: "$5,000" },
    { value: 10000, label: "$10,000" },
    { value: 25000, label: "$25,000" },
    { value: 50000, label: "$50,000" },
    { value: 100000, label: "$100,000+" }
  ];

  const handleGenerate = async () => {
    if (!formData.idea.trim()) {
      setError("Please enter your business idea");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const result = await buildMarketingStrategy({
        idea: formData.idea,
        target_audience: formData.target_audience,
        budget: formData.budget
      });

      setMarketingStrategy(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate marketing strategy. Please try again.");
      console.error("Marketing strategy error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getChannelIcon = (channel: string) => {
    const channelLower = channel.toLowerCase();
    if (channelLower.includes('social') || channelLower.includes('instagram')) return Instagram;
    if (channelLower.includes('linkedin')) return Linkedin;
    if (channelLower.includes('email')) return Mail;
    if (channelLower.includes('content') || channelLower.includes('blog')) return Globe;
    if (channelLower.includes('video') || channelLower.includes('youtube')) return Youtube;
    return Megaphone;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <Megaphone className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Marketing Strategy</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Build Your Marketing Strategy
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get AI-powered marketing strategies with channel recommendations, budget allocation, and growth tactics
            </p>
          </motion.div>

          {!marketingStrategy ? (
            /* Input Form */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
                <div className="space-y-6">
                  {/* Business Idea */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Business Idea *
                    </label>
                    <textarea
                      value={formData.idea}
                      onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                      placeholder="Describe your business and what you're offering..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 min-h-[120px] resize-none"
                      disabled={isGenerating}
                    />
                  </div>

                  {/* Target Audience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      value={formData.target_audience}
                      onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                      placeholder="e.g., Small business owners, Tech-savvy millennials"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400"
                      disabled={isGenerating}
                    />
                  </div>

                  {/* Budget Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Marketing Budget
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {budgetOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setFormData({ ...formData, budget: option.value })}
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all text-center",
                            formData.budget === option.value
                              ? "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                              : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-green-300 dark:hover:border-green-700"
                          )}
                          disabled={isGenerating}
                        >
                          <div className="font-semibold">{option.label}</div>
                        </button>
                      ))}
                      <input
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                        placeholder="Custom"
                        className="p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-center"
                        disabled={isGenerating}
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl"
                    >
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </motion.div>
                  )}

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !formData.idea.trim()}
                    className={cn(
                      "w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2",
                      isGenerating || !formData.idea.trim()
                        ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 shadow-lg hover:shadow-xl"
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Generating Strategy...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Generate Marketing Strategy</span>
                      </>
                    )}
                  </button>

                  {/* Features Preview */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    {[
                      { icon: Target, label: "Multi-Channel" },
                      { icon: BarChart3, label: "ROI Focused" },
                      { icon: Zap, label: "Growth Tactics" }
                    ].map((feature, index) => (
                      <div key={index} className="text-center">
                        <feature.icon className="w-6 h-6 text-green-500 dark:text-green-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">{feature.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Marketing Strategy Results */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Header with Budget */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Your Marketing Strategy
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Total Budget: <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(marketingStrategy.total_budget)}</span>
                  </p>
                </div>
                <button
                  onClick={() => setMarketingStrategy(null)}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
                >
                  Create New Strategy
                </button>
              </div>

              {/* Strategy Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-xl p-6 text-white"
                >
                  <Users className="w-8 h-8 mb-4" />
                  <h3 className="text-xl font-bold mb-3">Customer Acquisition</h3>
                  <p className="text-white/90 leading-relaxed">
                    {marketingStrategy.customer_acquisition_strategy}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-xl p-6 text-white"
                >
                  <Target className="w-8 h-8 mb-4" />
                  <h3 className="text-xl font-bold mb-3">Retention Strategy</h3>
                  <p className="text-white/90 leading-relaxed">
                    {marketingStrategy.retention_strategy}
                  </p>
                </motion.div>
              </div>

              {/* Marketing Channels */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Marketing Channels</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {marketingStrategy.channels.map((channel, index) => {
                    const ChannelIcon = getChannelIcon(channel.channel);
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <ChannelIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-medium">
                            {channel.expected_roi}x ROI
                          </span>
                        </div>
                        
                        <h4 className="font-bold text-gray-900 dark:text-white mb-3">{channel.channel}</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                          {channel.strategy}
                        </p>
                        
                        <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Estimated Cost</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(channel.estimated_cost)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Timeline</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {channel.timeline}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Growth Tactics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <Zap className="w-6 h-6 text-green-500" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Growth Tactics</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {marketingStrategy.growth_tactics.map((tactic, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{tactic}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Budget Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <DollarSign className="w-6 h-6 text-green-500" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Allocation</h3>
                </div>
                
                {/* Budget Chart */}
                <div className="space-y-4">
                  {marketingStrategy.channels.map((channel, index) => {
                    const percentage = (channel.estimated_cost / marketingStrategy.total_budget) * 100;
                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{channel.channel}</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(channel.estimated_cost)} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                            className="h-full bg-gradient-to-r from-green-500 to-teal-600 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Budget</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(marketingStrategy.total_budget)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Expected ROI Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl shadow-xl p-8 text-white"
              >
                <h3 className="text-2xl font-bold mb-4">Expected Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { 
                      label: "Average ROI", 
                      value: `${(marketingStrategy.channels.reduce((sum, ch) => sum + ch.expected_roi, 0) / marketingStrategy.channels.length).toFixed(1)}x`,
                      icon: TrendingUp
                    },
                    { 
                      label: "Marketing Channels", 
                      value: marketingStrategy.channels.length.toString(),
                      icon: Megaphone
                    },
                    { 
                      label: "Growth Tactics", 
                      value: marketingStrategy.growth_tactics.length.toString(),
                      icon: Zap
                    }
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <stat.icon className="w-8 h-8 mx-auto mb-2 opacity-90" />
                      <div className="text-3xl font-bold mb-1">{stat.value}</div>
                      <div className="text-sm text-white/80">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Next Steps CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="text-center space-y-4"
              >
                <p className="text-gray-600 dark:text-gray-400">Ready to bring your idea to life?</p>
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => navigate("/mvp-development", { state: { idea: formData.idea } })}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Build MVP →
                  </button>
                  <button
                    onClick={() => navigate("/pitch-deck", { state: { idea: formData.idea } })}
                    className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-green-500 text-green-600 dark:text-green-400 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Create Pitch Deck →
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Marketing;
