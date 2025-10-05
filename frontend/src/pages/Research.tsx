import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  Search, 
  TrendingUp, 
  Users, 
  Target, 
  Loader2, 
  BarChart,
  Globe,
  DollarSign,
  FileDown,
  PieChart,
  Activity,
  Shield,
  Briefcase,
  ChevronDown,
  Plus,
  X,
  Tag,
  Eye,
  Clock,
  Star,
  Zap,
  Brain,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Info,
  Smartphone,
  Tablet,
  Monitor
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";

interface MarketData {
  TAM: { value: number; currency: string; description: string; growth_rate: number };
  SAM: { value: number; currency: string; description: string; percentage_of_TAM: number };
  SOM: { value: number; currency: string; description: string; percentage_of_SAM: number };
  market_trends: Array<{ trend: string; impact: string; description: string }>;
  growth_forecast: { next_year: number; three_years: number; five_years: number };
}

interface CompetitorData {
  name: string;
  market_share: number;
  strengths: string[];
  weaknesses: string[];
  key_products: string[];
  pricing_strategy: string;
}

// Loading skeleton component
const LoadingSkeleton = ({ className, rows = 1 }: { className?: string; rows?: number }) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="animate-pulse bg-gray-200 rounded h-4" />
    ))}
  </div>
);

// Enhanced card component with hover effects
const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  delay?: number; 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="flex items-center space-x-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:border-blue-200 transition-all duration-300 cursor-pointer group"
  >
    <motion.div 
      whileHover={{ rotate: [0, -10, 10, 0] }}
      className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors"
    >
      <Icon className="w-5 h-5 text-blue-600" />
    </motion.div>
    <div>
      <h3 className="font-medium text-gray-900 group-hover:text-blue-900 transition-colors">{title}</h3>
      <p className="text-sm text-gray-600 group-hover:text-blue-700 transition-colors">{description}</p>
    </div>
  </motion.div>
);

