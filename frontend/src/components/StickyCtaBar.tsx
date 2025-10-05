import React, { useState, useEffect } from "react";
import { ArrowRight, X, Rocket, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const StickyCtaBar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Show after scrolling 50% of viewport height
      if (scrollPosition > windowHeight * 0.5 && !isDismissed) {
        setIsVisible(true);
      } else if (scrollPosition <= windowHeight * 0.3) {
        setIsVisible(false);
      }
    };

    // Check if user is logged in
    const userId = localStorage.getItem("userId");
    if (userId) {
      return; // Don't show CTA bar for logged-in users
    }

    // Check if previously dismissed
    const dismissed = localStorage.getItem("stickyCtaDismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (now - dismissedTime < oneDay) {
        setIsDismissed(true);
        return;
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    localStorage.setItem("stickyCtaDismissed", Date.now().toString());
  };

  const handleGetStarted = () => {
    navigate("/register");
  };

  const handleViewDemo = () => {
    const demoSection = document.getElementById("demo");
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!isVisible || isDismissed) return null;

  return (
    <>
      {/* Mobile Version */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-pulse-500 to-pulse-600 text-white p-4 shadow-2xl transform transition-transform duration-500 ease-out">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <Rocket className="w-4 h-4 mr-2" />
              <span className="font-semibold text-sm">Start Building Today</span>
            </div>
            <p className="text-xs text-white/90">Join 12,847+ entrepreneurs</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleGetStarted}
              className="bg-white text-pulse-600 px-4 py-2 rounded-full font-medium text-sm hover:bg-gray-100 transition-colors flex items-center"
            >
              Get Started
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
            
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Version */}
      <div className="hidden md:block fixed bottom-6 left-6 right-6 z-40 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 transform transition-all duration-500 ease-out hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Main Message */}
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-pulse-100 rounded-full flex items-center justify-center mr-3">
                    <Rocket className="w-4 h-4 text-pulse-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Ready to Build Your Startup?</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Join thousands of successful entrepreneurs using NEXORA to turn ideas into reality
                </p>
              </div>

              {/* Stats */}
              <div className="hidden lg:flex items-center space-x-6 text-center">
                <div>
                  <div className="flex items-center text-pulse-600 mb-1">
                    <Zap className="w-4 h-4 mr-1" />
                    <span className="font-bold text-lg">3min</span>
                  </div>
                  <p className="text-xs text-gray-500">Average MVP time</p>
                </div>
                
                <div className="w-px h-12 bg-gray-200"></div>
                
                <div>
                  <div className="flex items-center text-green-600 mb-1">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="font-bold text-lg">$24M+</span>
                  </div>
                  <p className="text-xs text-gray-500">Funding raised</p>
                </div>
                
                <div className="w-px h-12 bg-gray-200"></div>
                
                <div>
                  <div className="text-blue-600 mb-1">
                    <span className="font-bold text-lg">12,847+</span>
                  </div>
                  <p className="text-xs text-gray-500">Active users</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleViewDemo}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Watch Demo
              </button>
              
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-pulse-500 to-pulse-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
              
              <button
                onClick={handleDismiss}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className="flex items-center text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span>🔥 23 people signed up in the last hour</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StickyCtaBar;
