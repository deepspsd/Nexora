import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Lightbulb, 
  Rocket, 
  Users, 
  FileText,
  Sparkles,
  CheckCircle
} from "lucide-react";
import { useStore } from "@/store/useStore";

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  icon: React.ElementType;
  action?: {
    text: string;
    onClick: () => void;
  };
}

const OnboardingTour = () => {
  const { hasCompletedOnboarding, setHasCompletedOnboarding } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to NEXORA! 🎉',
      description: 'Let\'s take a quick tour to help you get started with building your startup using AI.',
      target: 'body',
      position: 'bottom',
      icon: Sparkles
    },
    {
      id: 'idea-validation',
      title: 'Validate Your Ideas',
      description: 'Start by validating your startup ideas. Our AI will analyze market potential, feasibility, and provide improvement suggestions.',
      target: '[data-tour="idea-validation"]',
      position: 'bottom',
      icon: Lightbulb,
      action: {
        text: 'Try Idea Validation',
        onClick: () => window.location.href = '/idea-validation'
      }
    },
    {
      id: 'mvp-development',
      title: 'Build Your MVP',
      description: 'Generate a complete MVP with our AI. Get working code, database schemas, and deployment instructions.',
      target: '[data-tour="mvp-development"]',
      position: 'bottom',
      icon: Rocket,
      action: {
        text: 'Create MVP',
        onClick: () => window.location.href = '/mvp-development'
      }
    },
    {
      id: 'business-plan',
      title: 'Generate Business Plans',
      description: 'Create comprehensive business plans with market analysis, financial projections, and growth strategies.',
      target: '[data-tour="business-plan"]',
      position: 'bottom',
      icon: FileText,
      action: {
        text: 'Generate Plan',
        onClick: () => window.location.href = '/business-plan'
      }
    },
    {
      id: 'collaboration',
      title: 'Team Collaboration',
      description: 'Invite team members and collaborate on your startup projects in real-time.',
      target: '[data-tour="team-collaboration"]',
      position: 'bottom',
      icon: Users,
      action: {
        text: 'Invite Team',
        onClick: () => window.location.href = '/team-collaboration'
      }
    },
    {
      id: 'complete',
      title: 'You\'re All Set! 🚀',
      description: 'You\'re ready to start building amazing startups with NEXORA. Need help? Check out our documentation or contact support.',
      target: 'body',
      position: 'bottom',
      icon: CheckCircle
    }
  ];

  useEffect(() => {
    // Show onboarding if user hasn't completed it
    if (!hasCompletedOnboarding) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000); // Delay to let the page load
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    setIsVisible(false);
    setHasCompletedOnboarding(true);
  };

  const completeTour = () => {
    setIsVisible(false);
    setHasCompletedOnboarding(true);
  };

  const getTargetElement = (target: string) => {
    if (target === 'body') return document.body;
    return document.querySelector(target);
  };

  const getTooltipPosition = (target: string, position: string) => {
    const element = getTargetElement(target);
    if (!element) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    switch (position) {
      case 'top':
        return {
          top: rect.top + scrollTop - 10,
          left: rect.left + scrollLeft + rect.width / 2,
          transform: 'translate(-50%, -100%)'
        };
      case 'bottom':
        return {
          top: rect.bottom + scrollTop + 10,
          left: rect.left + scrollLeft + rect.width / 2,
          transform: 'translate(-50%, 0)'
        };
      case 'left':
        return {
          top: rect.top + scrollTop + rect.height / 2,
          left: rect.left + scrollLeft - 10,
          transform: 'translate(-100%, -50%)'
        };
      case 'right':
        return {
          top: rect.top + scrollTop + rect.height / 2,
          left: rect.right + scrollLeft + 10,
          transform: 'translate(0, -50%)'
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
    }
  };

  const currentStepData = tourSteps[currentStep];
  const tooltipPosition = currentStepData ? getTooltipPosition(currentStepData.target, currentStepData.position) : {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  };

  if (!isVisible || hasCompletedOnboarding) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Spotlight effect */}
        {currentStepData.target !== 'body' && (
          <div 
            className="absolute pointer-events-none"
            style={{
              ...getTargetElement(currentStepData.target)?.getBoundingClientRect(),
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
              borderRadius: '8px'
            }}
          />
        )}

        {/* Tooltip */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm w-full mx-4"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: tooltipPosition.transform,
            zIndex: 60
          }}
        >
          {/* Close button */}
          <button
            onClick={skipTour}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>

          {/* Content */}
          <div className="pr-8">
            {/* Icon */}
            <div className="inline-flex p-3 bg-pulse-100 dark:bg-pulse-900/30 rounded-xl mb-4">
              <currentStepData.icon className="w-6 h-6 text-pulse-600 dark:text-pulse-400" />
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {currentStepData.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Action button */}
            {currentStepData.action && (
              <button
                onClick={currentStepData.action.onClick}
                className="w-full bg-pulse-500 hover:bg-pulse-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors mb-4"
              >
                {currentStepData.action.text}
              </button>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep 
                        ? 'bg-pulse-500' 
                        : index < currentStep 
                        ? 'bg-pulse-300' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <div className="flex space-x-2">
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                  </button>
                )}

                <button
                  onClick={nextStep}
                  className="flex items-center bg-pulse-500 hover:bg-pulse-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                  {currentStep < tourSteps.length - 1 && (
                    <ArrowRight className="w-4 h-4 ml-1" />
                  )}
                </button>
              </div>
            </div>

            {/* Skip option */}
            <div className="text-center mt-4">
              <button
                onClick={skipTour}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Skip tour
              </button>
            </div>
          </div>
        </motion.div>

        {/* Step counter */}
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-900 rounded-full px-3 py-1 shadow-lg border border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {currentStep + 1} of {tourSteps.length}
          </span>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default OnboardingTour;
