import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Lightbulb, 
  TrendingUp, 
  FileText, 
  Rocket, 
  Users, 
  ArrowRight,
  Sparkles,
  DollarSign,
  User
} from "lucide-react";
import OnboardingTour from "@/components/OnboardingTour";
import Navbar from "@/components/Navbar";
import { useStore } from "@/store/useStore";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [userCredits, setUserCredits] = useState(20);
  const { hasCompletedOnboarding } = useStore();

  useEffect(() => {
    // Set user info from localStorage
    const storedName = localStorage.getItem("userName");
    const storedCredits = localStorage.getItem("userCredits");
    
    console.log("Dashboard loading - localStorage data:", {
      storedName,
      storedCredits,
      userId: localStorage.getItem("userId"),
      authToken: localStorage.getItem("authToken")
    });
    
    if (storedName) setUserName(storedName);
    if (storedCredits) setUserCredits(parseInt(storedCredits));
  }, []);

  // Dashboard cards data
  const dashboardCards = [
    {
      title: "Idea Validation",
      description: "Validate your startup ideas with AI-powered market analysis",
      icon: Lightbulb,
      path: "/idea-validation",
      gradient: "from-blue-500 to-purple-600",
      stats: "3 ideas validated"
    },
    {
      title: "Business Plan",
      description: "Generate detailed business plans with financial projections", 
      icon: FileText,
      path: "/business-plan",
      gradient: "from-purple-500 to-pink-600",
      stats: "1 plan created"
    },
    {
      title: "MVP Development",
      description: "Build your minimum viable product with AI assistance",
      icon: Rocket,
      path: "/mvp-development", 
      gradient: "from-orange-500 to-red-600",
      stats: "Ready to start"
    },
    {
      title: "Marketing Strategy",
      description: "Create comprehensive marketing plans and growth strategies",
      icon: TrendingUp,
      path: "/marketing",
      gradient: "from-green-500 to-teal-600",
      stats: "Ready to launch"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
          >
            Welcome back, {userName}! 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 dark:text-gray-400"
          >
            Ready to build your next startup? Choose a tool below to get started.
          </motion.p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => navigate(card.path)}
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer group overflow-hidden"
                data-tour={card.path.substring(1)}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${card.gradient} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                    {card.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {card.stats}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-pulse-500 transition-colors" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Start Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-pulse-500 to-pulse-600 rounded-2xl p-8 text-white"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <Sparkles className="w-6 h-6 mr-2" />
                Start Your Journey
              </h2>
              <p className="text-white/90">
                Transform your idea into a complete startup in minutes
              </p>
            </div>
            <button
              onClick={() => navigate("/idea-validation")}
              className="px-6 py-3 bg-white text-pulse-600 rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              Validate Your Idea
            </button>
          </div>
        </motion.div>
      </main>
      
      {/* Onboarding Tour - Only show if not completed */}
    </div>
  );
};

export default Dashboard;