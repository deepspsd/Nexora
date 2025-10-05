
import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface TestimonialProps {
  content: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  gradient: string;
  backgroundImage?: string;
}

const testimonials: TestimonialProps[] = [{
  content: "NEXORA helped us launch our SaaS product in just 3 weeks. From market research to MVP to pitch deck - everything was automated. We secured seed funding within a month.",
  author: "Sarah Chen",
  role: "Founder",
  company: "CloudSync Technologies",
  avatar: "SC",
  rating: 5,
  gradient: "from-blue-700 via-indigo-800 to-purple-900",
  backgroundImage: "/background-section1.png"
}, {
  content: "I had an idea but no technical skills. NEXORA generated the entire MVP, business plan, and marketing strategy. Now we have 10K users and growing fast.",
  author: "Michael Rodriguez",
  role: "CEO",
  company: "FitTrack App",
  avatar: "MR",
  rating: 5,
  gradient: "from-indigo-900 via-purple-800 to-orange-500",
  backgroundImage: "/background-section2.png"
}, {
  content: "The AI-powered market research saved us months of work. NEXORA identified gaps we never considered and helped us pivot to a winning strategy.",
  author: "Dr. Amara Patel",
  role: "Co-founder",
  company: "HealthAI Solutions",
  avatar: "AP",
  rating: 5,
  gradient: "from-purple-800 via-pink-700 to-red-500",
  backgroundImage: "/background-section3.png"
}, {
  content: "As a solo entrepreneur, NEXORA was like having an entire team. It handled everything from branding to deployment while I focused on vision and customers.",
  author: "Jason Lee",
  role: "Founder",
  company: "EduLearn Platform",
  avatar: "JL",
  rating: 5,
  gradient: "from-orange-600 via-red-500 to-purple-600",
  backgroundImage: "/background-section1.png"
}, {
  content: "The speed and quality of startup generation is incredible. What used to take months now takes hours. NEXORA is a game-changer for entrepreneurs.",
  author: "Lisa Wang",
  role: "Founder",
  company: "GreenTech Innovations",
  avatar: "LW",
  rating: 5,
  gradient: "from-green-600 via-emerald-500 to-teal-600",
  backgroundImage: "/background-section2.png"
}, {
  content: "From zero to funded startup in 2 weeks. The AI-generated pitch deck was so professional that investors were impressed from day one.",
  author: "David Kim",
  role: "CEO",
  company: "DataFlow Systems",
  avatar: "DK",
  rating: 5,
  gradient: "from-cyan-600 via-blue-500 to-indigo-600",
  backgroundImage: "/background-section3.png"
}];

const TestimonialCard = ({
  content,
  author,
  role,
  company,
  avatar,
  rating,
  gradient
}: TestimonialProps) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden group"
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
      
      <div className="relative p-6">
        {/* Quote Icon */}
        <div className="absolute top-4 right-4 opacity-20">
          <Quote className="w-6 h-6 text-pulse-500" />
        </div>

        {/* Rating */}
        <div className="flex items-center mb-4">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
          ))}
        </div>

        {/* Content */}
        <blockquote className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-5 font-medium">
          "{content}"
        </blockquote>

        {/* Author Info */}
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-pulse-500 to-pulse-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
            {avatar}
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{author}</h4>
            <p className="text-gray-600 dark:text-gray-400 text-xs">
              {role}, {company}
            </p>
          </div>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-pulse-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
};

const Testimonials = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900 relative" id="testimonials" ref={sectionRef}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="pulse-chip mx-auto mb-4">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pulse-500 text-white mr-2">04</span>
            <span>Testimonials</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-3 text-gray-900 dark:text-white">
            Success Stories
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Join thousands of entrepreneurs who've transformed their ideas into successful startups with NEXORA
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <TestimonialCard {...testimonial} />
            </motion.div>
          ))}
        </div>

        {/* Overall Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-full px-5 py-2.5 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="text-gray-900 dark:text-white font-semibold text-sm">4.9/5</span>
            <span className="text-gray-600 dark:text-gray-400 text-sm">from 1,200+ reviews</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
