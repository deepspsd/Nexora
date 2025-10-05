import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, Globe, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  const sections = [
    {
      title: "Information We Collect",
      icon: Database,
      content: [
        {
          subtitle: "Personal Information",
          text: "We collect information you provide directly to us, such as when you create an account, use our services, or contact us. This may include your name, email address, company information, and payment details."
        },
        {
          subtitle: "Usage Information",
          text: "We automatically collect information about how you use our services, including your IP address, browser type, device information, and usage patterns to improve our platform."
        },
        {
          subtitle: "Generated Content",
          text: "We store the startup ideas, business plans, and other content you create using our AI platform to provide our services and improve our algorithms."
        }
      ]
    },
    {
      title: "How We Use Your Information",
      icon: Eye,
      content: [
        {
          subtitle: "Service Provision",
          text: "We use your information to provide, maintain, and improve our AI-powered startup generation services, including personalizing your experience."
        },
        {
          subtitle: "Communication",
          text: "We may use your contact information to send you service-related notifications, updates, and marketing communications (which you can opt out of)."
        },
        {
          subtitle: "Analytics and Improvement",
          text: "We analyze usage patterns to improve our AI models, enhance user experience, and develop new features."
        }
      ]
    },
    {
      title: "Information Sharing",
      icon: Users,
      content: [
        {
          subtitle: "No Sale of Personal Data",
          text: "We do not sell, rent, or trade your personal information to third parties for their marketing purposes."
        },
        {
          subtitle: "Service Providers",
          text: "We may share information with trusted service providers who assist us in operating our platform, such as cloud hosting, payment processing, and analytics services."
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose information if required by law, regulation, or legal process, or to protect the rights, property, or safety of NEXORA, our users, or others."
        }
      ]
    },
    {
      title: "Data Security",
      icon: Lock,
      content: [
        {
          subtitle: "Encryption",
          text: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption to protect your information from unauthorized access."
        },
        {
          subtitle: "Access Controls",
          text: "We implement strict access controls and authentication measures to ensure only authorized personnel can access your data."
        },
        {
          subtitle: "Regular Audits",
          text: "We conduct regular security audits and assessments to identify and address potential vulnerabilities in our systems."
        }
      ]
    },
    {
      title: "Your Rights",
      icon: Shield,
      content: [
        {
          subtitle: "Access and Portability",
          text: "You have the right to access, update, or delete your personal information. You can also request a copy of your data in a portable format."
        },
        {
          subtitle: "Opt-Out",
          text: "You can opt out of marketing communications at any time by using the unsubscribe link in our emails or updating your account preferences."
        },
        {
          subtitle: "Data Deletion",
          text: "You can request deletion of your account and associated data at any time. Some information may be retained for legal or legitimate business purposes."
        }
      ]
    },
    {
      title: "International Transfers",
      icon: Globe,
      content: [
        {
          subtitle: "Global Operations",
          text: "NEXORA operates globally, and your information may be transferred to and processed in countries other than your own, including the United States."
        },
        {
          subtitle: "Adequate Protection",
          text: "We ensure that any international transfers of personal data are subject to appropriate safeguards, such as standard contractual clauses or adequacy decisions."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-white via-gray-50 to-pulse-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-pulse-100 dark:bg-pulse-900/30 text-pulse-600 dark:text-pulse-400 border border-pulse-200 dark:border-pulse-800 mb-6">
              <Shield className="w-4 h-4 mr-2" />
              <span>Privacy Policy</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 bg-gradient-to-r from-gray-900 via-pulse-600 to-gray-900 dark:from-white dark:via-pulse-400 dark:to-white bg-clip-text text-transparent">
              Your Privacy Matters
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              We're committed to protecting your privacy and being transparent about how we collect, use, and protect your information.
            </p>
            
            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
              Last updated: January 1, 2025
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="flex items-center mb-8">
                    <div className="inline-flex p-3 bg-pulse-100 dark:bg-pulse-900/30 rounded-xl mr-4">
                      <Icon className="w-6 h-6 text-pulse-600 dark:text-pulse-400" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white">
                      {section.title}
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          {item.subtitle}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-r from-pulse-500 to-pulse-600 rounded-2xl p-8 text-center text-white"
          >
            <h2 className="text-2xl font-bold mb-4">Questions About Your Privacy?</h2>
            <p className="text-lg mb-6 opacity-90">
              If you have any questions about this Privacy Policy or how we handle your data, we're here to help.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center bg-white text-pulse-600 font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition-colors"
            >
              Contact Our Privacy Team
            </a>
          </motion.div>

          {/* Additional Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 space-y-8"
          >
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                Children's Privacy
              </h3>
              <p className="text-blue-800 dark:text-blue-200">
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
                Changes to This Policy
              </h3>
              <p className="text-green-800 dark:text-green-200">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">
                California Privacy Rights
              </h3>
              <p className="text-purple-800 dark:text-purple-200">
                California residents have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information is collected and the right to delete personal information.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy;
