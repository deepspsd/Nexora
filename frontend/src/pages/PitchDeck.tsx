import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  Presentation, 
  Download, 
  Eye, 
  Loader2, 
  Sparkles, 
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Lightbulb,
  BarChart3,
  PieChart,
  FileText,
  Image,
  Palette,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize,
  Plus,
  X,
  Upload,
  Mic,
  Video,
  MessageCircle,
  Settings,
  Wand2,
  ChevronRight,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  Volume2,
  VolumeX,
  Edit3,
  Save,
  RefreshCw
} from "lucide-react";

// Types and Interfaces
interface SlideContent {
  slide_number: number;
  title: string;
  content: string[];
  notes: string;
  chart_data?: any;
  chart_type?: string;
}

interface DesignTheme {
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
  style_description: string;
}

interface VoiceoverNarration {
  slide_number: number;
  text: string;
  audio_url?: string;
  duration_seconds: number;
}

interface DemoScript {
  full_script: string;
  slide_scripts: any[];
  total_duration_minutes: number;
  pacing_cues: string[];
  emphasis_points: string[];
}

interface InvestorQuestion {
  question: string;
  category: string;
  difficulty: string;
  suggested_answer: string;
  key_points: string[];
}

interface PitchDeckData {
  deck_id: string;
  business_name: string;
  tagline: string;
  slides: SlideContent[];
  design_theme: DesignTheme;
  voiceovers: VoiceoverNarration[];
  demo_script: DemoScript;
  investor_qa: InvestorQuestion[];
  pptx_url?: string;
  video_url?: string;
}

