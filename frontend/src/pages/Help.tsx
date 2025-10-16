import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  BookOpen, 
  HelpCircle, 
  Video, 
  FileText, 
  MessageSquare,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  Rocket,
  Users,
  Settings,
  CreditCard,
  Shield,
  Zap,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/Breadcrumbs";
import Footer from "@/components/Footer";

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const categories = [
    {
      icon: Rocket,
      title: "Getting Started",
      description: "Learn the basics of NEXORA",
      articles: [
        "Creating your first startup",
        "Understanding the dashboard",
        "Setting up your profile",
        "Quick start guide"
      ]
    },
    {
      icon: Lightbulb,
      title: "Idea Validation",
      description: "Validate and improve your ideas",
      articles: [
        "How idea validation works",
        "Understanding validation scores",
        "Improving your idea",
        "Export validation reports"
      ]
    },
    {
      icon: FileText,
      title: "Business Planning",
      description: "Generate comprehensive business plans",
      articles: [
        "Business plan components",
        "Customizing your plan",
        "Financial projections",
        "Export options"
      ]
    },
    {
      icon: Settings,
      title: "MVP Development",
      description: "Build your minimum viable product",
      articles: [
        "MVP generation process",
        "Code customization",
        "Preview and testing",
        "Deployment options"
      ]
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work with your team",
      articles: [
        "Inviting team members",
        "Managing permissions",
        "Collaborative editing",
        "Version control"
      ]
    },
    {
      icon: CreditCard,
      title: "Billing & Plans",
      description: "Manage your subscription",
      articles: [
        "Understanding pricing",
        "Upgrading your plan",
        "Managing billing",
        "Credit system"
      ]
    }
  ];

  const faqs = [
    {
      question: "How does NEXORA's AI work?",
      answer: "NEXORA uses advanced machine learning models trained on thousands of successful startups, market data, and business strategies. Our AI analyzes your input and generates comprehensive startup components including market research, business plans, and MVP code."
    },
    {
      question: "Can I customize the generated content?",
      answer: "Absolutely! All generated content is fully customizable. You can edit business plans, modify code, adjust market research findings, and tailor everything to your specific needs."
    },
    {
      question: "What file formats can I export?",
      answer: "You can export your work in multiple formats including PDF, DOCX, PPT for presentations, and ZIP files for code projects. We also support direct integration with popular development platforms."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we take security seriously. All data is encrypted in transit and at rest. We're SOC 2 compliant and follow industry best practices for data protection. Your ideas and business information are never shared with third parties."
    },
    {
      question: "Can I collaborate with my team?",
      answer: "Yes! NEXORA supports team collaboration. You can invite team members, assign roles and permissions, and work together on your startup projects in real-time."
    },
    {
      question: "What if I need help with my startup beyond the platform?",
      answer: "We offer various support options including documentation, video tutorials, community forums, and for enterprise customers, dedicated support and consulting services."
    },
    {
      question: "How accurate is the market research?",
      answer: "Our AI pulls from over 50 data sources including industry reports, market databases, and real-time web data. While highly accurate, we recommend validating critical insights with additional research for major business decisions."
    },
    {
      question: "Can I use NEXORA for any type of startup?",
      answer: "NEXORA works for most startup types including SaaS, e-commerce, mobile apps, service businesses, and more. Our AI adapts to different industries and business models."
    }
  ];

  const quickLinks = [
    { title: "Video Tutorials", icon: Video, href: "#tutorials" },
    { title: "API Documentation", icon: FileText, href: "#api" },
    { title: "Community Forum", icon: MessageSquare, href: "#community" },
    { title: "Contact Support", icon: HelpCircle, href: "/contact" }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <Breadcrumbs />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-white via-gray-50 to-pulse-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-pulse-100 dark:bg-pulse-900/30 text-pulse-600 dark:text-pulse-400 border border-pulse-200 dark:border-pulse-800 mb-6">
              <BookOpen className="w-4 h-4 mr-2" />
              <span>Help Center</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 bg-gradient-to-r from-gray-900 via-pulse-600 to-gray-900 dark:from-white dark:via-pulse-400 dark:to-white bg-clip-text text-transparent">
              How can we help you?
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8">
              Find answers, learn how to use NEXORA, and get the most out of our AI-powered platform.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for help articles, tutorials, or FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-pulse-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg"
              />
            </div>
          </motion.div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  onClick={() => link.href.startsWith('/') ? navigate(link.href) : null}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center group hover:shadow-xl transition-all duration-300"
                >
                  <div className="inline-flex p-3 bg-pulse-100 dark:bg-pulse-900/30 rounded-xl mb-4 group-hover:bg-pulse-200 dark:group-hover:bg-pulse-800/50 transition-colors">
                    <Icon className="w-6 h-6 text-pulse-600 dark:text-pulse-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {link.title}
                  </h3>
                  <ExternalLink className="w-4 h-4 text-gray-400 mx-auto" />
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-gray-900 dark:text-white">
              Browse by Category
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Find detailed guides and tutorials for every aspect of NEXORA
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 group hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    <div className="inline-flex p-3 bg-pulse-100 dark:bg-pulse-900/30 rounded-xl mr-4">
                      <Icon className="w-6 h-6 text-pulse-600 dark:text-pulse-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {category.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {category.articles.map((article, articleIndex) => (
                      <button
                        key={articleIndex}
                        className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                      >
                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                          {article}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-pulse-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Quick answers to common questions
            </p>
          </motion.div>

          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </button>
                
                <motion.div
                  initial={false}
                  animate={{ 
                    height: expandedFaq === index ? "auto" : 0,
                    opacity: expandedFaq === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {filteredFaqs.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try different keywords or browse our categories above
              </p>
              <button
                onClick={() => navigate("/contact")}
                className="bg-pulse-500 hover:bg-pulse-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
              >
                Contact Support
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Support CTA */}
      <section className="py-16 bg-gradient-to-r from-pulse-500 to-pulse-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">
              Still need help?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Our support team is here to help you succeed with NEXORA. Get personalized assistance for your startup journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/contact")}
                className="bg-white text-pulse-600 font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Contact Support
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-full text-lg hover:bg-white/20 transition-colors border border-white/20"
              >
                Schedule a Demo
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Help;
