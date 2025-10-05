import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, Minus, MessageCircle, Zap, Shield, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "general" | "technical" | "pricing" | "support";
}

const FAQ = () => {
  const [activeItem, setActiveItem] = useState<string | null>("faq-1");
  const [activeCategory, setActiveCategory] = useState<string>("general");
  const sectionRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: "general", label: "General", icon: MessageCircle, color: "text-blue-600", bgColor: "bg-blue-100" },
    { id: "technical", label: "Technical", icon: Zap, color: "text-pulse-600", bgColor: "bg-pulse-100" },
    { id: "pricing", label: "Pricing", icon: Shield, color: "text-green-600", bgColor: "bg-green-100" },
    { id: "support", label: "Support", icon: Clock, color: "text-purple-600", bgColor: "bg-purple-100" }
  ];

  const faqs: FAQItem[] = [
    {
      id: "faq-1",
      category: "general",
      question: "What exactly does NEXORA do?",
      answer: "NEXORA is an AI-powered platform that automates the entire startup creation process. From validating your idea to generating market research, creating business plans, building MVPs, and preparing pitch decks - all in minutes, not months. Our AI agents work together to handle everything so you can focus on growing your business."
    },
    {
      id: "faq-2",
      category: "general",
      question: "Do I need technical skills to use NEXORA?",
      answer: "Absolutely not! NEXORA is designed for entrepreneurs of all backgrounds. Simply describe your idea in plain English, and our AI will handle all the technical complexity. No coding, no design skills, no business expertise required - just your vision."
    },
    {
      id: "faq-3",
      category: "general",
      question: "How long does it take to build a complete startup?",
      answer: "Most users get their complete startup package (research + business plan + MVP + pitch deck) within 15-30 minutes. Complex projects might take up to an hour. Compare that to traditional methods which take 3-6 months and cost $50,000+."
    },
    {
      id: "faq-4",
      category: "technical",
      question: "What technologies does NEXORA use for MVP development?",
      answer: "We use modern, industry-standard technologies including React, TypeScript, Node.js, Python, and cloud infrastructure. Our AI selects the best tech stack for your specific project requirements and generates production-ready code with proper architecture and best practices."
    },
    {
      id: "faq-5",
      category: "technical",
      question: "Can I customize the generated MVP?",
      answer: "Yes! Every generated MVP comes with full source code that you can modify, extend, or completely rebuild. We also provide detailed documentation and can generate additional features based on your feedback. You own 100% of the code."
    },
    {
      id: "faq-6",
      category: "technical",
      question: "How accurate is the market research?",
      answer: "Our AI agents analyze thousands of data points from multiple sources including competitor websites, market reports, social media trends, and patent databases. The research is typically 90%+ accurate and includes real-time data that's often more current than traditional market research firms."
    },
    {
      id: "faq-7",
      category: "pricing",
      question: "What's included in the free plan?",
      answer: "The free plan includes 1 complete startup generation per month, basic market research, simple MVP generation, and standard business plan templates. Perfect for testing the platform and small projects."
    },
    {
      id: "faq-8",
      category: "pricing",
      question: "How does the credit system work?",
      answer: "Each major action (MVP generation, market research, pitch deck creation) costs credits. Pro users get 50 credits/month, Enterprise gets unlimited. Credits roll over for up to 3 months, and you can purchase additional credits anytime."
    },
    {
      id: "faq-9",
      category: "pricing",
      question: "Is there a money-back guarantee?",
      answer: "Yes! We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied with the results, we'll refund your payment in full, no questions asked."
    },
    {
      id: "faq-10",
      category: "support",
      question: "What kind of support do you provide?",
      answer: "We provide 24/7 chat support, comprehensive documentation, video tutorials, and weekly live Q&A sessions. Enterprise customers get dedicated account managers and priority support with guaranteed response times."
    },
    {
      id: "faq-11",
      category: "support",
      question: "Can NEXORA help with fundraising?",
      answer: "Absolutely! We generate investor-ready pitch decks, financial projections, and business plans that have helped our users raise over $24M in funding. We also provide guidance on investor outreach and pitch presentation best practices."
    },
    {
      id: "faq-12",
      category: "support",
      question: "Do you offer team collaboration features?",
      answer: "Yes! Teams can collaborate on projects, share workspaces, assign tasks, and track progress together. We also provide role-based permissions and integration with popular tools like Slack, Notion, and GitHub."
    }
  ];

  const filteredFAQs = faqs.filter(faq => faq.category === activeCategory);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const toggleItem = (itemId: string) => {
    setActiveItem(activeItem === itemId ? null : itemId);
  };

  return (
    <section 
      ref={sectionRef}
      className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden"
      id="faq"
    >
      {/* Background Elements */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-pulse-100 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-100 rounded-full opacity-15 blur-3xl"></div>

      <div className="section-container relative z-10">
        <div className="text-center mb-8">
          <div className="pulse-chip mx-auto mb-4">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pulse-500 text-white mr-2">04</span>
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-3 text-gray-900 dark:text-white">
            Everything You Need to Know
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Get answers to the most common questions about NEXORA and how it can transform your startup journey
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setActiveItem(null);
                  }}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-full font-medium text-sm transition-all duration-300",
                    isActive
                      ? "bg-white dark:bg-gray-700 shadow-lg text-gray-900 dark:text-white scale-105"
                      : "bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Icon className={cn("w-4 h-4 mr-2", isActive ? category.color : "text-gray-500")} />
                  {category.label}
                </button>
              );
            })}
          </div>

          {/* FAQ Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredFAQs.map((faq, index) => {
              const isActive = activeItem === faq.id;
              
              return (
                <div
                  key={faq.id}
                  className={cn(
                    "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300",
                    isActive && "shadow-lg border-pulse-200 dark:border-pulse-400"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full p-4 text-left focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:ring-offset-2 rounded-xl dark:focus:ring-offset-gray-800"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white pr-4 leading-tight">
                        {faq.question}
                      </h3>
                      <div className={cn(
                        "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300",
                        isActive 
                          ? "bg-pulse-500 text-white rotate-180" 
                          : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                      )}>
                        {isActive ? (
                          <Minus className="w-4 h-4" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </button>
                  
                  <div className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isActive ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <div className="px-4 pb-4">
                      <div className="h-px bg-gray-200 dark:bg-gray-600 mb-3"></div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-8">
            <div className="bg-gradient-to-r from-pulse-500 to-pulse-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-3">Still have questions?</h3>
              <p className="text-white/90 text-sm mb-5 max-w-2xl mx-auto">
                Our team is here to help! Get in touch and we'll answer any questions about NEXORA and how it can help build your startup.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="px-5 py-2.5 bg-white text-pulse-600 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
                  Contact Support
                </button>
                <button className="px-5 py-2.5 border border-white/30 text-white rounded-full text-sm font-medium hover:bg-white/10 transition-colors">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
