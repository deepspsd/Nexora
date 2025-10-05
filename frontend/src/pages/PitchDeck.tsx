import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Video
} from "lucide-react";

const PitchDeck = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    companyName: "",
    problemStatement: "",
    solution: "",
    teamDetails: [] as { name: string; role: string; bio: string }[],
    marketData: {} as any,
    logo: "",
    stylePreference: "modern",
    brandColors: [] as string[],
    numSlides: 10
  });
  const [teamMemberInput, setTeamMemberInput] = useState({ name: "", role: "", bio: "" });
  const [colorInput, setColorInput] = useState("#3B82F6");
  const [isGenerating, setIsGenerating] = useState(false);
  const [pitchDeck, setPitchDeck] = useState<any>(null);
  const [userCredits, setUserCredits] = useState(20);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    const credits = localStorage.getItem('userCredits');
    if (credits) {
      setUserCredits(parseInt(credits));
    }

    // Pre-fill from previous steps if available
    if (location.state?.marketData) {
      setFormData(prev => ({ ...prev, marketData: location.state.marketData }));
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userCredits < 3) {
      alert('Insufficient credits. You need at least 3 credits to generate a pitch deck.');
      return;
    }

    if (!formData.companyName || !formData.problemStatement || !formData.solution) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('http://localhost:8000/api/pitch-deck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          companyName: formData.companyName,
          problemStatement: formData.problemStatement,
          solution: formData.solution,
          teamDetails: formData.teamDetails,
          marketData: formData.marketData,
          logo: formData.logo,
          stylePreference: formData.stylePreference,
          brandColors: formData.brandColors,
          numSlides: formData.numSlides,
          userId: localStorage.getItem('userId')
        }),
      });

      const data = await response.json();
      setPitchDeck(data.data);
      
      // Update credits
      const newCredits = userCredits - 3;
      setUserCredits(newCredits);
      localStorage.setItem('userCredits', newCredits.toString());
      
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating pitch deck:', error);
      alert('Error generating pitch deck. Please try again.');
      setIsGenerating(false);
    }
  };

  const addTeamMember = () => {
    if (teamMemberInput.name && teamMemberInput.role && formData.teamDetails.length < 6) {
      setFormData(prev => ({
        ...prev,
        teamDetails: [...prev.teamDetails, { ...teamMemberInput }]
      }));
      setTeamMemberInput({ name: '', role: '', bio: '' });
    }
  };

  const removeTeamMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      teamDetails: prev.teamDetails.filter((_, i) => i !== index)
    }));
  };

  const addBrandColor = () => {
    if (colorInput && formData.brandColors.length < 5) {
      setFormData(prev => ({
        ...prev,
        brandColors: [...prev.brandColors, colorInput]
      }));
      setColorInput('#3B82F6');
    }
  };

  const removeBrandColor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      brandColors: prev.brandColors.filter((_, i) => i !== index)
    }));
  };

  const nextSlide = () => {
    if (pitchDeck?.slides && currentSlide < pitchDeck.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const exportAsPDF = () => {
    console.log('Exporting as PDF...');
  };

  const exportAsPPTX = () => {
    console.log('Exporting as PPTX...');
  };

  const startPresentation = () => {
    setIsPresenting(true);
    setCurrentSlide(0);
  };

  const mockSlides = [
    {
      title: formData.companyName || 'Your Company',
      subtitle: 'Revolutionizing the Future',
      type: 'title',
      content: 'Welcome to our pitch presentation'
    },
    {
      title: 'Problem',
      type: 'content',
      content: formData.problemStatement || 'The problem we are solving...'
    },
    {
      title: 'Solution',
      type: 'content', 
      content: formData.solution || 'Our innovative solution...'
    },
    {
      title: 'Market Opportunity',
      type: 'chart',
      content: 'TAM: $100B, SAM: $10B, SOM: $1B'
    },
    {
      title: 'Team',
      type: 'team',
      content: formData.teamDetails.length > 0 ? formData.teamDetails : [{ name: 'Founder', role: 'CEO', bio: 'Experienced leader' }]
    }
  ];

  const slides = [
    { title: "Problem", icon: "🎯" },
    { title: "Solution", icon: "💡" },
    { title: "Market Size", icon: "📊" },
    { title: "Business Model", icon: "💰" },
    { title: "Traction", icon: "📈" },
    { title: "Team", icon: "👥" },
    { title: "Financials", icon: "💵" },
    { title: "Ask", icon: "🚀" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
              <h1 className="text-xl font-bold text-gray-900">Pitch Deck Generator</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Credits:</span>
            <span className="text-lg font-bold text-orange-600">{userCredits}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 mb-4">
              <Presentation className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Create Your <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Pitch Deck</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              AI-powered pitch decks with custom branding, team profiles, and export options
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: Sparkles, text: "AI-Powered" },
              { icon: Palette, text: "Custom Branding" },
              { icon: Users, text: "Team Profiles" },
              { icon: Download, text: "Export Options" }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center space-x-3 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                <feature.icon className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white rounded-2xl shadow-elegant p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Company Information</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Your Company Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Problem Statement <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.problemStatement}
                    onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="What problem are you solving?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solution <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.solution}
                    onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="How does your product solve this problem?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Members
                  </label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={teamMemberInput.name}
                        onChange={(e) => setTeamMemberInput({ ...teamMemberInput, name: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        value={teamMemberInput.role}
                        onChange={(e) => setTeamMemberInput({ ...teamMemberInput, role: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Role"
                      />
                      <button
                        type="button"
                        onClick={addTeamMember}
                        className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={teamMemberInput.bio}
                      onChange={(e) => setTeamMemberInput({ ...teamMemberInput, bio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Brief bio (optional)"
                    />
                    <div className="flex flex-wrap gap-2">
                      {formData.teamDetails.map((member, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 bg-orange-50 rounded-full text-sm text-orange-700">
                          {member.name} - {member.role}
                          <button
                            type="button"
                            onClick={() => removeTeamMember(index)}
                            className="ml-2 text-orange-500 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Colors
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="color"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={addBrandColor}
                      className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
                    >
                      Add Color
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.brandColors.map((color, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: color }}></div>
                        <button
                          type="button"
                          onClick={() => removeBrandColor(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Style Preference
                  </label>
                  <select
                    value={formData.stylePreference}
                    onChange={(e) => setFormData({ ...formData, stylePreference: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="modern">Modern & Clean</option>
                    <option value="corporate">Corporate & Professional</option>
                    <option value="creative">Creative & Bold</option>
                    <option value="minimal">Minimal & Simple</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Slides
                  </label>
                  <select
                    value={formData.numSlides}
                    onChange={(e) => setFormData({ ...formData, numSlides: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value={8}>8 Slides (Essential)</option>
                    <option value={10}>10 Slides (Standard)</option>
                    <option value={12}>12 Slides (Detailed)</option>
                    <option value={15}>15 Slides (Comprehensive)</option>
                  </select>
                </div>

                <button
                  type="submit"
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
                      <span>Generating Pitch Deck...</span>
                    </>
                  ) : (
                    <>
                      <Presentation className="w-5 h-5" />
                      <span>Generate Pitch Deck (3 Credits)</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Preview/Results */}
            <div className="bg-white rounded-2xl shadow-elegant p-8 border border-gray-200">
              {!pitchDeck ? (
                <div className="text-center py-12">
                  <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-orange-100 to-red-100 mb-4">
                    <Presentation className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Preview Your Pitch Deck</h3>
                  <p className="text-gray-600 mb-6">Fill out the form to generate your professional pitch deck</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {mockSlides.slice(0, 4).map((slide, index) => (
                      <div key={index} className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                        <div className="text-sm font-medium text-orange-700 mb-2">{slide.title}</div>
                        <div className="h-16 bg-white rounded border border-orange-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">Slide {index + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Your Pitch Deck</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={startPresentation}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>Present</span>
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setShowExportMenu(!showExportMenu)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Export</span>
                        </button>
                        {showExportMenu && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <button
                              onClick={exportAsPDF}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                            >
                              <FileText className="w-4 h-4" />
                              <span>Export as PDF</span>
                            </button>
                            <button
                              onClick={exportAsPPTX}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                            >
                              <Presentation className="w-4 h-4" />
                              <span>Export as PPTX</span>
                            </button>
                          </div>
                        )}
                      </div>
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
                      Slide {currentSlide + 1} of {mockSlides.length}
                    </span>
                    <button
                      onClick={nextSlide}
                      disabled={currentSlide === mockSlides.length - 1}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Current Slide */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-8 border border-orange-200 min-h-[300px]">
                    <div className="text-center">
                      <h4 className="text-2xl font-bold text-gray-900 mb-4">{mockSlides[currentSlide]?.title}</h4>
                      {mockSlides[currentSlide]?.subtitle && (
                        <p className="text-lg text-gray-600 mb-6">{mockSlides[currentSlide].subtitle}</p>
                      )}
                      <div className="text-gray-700">
                        {typeof mockSlides[currentSlide]?.content === 'string' ? (
                          <p>{mockSlides[currentSlide].content}</p>
                        ) : Array.isArray(mockSlides[currentSlide]?.content) ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(mockSlides[currentSlide].content as any[]).map((member: any, index: number) => (
                              <div key={index} className="bg-white rounded-lg p-4 text-left">
                                <h5 className="font-bold text-gray-900">{member.name}</h5>
                                <p className="text-orange-600 text-sm">{member.role}</p>
                                {member.bio && <p className="text-gray-600 text-sm mt-2">{member.bio}</p>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>{mockSlides[currentSlide]?.content}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Slide Thumbnails */}
                  <div className="flex space-x-2 mt-4 overflow-x-auto">
                    {mockSlides.map((slide, index) => (
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default PitchDeck;