const PitchDeck = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Form State
  const [formData, setFormData] = useState({
    businessIdea: "",
    businessName: "",
    targetMarket: "",
    fundingAsk: 100000
  });

  // App State
  const [currentModule, setCurrentModule] = useState("generator");
  const [pitchDeckData, setPitchDeckData] = useState<PitchDeckData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userCredits, setUserCredits] = useState(20);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<DesignTheme | null>(null);
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(false);
  const [demoScript, setDemoScript] = useState<DemoScript | null>(null);
  const [investorQA, setInvestorQA] = useState<InvestorQuestion[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    const credits = localStorage.getItem('userCredits');
    if (credits) {
      setUserCredits(parseInt(credits));
    }

    // Pre-fill from previous steps if available
    if (location.state?.businessData) {
      setFormData(prev => ({ ...prev, ...location.state.businessData }));
    }
  }, [location.state]);

  // Module 1: Auto Slide Generator
  const generateSlides = async () => {
    if (!formData.businessIdea || !formData.businessName) {
      alert('Please fill in business idea and name.');
      return;
    }

    if (userCredits < 3) {
      alert('Insufficient credits. You need at least 3 credits to generate slides.');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('http://localhost:8000/api/pitch-deck/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          business_idea: formData.businessIdea,
          business_name: formData.businessName,
          target_market: formData.targetMarket,
          funding_ask: formData.fundingAsk,
          userId: localStorage.getItem('userId')
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate slides');
      }

      const data = await response.json();
      setPitchDeckData(data.data);
      
      // Update credits
      const newCredits = userCredits - 3;
      setUserCredits(newCredits);
      localStorage.setItem('userCredits', newCredits.toString());
      
    } catch (error) {
      console.error('Error generating slides:', error);
      alert('Error generating slides. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Module 2: Voiceover Narration
  const generateVoiceovers = async () => {
    if (!pitchDeckData) return;

    try {
      const response = await fetch('http://localhost:8000/api/pitch-deck/voiceover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          deck_id: pitchDeckData.deck_id,
          slides: pitchDeckData.slides
        }),
      });

      const data = await response.json();
      setPitchDeckData(prev => prev ? { ...prev, voiceovers: data.voiceovers } : null);
      setVoiceoverEnabled(true);
    } catch (error) {
      console.error('Error generating voiceovers:', error);
    }
  };

  // Module 3: AI Design Theme Selector
  const selectDesignTheme = async (themeName: string) => {
    if (!pitchDeckData) return;

    try {
      const response = await fetch('http://localhost:8000/api/pitch-deck/design-theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          deck_id: pitchDeckData.deck_id,
          theme_name: themeName,
          business_type: formData.targetMarket
        }),
      });

      const data = await response.json();
      setSelectedTheme(data.theme);
      setPitchDeckData(prev => prev ? { ...prev, design_theme: data.theme } : null);
    } catch (error) {
      console.error('Error selecting theme:', error);
    }
  };

  // Module 4: Demo Script Writer
  const generateDemoScript = async () => {
    if (!pitchDeckData) return;

    try {
      const response = await fetch('http://localhost:8000/api/pitch-deck/demo-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          deck_id: pitchDeckData.deck_id,
          slides: pitchDeckData.slides,
          target_duration: 10 // 10 minutes
        }),
      });

      const data = await response.json();
      setDemoScript(data.demo_script);
    } catch (error) {
      console.error('Error generating demo script:', error);
    }
  };

  // Module 5: Investor Q&A Simulator
  const generateInvestorQA = async () => {
    if (!pitchDeckData) return;

    try {
      const response = await fetch('http://localhost:8000/api/pitch-deck/investor-qa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          deck_id: pitchDeckData.deck_id,
          business_idea: formData.businessIdea,
          target_market: formData.targetMarket,
          num_questions: 15
        }),
      });

      const data = await response.json();
      setInvestorQA(data.questions);
    } catch (error) {
      console.error('Error generating Q&A:', error);
    }
  };

  // Module 6: PPTX Export
  const exportToPPTX = async () => {
    if (!pitchDeckData) return;

    try {
      const response = await fetch(`http://localhost:8000/api/pitch-deck/export/${pitchDeckData.deck_id}/pptx`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.businessName}_pitch_deck.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting PPTX:', error);
    }
  };

  // Navigation helpers
  const nextSlide = () => {
    if (pitchDeckData && currentSlide < pitchDeckData.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // Design themes
  const designThemes = [
    { name: "Modern Tech", color: "from-blue-500 to-purple-600" },
    { name: "Corporate", color: "from-gray-600 to-blue-800" },
    { name: "Creative", color: "from-pink-500 to-orange-500" },
    { name: "Minimal", color: "from-gray-400 to-gray-600" },
    { name: "Bold", color: "from-red-500 to-yellow-500" }
  ];

  // Module navigation
  const modules = [
    { id: "generator", name: "Slide Generator", icon: Presentation, description: "Generate 12 professional slides" },
    { id: "themes", name: "Design Themes", icon: Palette, description: "AI-powered theme selection" },
    { id: "voiceover", name: "Voiceover", icon: Mic, description: "Add AI narration" },
    { id: "charts", name: "Charts", icon: BarChart3, description: "Auto-generate charts" },
    { id: "script", name: "Demo Script", icon: FileText, description: "Presentation script" },
    { id: "qa", name: "Investor Q&A", icon: MessageCircle, description: "Practice questions" },
    { id: "export", name: "Export", icon: Download, description: "Download as PPTX" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <Breadcrumbs />
      
      {/* Header */}
      <header className="fixed top-16 left-0 right-0 z-40 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <Presentation className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">AI Pitch Deck Studio</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Credits:</span>
              <span className="text-lg font-bold text-orange-600">{userCredits}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          
          {/* Module Navigation */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 bg-white rounded-xl p-2 shadow-sm">
              {modules.map((module) => {
                const Icon = module.icon;
                return (
                  <button
                    key={module.id}
                    onClick={() => setCurrentModule(module.id)}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all",
                      currentModule === module.id
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{module.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Module Content */}
          <AnimatePresence mode="wait">
            {currentModule === "generator" && (
              <motion.div
                key="generator"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                {/* Input Form */}
                <div className="bg-white rounded-2xl shadow-elegant p-8 border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Sparkles className="w-6 h-6 text-orange-500 mr-2" />
                    Business Information
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Your Company Name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Idea <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        value={formData.businessIdea}
                        onChange={(e) => setFormData({ ...formData, businessIdea: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Describe your business idea, problem you're solving, and solution..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Market
                      </label>
                      <input
                        type="text"
                        value={formData.targetMarket}
                        onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="e.g., Small Businesses, Millennials, Healthcare"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Funding Ask (USD)
                      </label>
                      <input
                        type="number"
                        value={formData.fundingAsk}
                        onChange={(e) => setFormData({ ...formData, fundingAsk: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="100000"
                      />
                    </div>

                    <button
                      onClick={generateSlides}
                      disabled={isGenerating || userCredits < 3}
                      className={cn(
                        "w-full py-4 rounded-full font-medium text-white transition-all duration-300",
                        "bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "flex items-center justify-center space-x-2"
                      )}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Generating Slides...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5" />
                          <span>Generate 12 Slides (3 Credits)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Preview/Results */}
                <div className="bg-white rounded-2xl shadow-elegant p-8 border border-gray-200">
                  {!pitchDeckData ? (
                    <div className="text-center py-12">
                      <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-orange-100 to-red-100 mb-4">
                        <Presentation className="w-8 h-8 text-orange-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Pitch Deck</h3>
                      <p className="text-gray-600 mb-6">Generate professional slides automatically</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-left">
                        {[
                          "Title & Company Overview",
                          "Problem Statement", 
                          "Solution & Product",
                          "Market Opportunity",
                          "Business Model",
                          "Traction & Metrics",
                          "Competition Analysis", 
                          "Team & Advisors",
                          "Financial Projections",
                          "Funding Ask & Use",
                          "Vision & Roadmap",
                          "Call to Action"
                        ].map((slide, index) => (
                          <div key={index} className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 border border-orange-200">
                            <div className="text-sm font-medium text-orange-700 mb-1">{index + 1}. {slide}</div>
                            <div className="h-8 bg-white rounded border border-orange-200 flex items-center justify-center">
                              <span className="text-xs text-gray-500">Slide {index + 1}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Generated Slides</h3>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setIsPresenting(true)}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2"
                          >
                            <Play className="w-4 h-4" />
                            <span>Present</span>
                          </button>
                        </div>
                      </div>

                      {/* Slide Navigation */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={prevSlide}
                          disabled={currentSlide === 0}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <SkipBack className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-600">
                          Slide {currentSlide + 1} of {pitchDeckData.slides.length}
                        </span>
                        <button
                          onClick={nextSlide}
                          disabled={currentSlide === pitchDeckData.slides.length - 1}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <SkipForward className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Current Slide */}
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-8 border border-orange-200 min-h-[300px]">
                        <div className="text-center">
                          <h4 className="text-2xl font-bold text-gray-900 mb-4">
                            {pitchDeckData.slides[currentSlide]?.title}
                          </h4>
                          <div className="text-gray-700 space-y-2">
                            {pitchDeckData.slides[currentSlide]?.content.map((item, index) => (
                              <p key={index} className="text-left">• {item}</p>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Slide Thumbnails */}
                      <div className="flex space-x-2 mt-4 overflow-x-auto">
                        {pitchDeckData.slides.map((slide, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={cn(
                              "flex-shrink-0 w-20 h-12 rounded border-2 flex items-center justify-center text-xs",
                              currentSlide === index
                                ? "border-orange-500 bg-orange-50"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            )}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Other modules would be implemented similarly */}
            {currentModule === "themes" && pitchDeckData && (
              <motion.div
                key="themes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-elegant p-8 border border-gray-200"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Palette className="w-6 h-6 text-orange-500 mr-2" />
                  Design Themes
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {designThemes.map((theme, index) => (
                    <button
                      key={index}
                      onClick={() => selectDesignTheme(theme.name)}
                      className={cn(
                        "p-6 rounded-xl border-2 transition-all",
                        selectedTheme?.name === theme.name
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className={`w-full h-20 rounded-lg bg-gradient-to-r ${theme.color} mb-3`}></div>
                      <p className="font-medium text-gray-900">{theme.name}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Voiceover Module */}
            {currentModule === "voiceover" && pitchDeckData && (
              <motion.div
                key="voiceover"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-elegant p-8 border border-gray-200"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Mic className="w-6 h-6 text-orange-500 mr-2" />
                  AI Voiceover Narration
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">Generate Voiceovers</h4>
                      <p className="text-sm text-gray-600">Add AI narration to all slides using ElevenLabs</p>
                    </div>
                    <button
                      onClick={generateVoiceovers}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Generate</span>
                    </button>
                  </div>

                  {pitchDeckData.voiceovers && pitchDeckData.voiceovers.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Generated Voiceovers</h4>
                      {pitchDeckData.voiceovers.map((voiceover, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">Slide {voiceover.slide_number}</h5>
                            <p className="text-sm text-gray-600 mt-1">{voiceover.text.substring(0, 100)}...</p>
                            <span className="text-xs text-gray-500">{voiceover.duration_seconds}s</span>
                          </div>
                          <button
                            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                          >
                            {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Charts Module */}
            {currentModule === "charts" && pitchDeckData && (
              <motion.div
                key="charts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-elegant p-8 border border-gray-200"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <BarChart3 className="w-6 h-6 text-orange-500 mr-2" />
                  Chart Auto-Builder
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: "Market Size", type: "bar", description: "TAM, SAM, SOM visualization" },
                    { name: "Revenue Growth", type: "line", description: "5-year revenue projections" },
                    { name: "Market Share", type: "pie", description: "Competitive positioning" },
                    { name: "User Acquisition", type: "area", description: "Customer growth metrics" },
                    { name: "Unit Economics", type: "bar", description: "LTV, CAC, and margins" },
                    { name: "Funding Timeline", type: "line", description: "Fundraising milestones" }
                  ].map((chart, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{chart.name}</h4>
                        <BarChart3 className="w-5 h-5 text-orange-500" />
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{chart.description}</p>
                      <div className="h-24 bg-gradient-to-r from-orange-100 to-red-100 rounded border border-orange-200 flex items-center justify-center">
                        <span className="text-xs text-gray-500">Chart Preview</span>
                      </div>
                      <button className="w-full mt-3 px-3 py-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 text-sm">
                        Add to Slide
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Demo Script Module */}
            {currentModule === "script" && pitchDeckData && (
              <motion.div
                key="script"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-elegant p-8 border border-gray-200"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <FileText className="w-6 h-6 text-orange-500 mr-2" />
                  Demo Day Script Writer
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">Generate Presentation Script</h4>
                      <p className="text-sm text-gray-600">AI-powered script for demo day presentation</p>
                    </div>
                    <button
                      onClick={generateDemoScript}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Generate Script</span>
                    </button>
                  </div>

                  {demoScript && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">Generated Script</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{demoScript.total_duration_minutes} minutes</span>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700">{demoScript.full_script}</pre>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Pacing Cues</h5>
                          <ul className="space-y-1">
                            {demoScript.pacing_cues.map((cue, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-center">
                                <Zap className="w-3 h-3 text-orange-500 mr-2" />
                                {cue}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Emphasis Points</h5>
                          <ul className="space-y-1">
                            {demoScript.emphasis_points.map((point, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-center">
                                <Target className="w-3 h-3 text-red-500 mr-2" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Investor Q&A Module */}
            {currentModule === "qa" && pitchDeckData && (
              <motion.div
                key="qa"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-elegant p-8 border border-gray-200"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <MessageCircle className="w-6 h-6 text-orange-500 mr-2" />
                  Investor Q&A Simulator
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">Generate Practice Questions</h4>
                      <p className="text-sm text-gray-600">AI-generated investor questions with suggested answers</p>
                    </div>
                    <button
                      onClick={generateInvestorQA}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2"
                    >
                      <Brain className="w-4 h-4" />
                      <span>Generate Q&A</span>
                    </button>
                  </div>

                  {investorQA.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Practice Questions ({investorQA.length})</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {["financial", "market", "team", "product", "competition"].map((category) => (
                          <div key={category} className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-bold text-orange-600">
                              {investorQA.filter(q => q.category === category).length}
                            </div>
                            <div className="text-sm text-gray-600 capitalize">{category}</div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {investorQA.map((qa, index) => (
                          <div key={index} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium capitalize",
                                qa.difficulty === "easy" ? "bg-green-100 text-green-700" :
                                qa.difficulty === "medium" ? "bg-yellow-100 text-yellow-700" :
                                "bg-red-100 text-red-700"
                              )}>
                                {qa.difficulty}
                              </span>
                              <span className="text-xs text-gray-500 capitalize">{qa.category}</span>
                            </div>
                            <h5 className="font-semibold text-gray-900 mb-2">{qa.question}</h5>
                            <p className="text-sm text-gray-600 mb-3">{qa.suggested_answer}</p>
                            <div className="flex flex-wrap gap-1">
                              {qa.key_points.map((point, pointIndex) => (
                                <span key={pointIndex} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                                  {point}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Export Module */}
            {currentModule === "export" && pitchDeckData && (
              <motion.div
                key="export"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-elegant p-8 border border-gray-200"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Download className="w-6 h-6 text-orange-500 mr-2" />
                  Export & Share
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-6 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <FileText className="w-8 h-8 text-orange-500" />
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Recommended</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">PowerPoint (PPTX)</h4>
                    <p className="text-sm text-gray-600 mb-4">Professional presentation format with all slides and design</p>
                    <button
                      onClick={exportToPPTX}
                      className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      Download PPTX
                    </button>
                  </div>

                  <div className="p-6 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <Video className="w-8 h-8 text-blue-500" />
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Coming Soon</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Video Presentation</h4>
                    <p className="text-sm text-gray-600 mb-4">Animated video with voiceover narration</p>
                    <button
                      disabled
                      className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                    >
                      Generate Video
                    </button>
                  </div>

                  <div className="p-6 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <Image className="w-8 h-8 text-purple-500" />
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Available</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Image Slides</h4>
                    <p className="text-sm text-gray-600 mb-4">High-resolution PNG images of each slide</p>
                    <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                      Download Images
                    </button>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Sharing Options</h4>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                      Share Link
                    </button>
                    <button className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                      Email Investors
                    </button>
                    <button className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                      Generate QR Code
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
            
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default PitchDeck;
