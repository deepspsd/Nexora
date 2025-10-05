
import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronDown, Moon, Sun, Search, Bell, User as UserIcon, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import NotificationCenter from "./NotificationCenter";

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  const { theme, toggleTheme, searchQuery, setSearchQuery } = useStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem("userId");
    setIsLoggedIn(!!userId);
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => {
      const newState = !prev;
      // Prevent background scrolling when menu is open
      document.body.style.overflow = newState ? 'hidden' : '';
      return newState;
    });
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    document.body.style.overflow = '';
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    closeMenu();
  }, [closeMenu]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isMenuOpen, closeMenu]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-2 sm:py-3 md:py-4 transition-all duration-300",
        isScrolled 
          ? "bg-white/95 dark:bg-gray-900 backdrop-blur-md shadow-sm dark:shadow-gray-800/20" 
          : "bg-gradient-to-b from-black/30 to-transparent backdrop-blur-sm"
      )}
    >
      <div className="container flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <a 
          href="#" 
          className="flex items-center space-x-2 group"
          onClick={(e) => {
            e.preventDefault();
            scrollToTop();
          }}
          aria-label="NEXORA"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2"
          >
            <Sparkles className={cn(
              "w-6 h-6 transition-colors",
              isScrolled ? "text-orange-500 dark:text-white" : "text-orange-500 dark:text-white"
            )} />
            <span className={cn(
              "text-2xl font-bold transition-colors",
              isScrolled ? "text-orange-500 dark:text-white" : "text-orange-500 dark:text-white drop-shadow-lg"
            )}>NEXORA</span>
          </motion.div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
          <a 
            href="#" 
            className={cn(
              "font-medium transition-colors",
              isScrolled ? "text-orange-500 dark:text-white hover:text-orange-600 dark:hover:text-gray-300" : "text-orange-500 dark:text-white hover:text-orange-600 dark:hover:text-gray-300"
            )}
            onClick={(e) => {
              e.preventDefault();
              scrollToTop();
            }}
            aria-label="Go to homepage"
          >
            Home
          </a>
          <a 
            href="#features" 
            className={cn(
              "font-medium transition-colors",
              isScrolled ? "text-orange-500 dark:text-white hover:text-orange-600 dark:hover:text-gray-300" : "text-orange-500 dark:text-white hover:text-orange-600 dark:hover:text-gray-300"
            )}
            onClick={(e) => {
              e.preventDefault();
              const featuresSection = document.getElementById('features');
              if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            aria-label="View features section"
          >
            Features
          </a>
          <a 
            href="#newsletter" 
            className={cn(
              "font-medium transition-colors",
              isScrolled ? "text-orange-500 dark:text-white hover:text-orange-600 dark:hover:text-gray-300" : "text-orange-500 dark:text-white hover:text-orange-600 dark:hover:text-gray-300"
            )}
            onClick={(e) => {
              e.preventDefault();
              const newsletterSection = document.getElementById('newsletter');
              if (newsletterSection) {
                newsletterSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            aria-label="View newsletter section"
          >
            Newsletter
          </a>
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSearch(!showSearch)}
              className={cn(
                "p-2 rounded-full transition-colors",
                isScrolled ? "hover:bg-orange-50 dark:hover:bg-gray-800 text-orange-500 dark:text-white" : "hover:bg-orange-50 dark:hover:bg-gray-800 text-orange-500 dark:text-white"
              )}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-full transition-colors",
                isScrolled ? "hover:bg-orange-50 dark:hover:bg-gray-800 text-orange-500 dark:text-white" : "hover:bg-orange-50 dark:hover:bg-gray-800 text-orange-500 dark:text-white"
              )}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            {isLoggedIn ? (
              <>
                {/* Notifications */}
                <NotificationCenter />

                {/* User Menu */}
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/dashboard")}
                  className={cn(
                    "px-6 py-2 rounded-full font-medium hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center space-x-2",
                    isScrolled 
                      ? "bg-gradient-to-r from-pulse-500 to-pulse-600 text-white focus:ring-pulse-500" 
                      : "bg-white text-pulse-600 focus:ring-white"
                  )}
                  aria-label="Go to dashboard"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Dashboard</span>
                </motion.button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/login")}
                  className={cn(
                    "px-6 py-2 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg",
                    isScrolled ? "text-orange-500 dark:text-white hover:text-orange-600 dark:hover:text-gray-300" : "text-orange-500 dark:text-white hover:text-orange-600 dark:hover:text-gray-300"
                  )}
                  aria-label="Sign in to your account"
                >
                  Login
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(249, 115, 22, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/register")}
                  className="px-6 py-2 bg-gradient-to-r from-pulse-500 to-pulse-600 text-white rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:ring-offset-2"
                  aria-label="Create a new account"
                >
                  Get Started
                </motion.button>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile menu button - increased touch target */}
        <button 
          className={cn(
            "md:hidden p-3 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg transition-colors",
            isScrolled ? "text-orange-500 dark:text-white" : "text-orange-500 dark:text-white"
          )}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation - improved for better touch experience */}
      <div 
        id="mobile-menu"
        className={cn(
          "fixed inset-0 z-40 bg-white flex flex-col pt-16 px-6 md:hidden transition-all duration-300 ease-in-out",
          isMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
        )}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <nav className="flex flex-col space-y-8 items-center mt-8">
          <a 
            href="#" 
            className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:ring-offset-2 transition-colors" 
            onClick={(e) => {
              e.preventDefault();
              scrollToTop();
            }}
            aria-label="Go to homepage"
          >
            Home
          </a>
          <a 
            href="#features" 
            className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:ring-offset-2 transition-colors" 
            onClick={(e) => {
              e.preventDefault();
              const featuresSection = document.getElementById('features');
              if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
              }
              closeMenu();
            }}
            aria-label="View features section"
          >
            Features
          </a>
          <a 
            href="#newsletter" 
            className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:ring-offset-2 transition-colors" 
            onClick={(e) => {
              e.preventDefault();
              const newsletterSection = document.getElementById('newsletter');
              if (newsletterSection) {
                newsletterSection.scrollIntoView({ behavior: 'smooth' });
              }
              closeMenu();
            }}
            aria-label="View newsletter section"
          >
            Newsletter
          </a>
          {isLoggedIn ? (
            <button 
              onClick={() => {
                navigate("/dashboard");
                closeMenu();
              }}
              className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg bg-gradient-to-r from-pulse-500 to-pulse-600 text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:ring-offset-2 transition-all"
              aria-label="Go to dashboard"
            >
              Dashboard
            </button>
          ) : (
            <>
              <button 
                onClick={() => {
                  navigate("/login");
                  closeMenu();
                }}
                className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg border-2 border-pulse-600 text-pulse-600 hover:bg-pulse-50 focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:ring-offset-2 transition-all"
                aria-label="Sign in to your account"
              >
                Login
              </button>
              <button 
                onClick={() => {
                  navigate("/register");
                  closeMenu();
                }}
                className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg bg-gradient-to-r from-pulse-500 to-pulse-600 text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:ring-offset-2 transition-all"
                aria-label="Create a new account"
              >
                Sign Up
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
            onClick={() => setShowSearch(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search pages, features, documentation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
                    autoFocus
                  />
                  <button
                    onClick={() => setShowSearch(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Quick Links</div>
                <div className="space-y-1">
                  {[
                    { name: 'Dashboard', path: '/dashboard' },
                    { name: 'Idea Validation', path: '/idea-validation' },
                    { name: 'Market Research', path: '/research' },
                    { name: 'Business Plan', path: '/business-plan' },
                    { name: 'MVP Development', path: '/mvp-development' },
                    { name: 'Pricing', path: '/pricing' },
                  ].map((link) => (
                    <button
                      key={link.path}
                      onClick={() => {
                        navigate(link.path);
                        setShowSearch(false);
                      }}
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      {link.name}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