const Research = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    industry: "",
    targetMarket: "",
    problem: "",
    region: "Global",
    budget: 10000,
    competitors: [] as string[],
    keywords: [] as string[]
  });
  const [competitorInput, setCompetitorInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [improvedIdea, setImprovedIdea] = useState<string>("");
  const [showGraphPreview, setShowGraphPreview] = useState(false);
  const [userCredits, setUserCredits] = useState(20);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [analysisProgress, setAnalysisProgress] = useState(0);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    // Get user credits
    const credits = localStorage.getItem("userCredits");
    if (credits) {
      setUserCredits(parseInt(credits));
    }

    // Check if we came from idea validation
    if (location.state?.idea) {
      setImprovedIdea(location.state.idea);
      // Pre-fill form if we have validation data
      if (location.state.targetAudience) {
        setFormData(prev => ({ ...prev, targetMarket: location.state.targetAudience }));
      }
      if (location.state.competitors) {
        setFormData(prev => ({ ...prev, competitors: location.state.competitors }));
      }
    }

    return () => clearTimeout(timer);
  }, [location.state]);

  // Detect device type for responsive design
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setViewMode('mobile');
      } else if (width < 1024) {
        setViewMode('tablet');
      } else {
        setViewMode('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.industry || !formData.targetMarket) {
      alert("Please fill in all required fields");
      return;
    }

    if (userCredits < 2) {
      alert("Insufficient credits. You need at least 2 credits for market research.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch("http://localhost:8000/api/marketResearch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          industry: formData.industry,
          targetMarket: formData.targetMarket,
          region: formData.region,
          competitors: formData.competitors,
          keywords: formData.keywords,
          budget: formData.budget,
          problem: formData.problem || improvedIdea,
          userId: localStorage.getItem("userId")
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to conduct market research");
      }

      const result = await response.json();
      
      // Transform the response to match our expected structure
      const transformedResults = {
        ...result.data,
        tokensUsed: result.tokensUsed || 0,
        creditsUsed: result.creditsUsed || 2
      };
      
      setAnalysisProgress(100);
      setTimeout(() => {
        setResults(transformedResults);
        
        // Update credits
        const newCredits = result.remainingCredits || (userCredits - 2);
        setUserCredits(newCredits);
        localStorage.setItem("userCredits", newCredits.toString());
        
        // Store results for next steps
        localStorage.setItem("marketResearchData", JSON.stringify(transformedResults));
      }, 500);
    } catch (error: any) {
      console.error("Market research error:", error);
      alert(error.message || "Failed to conduct market research. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit_old = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userCredits < 2) {
      alert("Insufficient credits. You need at least 2 credits for market research.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch("http://localhost:8000/api/market-research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          industry: formData.industry,
          targetMarket: formData.targetMarket,
          problem: formData.problem,
          region: formData.region,
          competitors: formData.competitors,
          keywords: formData.keywords,
          budget: formData.budget,
          userId: localStorage.getItem("userId")
        })
      });

      const data = await response.json();
      setResults(data.data);
      
      // Update credits
      const newCredits = userCredits - 2;
      setUserCredits(newCredits);
      localStorage.setItem("userCredits", newCredits.toString());
      
      setIsAnalyzing(false);
    } catch (error) {
      console.error("Error generating research:", error);
      alert("Error generating research. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const addCompetitor = () => {
    if (competitorInput.trim() && formData.competitors.length < 5) {
      setFormData(prev => ({
        ...prev,
        competitors: [...prev.competitors, competitorInput.trim()]
      }));
      setCompetitorInput("");
    }
  };

  const removeCompetitor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      competitors: prev.competitors.filter((_, i) => i !== index)
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && formData.keywords.length < 10) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput("");
    }
  };

  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  const exportAsPDF = () => {
    console.log("Exporting as PDF...");
    // Implementation for PDF export
  };

  const getMarketSizeChartData = () => {
    if (!results?.market_size) return [];
    const { TAM, SAM, SOM } = results.market_size;
    return [
      { name: "TAM", value: TAM.value, fill: "#3b82f6" },
      { name: "SAM", value: SAM.value, fill: "#10b981" },
      { name: "SOM", value: SOM.value, fill: "#f59e0b" }
    ];
  };

  const getGrowthForecastData = () => {
    if (!results?.market_size?.growth_forecast) return [];
    const forecast = results.market_size.growth_forecast;
    return [
      { year: "Year 1", growth: forecast.next_year },
      { year: "Year 3", growth: forecast.three_years },
      { year: "Year 5", growth: forecast.five_years }
    ];
  };

  const renderGraphPreview = () => {
    if (!results?.graph_code) return null;
    
    // This would render the generated graph code
    // For now, we'll show a placeholder
    return (
      <div className="bg-white p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Market Visualization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={getMarketSizeChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => `$${value}B`} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getGrowthForecastData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value: any) => `${value}%`} />
              <Line type="monotone" dataKey="growth" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      {/* Header */}
      <header className="fixed top-16 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <Search className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Market Research</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mb-4">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Comprehensive <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Market Research</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get detailed industry reports, competitor SWOT analysis, and market size calculations (TAM, SAM, SOM)
            </p>
            
            {/* Credits Display */}
            <div className="inline-flex items-center mt-4 px-4 py-2 bg-blue-50 rounded-full">
              <span className="text-sm font-medium text-gray-700">Available Credits:</span>
              <span className="ml-2 text-lg font-bold text-blue-600">{userCredits}</span>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: TrendingUp, text: "Market Trends" },
              { icon: Users, text: "Target Audience" },
              { icon: Target, text: "Competitor Analysis" },
              { icon: BarChart, text: "Growth Potential" }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center space-x-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                <feature.icon className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">{feature.text}</span>
              </div>
            ))}
          </div>

          {!results ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form */}
              <div className="bg-white rounded-2xl shadow-elegant p-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Research Parameters</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Industry/Domain */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry / Domain <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Finance">Finance</option>
                      <option value="Education">Education</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Region/Market Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Region / Market Location
                    </label>
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Global">Global</option>
                      <option value="North America">North America</option>
                      <option value="Europe">Europe</option>
                      <option value="Asia Pacific">Asia Pacific</option>
                      <option value="Latin America">Latin America</option>
                      <option value="Middle East & Africa">Middle East & Africa</option>
                    </select>
                  </div>

                  {/* Target Market */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Market <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.targetMarket}
                      onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Small Businesses, Millennials"
                    />
                  </div>

                  {/* Competitors */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Competitor Names (Optional)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={competitorInput}
                        onChange={(e) => setCompetitorInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetitor())}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter competitor name"
                      />
                      <button
                        type="button"
                        onClick={addCompetitor}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.competitors.map((comp, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm">
                          {comp}
                          <button
                            type="button"
                            onClick={() => removeCompetitor(index)}
                            className="ml-2 text-gray-500 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Research Keywords (Optional)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter keyword"
                      />
                      <button
                        type="button"
                        onClick={addKeyword}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                      >
                        <Tag className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.keywords.map((keyword, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-50 rounded-full text-sm text-blue-700">
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeKeyword(index)}
                            className="ml-2 text-blue-500 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Budget Constraints */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Constraints (USD)
                    </label>
                    <input
                      type="range"
                      min="1000"
                      max="100000"
                      step="1000"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>$1,000</span>
                      <span className="font-semibold text-blue-600">${formData.budget.toLocaleString()}</span>
                      <span>$100,000</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAnalyzing || userCredits < 2}
                    className={cn(
                      "w-full py-4 rounded-full font-medium text-white transition-all duration-300",
                      "bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "flex items-center justify-center space-x-2"
                    )}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Analyzing Market Data...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        <span>Start Research (2 Credits)</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Preview Panel */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What You'll Get</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">TAM, SAM, SOM Analysis</h4>
                      <p className="text-sm text-gray-600 mt-1">Complete market size calculations with growth projections</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">SWOT Analysis</h4>
                      <p className="text-sm text-gray-600 mt-1">Comprehensive competitor strengths, weaknesses, opportunities, and threats</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Activity className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Market Trends</h4>
                      <p className="text-sm text-gray-600 mt-1">Current and emerging trends with impact analysis</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <PieChart className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Interactive Charts</h4>
                      <p className="text-sm text-gray-600 mt-1">Visual representations of market data and growth forecasts</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <FileDown className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Export Options</h4>
                      <p className="text-sm text-gray-600 mt-1">Download as PDF or pitch-ready insights</p>
                    </div>
                  </div>
                </div>

                {improvedIdea && (
                  <div className="mt-6 p-4 bg-white rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Your Validated Idea:</h4>
                    <p className="text-sm text-gray-600 italic">"{improvedIdea.substring(0, 150)}..."</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Results Section */
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Market Research Results</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setResults(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    New Research
                  </button>
                  <button
                    onClick={exportAsPDF}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Export PDF
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                {["overview", "competitors", "market-size", "insights"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-md font-medium transition-all",
                      activeTab === tab
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === "overview" && (
                <div>
                  {/* Market Trends */}
                  <div className="bg-white rounded-xl shadow-elegant p-6 mb-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                      Market Trends
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results?.marketTrends?.map((trend: any, idx: number) => (
                        <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                          <h4 className="font-semibold text-gray-900">{trend.trend}</h4>
                          <p className="text-sm text-gray-600 mt-1">{trend.description}</p>
                          <span className={cn(
                            "inline-block px-2 py-1 rounded-full text-xs font-medium mt-2",
                            trend.impact === "high" ? "bg-red-100 text-red-700" :
                            trend.impact === "medium" ? "bg-yellow-100 text-yellow-700" :
                            "bg-green-100 text-green-700"
                          )}>
                            {trend.impact} impact
                          </span>
                        </div>
                      )) || (
                        <div className="col-span-2 text-gray-500 text-center py-4">
                          Market trends analysis will appear here
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gap Analysis */}
                  {results?.gapAnalysis && results.gapAnalysis.length > 0 && (
                    <div className="bg-white rounded-xl shadow-elegant p-6 mb-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                        <Target className="w-5 h-5 text-green-600 mr-2" />
                        Market Gaps & Opportunities
                      </h3>
                      <div className="space-y-4">
                        {results.gapAnalysis.map((gap: any, idx: number) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-900">{gap.gap}</h4>
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                gap.difficulty === "low" ? "bg-green-100 text-green-700" :
                                gap.difficulty === "medium" ? "bg-yellow-100 text-yellow-700" :
                                "bg-red-100 text-red-700"
                              )}>
                                {gap.difficulty} difficulty
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{gap.opportunity}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Token Usage Display */}
                  {results?.tokensUsed && (
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <Activity className="w-5 h-5 text-gray-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Tokens Used</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{results.tokensUsed.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "competitors" && (
                <div>
                  {/* Competitor Table */}
                  {results?.competitorTable && results.competitorTable.length > 0 && (
                    <div className="bg-white rounded-xl shadow-elegant p-6 mb-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                        <Users className="w-5 h-5 text-purple-600 mr-2" />
                        Competitor Analysis
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 font-semibold text-gray-900">Company</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-900">Market Share</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-900">Strengths</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-900">Weaknesses</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-900">Opportunity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {results.competitorTable.map((competitor: any, idx: number) => (
                              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-900">{competitor.name}</td>
                                <td className="py-3 px-4 text-gray-700">{competitor.market_share}%</td>
                                <td className="py-3 px-4 text-sm text-gray-600">
                                  {Array.isArray(competitor.strengths) 
                                    ? competitor.strengths.join(", ") 
                                    : competitor.strengths}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">
                                  {Array.isArray(competitor.weaknesses) 
                                    ? competitor.weaknesses.join(", ") 
                                    : competitor.weaknesses}
                                </td>
                                <td className="py-3 px-4 text-sm text-blue-600">{competitor.opportunity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* SWOT Analysis */}
                  {results?.SWOT && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-green-50 rounded-xl p-6">
                        <h3 className="font-bold text-green-900 mb-4">Strengths</h3>
                        <ul className="space-y-2">
                          {results.SWOT.strengths?.map((item: any, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700">• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-red-50 rounded-xl p-6">
                        <h3 className="font-bold text-red-900 mb-4">Weaknesses</h3>
                        <ul className="space-y-2">
                          {results.SWOT.weaknesses?.map((item: any, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700">• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-6">
                        <h3 className="font-bold text-blue-900 mb-4">Opportunities</h3>
                        <ul className="space-y-2">
                          {results.SWOT.opportunities?.map((item: any, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700">• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-yellow-50 rounded-xl p-6">
                        <h3 className="font-bold text-yellow-900 mb-4">Threats</h3>
                        <ul className="space-y-2">
                          {results.SWOT.threats?.map((item: any, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "market-size" && (
                <div>
                  {results?.marketSize && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-xl shadow-elegant p-6">
                          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Addressable Market (TAM)</h3>
                          <p className="text-3xl font-bold text-blue-600">${results.marketSize.TAM.value}B</p>
                          <p className="text-sm text-gray-600 mt-2">{results.marketSize.TAM.description}</p>
                          <div className="mt-3 text-xs text-gray-500">
                            Growth Rate: {results.marketSize.TAM.growth_rate}% annually
                          </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-elegant p-6">
                          <h3 className="text-sm font-medium text-gray-600 mb-2">Serviceable Addressable Market (SAM)</h3>
                          <p className="text-3xl font-bold text-green-600">${results.marketSize.SAM.value}B</p>
                          <p className="text-sm text-gray-600 mt-2">{results.marketSize.SAM.description}</p>
                          <div className="mt-3 text-xs text-gray-500">
                            {results.marketSize.SAM.percentage_of_TAM}% of TAM
                          </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-elegant p-6">
                          <h3 className="text-sm font-medium text-gray-600 mb-2">Serviceable Obtainable Market (SOM)</h3>
                          <p className="text-3xl font-bold text-orange-600">${results.marketSize.SOM.value}M</p>
                          <p className="text-sm text-gray-600 mt-2">{results.marketSize.SOM.description}</p>
                          <div className="mt-3 text-xs text-gray-500">
                            {results.marketSize.SOM.percentage_of_SAM}% of SAM
                          </div>
                        </div>
                      </div>
                      
                      {/* Growth Forecast */}
                      {results?.growthCharts && (
                        <div className="bg-white rounded-xl shadow-elegant p-6 mb-6">
                          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                            Growth Forecast
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                              <div className="text-2xl font-bold text-gray-900">{results.growthCharts.next_year}%</div>
                              <div className="text-sm text-gray-600">Next Year</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                              <div className="text-2xl font-bold text-gray-900">{results.growthCharts.three_years}%</div>
                              <div className="text-sm text-gray-600">3 Years</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                              <div className="text-2xl font-bold text-gray-900">{results.growthCharts.five_years}%</div>
                              <div className="text-sm text-gray-600">5 Years</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Market Growth Chart */}
                      <div className="bg-white rounded-xl shadow-elegant p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Market Growth Visualization</h3>
                        <div className="text-center">
                          <img 
                            src={`https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify({
                              type: 'line',
                              data: {
                                labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
                                datasets: [{
                                  label: 'TAM ($B)',
                                  data: [
                                    results.marketSize.TAM.value,
                                    results.marketSize.TAM.value * 1.15,
                                    results.marketSize.TAM.value * 1.32,
                                    results.marketSize.TAM.value * 1.52,
                                    results.marketSize.TAM.value * 1.75
                                  ],
                                  borderColor: 'rgb(59, 130, 246)',
                                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                  tension: 0.4
                                }, {
                                  label: 'SAM ($B)',
                                  data: [
                                    results.marketSize.SAM.value,
                                    results.marketSize.SAM.value * 1.20,
                                    results.marketSize.SAM.value * 1.44,
                                    results.marketSize.SAM.value * 1.73,
                                    results.marketSize.SAM.value * 2.07
                                  ],
                                  borderColor: 'rgb(34, 197, 94)',
                                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                  tension: 0.4
                                }]
                              },
                              options: {
                                responsive: true,
                                plugins: {
                                  title: {
                                    display: true,
                                    text: 'Market Size Growth Projection'
                                  }
                                },
                                scales: {
                                  y: {
                                    beginAtZero: true,
                                    title: {
                                      display: true,
                                      text: 'Market Size ($B)'
                                    }
                                  }
                                }
                              }
                            }))}&width=700&height=400`}
                            alt="Market Growth Chart"
                            className="max-w-full h-auto rounded-lg shadow-sm"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "insights" && (
                <div className="bg-white rounded-xl shadow-elegant p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Key Insights & Recommendations</h3>
                  {results?.recommendations && (
                    <ul className="space-y-3">
                      {results.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                            {idx + 1}
                          </span>
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Next Steps */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => navigate("/business-plan", { state: { marketData: results } })}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-medium hover:shadow-lg transition-all"
                >
                  Generate Business Plan →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Research;
