import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Code,
  Zap,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsData {
  totalProjects: number;
  completedProjects: number;
  totalGenerations: number;
  creditsUsed: number;
  avgResponseTime: number;
  successRate: number;
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalProjects: 0,
    completedProjects: 0,
    totalGenerations: 0,
    creditsUsed: 0,
    avgResponseTime: 0,
    successRate: 0,
  });

  useEffect(() => {
    // Fetch analytics data
    // This would be replaced with actual API call
    setAnalytics({
      totalProjects: 24,
      completedProjects: 18,
      totalGenerations: 156,
      creditsUsed: 342,
      avgResponseTime: 2.4,
      successRate: 94.5,
    });
  }, []);

  const stats = [
    {
      title: "Total Projects",
      value: analytics.totalProjects,
      icon: Code,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Completed",
      value: analytics.completedProjects,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      title: "Generations",
      value: analytics.totalGenerations,
      icon: Zap,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      change: "+23%",
      changeType: "positive" as const,
    },
    {
      title: "Credits Used",
      value: analytics.creditsUsed,
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "-5%",
      changeType: "negative" as const,
    },
    {
      title: "Avg Response Time",
      value: `${analytics.avgResponseTime}s`,
      icon: Clock,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
      change: "-15%",
      changeType: "positive" as const,
    },
    {
      title: "Success Rate",
      value: `${analytics.successRate}%`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      change: "+2.3%",
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <p className={`text-sm mt-2 flex items-center ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.changeType === 'positive' ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <AlertCircle className="w-4 h-4 mr-1" />
                )}
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
