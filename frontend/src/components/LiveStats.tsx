import React, { useState, useEffect, useRef } from "react";
import { TrendingUp, Users, Rocket, DollarSign, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatItem {
  id: string;
  label: string;
  value: number;
  target: number;
  prefix?: string;
  suffix?: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const LiveStats = () => {
  const [stats, setStats] = useState<StatItem[]>([
    {
      id: "users",
      label: "Active Users",
      value: 0,
      target: 12847,
      suffix: "+",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      id: "mvps",
      label: "MVPs Generated",
      value: 0,
      target: 3421,
      icon: Rocket,
      color: "text-pulse-600",
      bgColor: "bg-pulse-100"
    },
    {
      id: "funding",
      label: "Funding Raised",
      value: 0,
      target: 24.7,
      prefix: "$",
      suffix: "M",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      id: "time",
      label: "Hours Saved",
      value: 0,
      target: 156789,
      suffix: "+",
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      id: "success",
      label: "Success Rate",
      value: 0,
      target: 94.2,
      suffix: "%",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100"
    },
    {
      id: "rating",
      label: "User Rating",
      value: 0,
      target: 4.9,
      suffix: "/5",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    }
  ]);

  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for triggering animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            entry.target.classList.add("animate-fade-in");
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [isVisible]);

  // Animate counters when visible
  useEffect(() => {
    if (!isVisible) return;

    const animateCounters = () => {
      stats.forEach((stat, index) => {
        let current = 0;
        const increment = stat.target / 100;
        const duration = 2000 + (index * 200); // Stagger animations
        const stepTime = duration / 100;

        const timer = setInterval(() => {
          current += increment;
          if (current >= stat.target) {
            current = stat.target;
            clearInterval(timer);
          }

          setStats(prevStats => 
            prevStats.map(s => 
              s.id === stat.id 
                ? { ...s, value: current }
                : s
            )
          );
        }, stepTime);
      });
    };

    const timeout = setTimeout(animateCounters, 500);
    return () => clearTimeout(timeout);
  }, [isVisible]);

  // Live updates simulation
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setStats(prevStats => 
        prevStats.map(stat => {
          // Small random increments for live effect
          const randomIncrease = Math.random() * 0.1;
          const newValue = stat.value + randomIncrease;
          
          return {
            ...stat,
            value: newValue,
            target: newValue
          };
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const formatValue = (stat: StatItem) => {
    const { value, prefix = "", suffix = "" } = stat;
    
    if (stat.id === "funding") {
      return `${prefix}${value.toFixed(1)}${suffix}`;
    }
    
    if (stat.id === "rating") {
      return `${value.toFixed(1)}${suffix}`;
    }
    
    if (stat.id === "success") {
      return `${value.toFixed(1)}${suffix}`;
    }
    
    return `${prefix}${Math.floor(value).toLocaleString()}${suffix}`;
  };

  return (
    <section 
      ref={sectionRef}
      className="py-12 md:py-16 bg-white dark:bg-gray-900 relative overflow-hidden"
      id="stats"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="section-container relative z-10">
        <div className="text-center mb-8">
          <div className="pulse-chip mx-auto mb-4">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pulse-500 text-white mr-2">03</span>
            <span>Live Impact</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-3 text-gray-900 dark:text-white">
            Real Results from Real Entrepreneurs
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join thousands of successful founders who've built their startups with NEXORA
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className={cn(
                  "relative p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-500 group",
                  "hover:-translate-y-1"
                )}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  opacity: isVisible ? 1 : 0,
                  transition: "opacity 500ms ease-in-out"
                }}
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={cn("inline-flex p-2 rounded-lg mb-3", stat.bgColor)}>
                    <Icon className={cn("w-5 h-5", stat.color)} />
                  </div>

                  {/* Value */}
                  <div className="mb-2">
                    <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-mono">
                      {formatValue(stat)}
                    </span>
                    {isVisible && (
                      <div className="inline-block ml-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <p className="text-gray-600 dark:text-gray-300 font-medium text-sm">{stat.label}</p>

                  {/* Live Indicator */}
                  <div className="flex items-center mt-3 text-xs text-green-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse" />
                    <span>Live</span>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-pulse-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-pulse-500 to-pulse-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse" />
            <span className="font-medium text-sm">Join 12,847+ entrepreneurs building with NEXORA</span>
          </div>
        </div>

        {/* Testimonial Ticker */}
        <div className="mt-8 overflow-hidden">
          <div className="flex animate-scroll space-x-8">
            {[
              "\"NEXORA helped us raise $2M in seed funding\" - Sarah Chen, CloudSync",
              "\"Built our MVP in 3 hours, not 3 months\" - Michael Rodriguez, FitTrack",
              "\"The AI market research was spot-on\" - Dr. Amara Patel, HealthAI",
              "\"From idea to launch in one week\" - Jason Lee, EduLearn",
              "\"Best investment for any entrepreneur\" - Lisa Wang, GreenTech"
            ].map((testimonial, index) => (
              <div key={index} className="flex-shrink-0 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-full">
                <span className="text-gray-700 dark:text-gray-300 text-xs whitespace-nowrap">{testimonial}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default LiveStats;
