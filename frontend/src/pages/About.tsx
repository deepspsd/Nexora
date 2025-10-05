import React from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Users, 
  Target, 
  Zap, 
  Heart, 
  Globe, 
  Award,
  Linkedin,
  Twitter,
  Github,
  Mail,
  Sparkles,
  Rocket,
  Brain,
  Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  const navigate = useNavigate();

  const team = [
    {
      name: "Deepak Prasad",
      role: "CEO & Founder",
      bio: "Student at SVCE-Bengaluru",
      avatar: "DP",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "deepak@nexora.ai"
      }
    },
    {
      name: "Sarah Kim",
      role: "CTO & Co-founder",
      bio: "Ex-Microsoft engineer who led AI product development for enterprise solutions.",
      avatar: "SK",
      social: {
        linkedin: "#",
        github: "#",
        email: "sarah@nexora.ai"
      }
    },
    {
      name: "Marcus Chen",
      role: "Head of AI",
      bio: "PhD in Computer Science from Stanford, specialized in natural language processing.",
      avatar: "MC",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "marcus@nexora.ai"
      }
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Product",
      bio: "Former Y Combinator partner with expertise in startup growth and product strategy.",
      avatar: "ER",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "emily@nexora.ai"
      }
    }
  ];

  const values = [
    {
      icon: Rocket,
      title: "Innovation First",
      description: "We push the boundaries of what's possible with AI to create breakthrough solutions for entrepreneurs."
    },
    {
      icon: Heart,
      title: "Entrepreneur-Centric",
      description: "Every feature we build is designed with the entrepreneur's journey and success in mind."
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description: "We maintain the highest standards of data security and privacy protection for our users."
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "Our mission is to democratize entrepreneurship and make startup creation accessible worldwide."
    }
  ];

  const stats = [
    { number: "12K+", label: "Startups Created" },
    { number: "94%", label: "Success Rate" },
    { number: "50+", label: "Countries" },
    { number: "$24M+", label: "Funding Raised" }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-white via-gray-50 to-pulse-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-pulse-100 dark:bg-pulse-900/30 text-pulse-600 dark:text-pulse-400 border border-pulse-200 dark:border-pulse-800 mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              <span>About NEXORA</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 bg-gradient-to-r from-gray-900 via-pulse-600 to-gray-900 dark:from-white dark:via-pulse-400 dark:to-white bg-clip-text text-transparent">
              Empowering the Next Generation of Entrepreneurs
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to democratize entrepreneurship by making startup creation accessible, 
              fast, and intelligent through the power of AI.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-pulse-600 dark:text-pulse-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-gray-900 dark:text-white">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                We believe that great ideas shouldn't be limited by technical barriers, funding constraints, 
                or lack of business expertise. NEXORA was born from the vision of making entrepreneurship 
                accessible to everyone, regardless of their background.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                By leveraging cutting-edge AI technology, we've created a platform that can transform 
                any idea into a complete startup ecosystem - from market research and business planning 
                to MVP development and investor presentations.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-pulse-500 to-purple-600 rounded-3xl p-8 text-white">
                <Brain className="w-16 h-16 mb-6" />
                <h3 className="text-2xl font-bold mb-4">AI-Powered Innovation</h3>
                <p className="text-lg opacity-90">
                  Our advanced AI models have been trained on thousands of successful startups, 
                  market trends, and business strategies to provide you with the most accurate 
                  and actionable insights.
                </p>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-pulse-500/20 to-purple-600/20 rounded-3xl blur-xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-gray-900 dark:text-white">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex p-4 bg-pulse-100 dark:bg-pulse-900/30 rounded-2xl mb-4">
                    <Icon className="w-8 h-8 text-pulse-600 dark:text-pulse-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-gray-900 dark:text-white">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              The brilliant minds behind NEXORA's AI-powered platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center group hover:shadow-xl transition-all duration-300"
              >
                {/* Avatar */}
                <div className="w-20 h-20 bg-gradient-to-br from-pulse-500 to-pulse-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {member.avatar}
                </div>

                <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">
                  {member.name}
                </h3>
                <p className="text-pulse-600 dark:text-pulse-400 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                  {member.bio}
                </p>

                {/* Social Links */}
                <div className="flex justify-center space-x-3">
                  {member.social.linkedin && (
                    <a href={member.social.linkedin} className="text-gray-400 hover:text-blue-600 transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {member.social.twitter && (
                    <a href={member.social.twitter} className="text-gray-400 hover:text-blue-400 transition-colors">
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {member.social.github && (
                    <a href={member.social.github} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  <a href={`mailto:${member.social.email}`} className="text-gray-400 hover:text-pulse-600 transition-colors">
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-pulse-500 to-pulse-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">
              Ready to Build Your Startup?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of entrepreneurs who've transformed their ideas into successful businesses with NEXORA.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/register")}
              className="bg-white text-pulse-600 font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Get Started Today
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
