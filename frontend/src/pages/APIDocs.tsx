import { useState } from "react";
import { motion } from "framer-motion";
import { Code, Copy, Check, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function APIDocs() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>("mvp");

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      id: "mvp",
      title: "MVP Development",
      description: "Generate complete MVPs with AI",
      methods: [
        {
          method: "POST",
          path: "/api/mvp/stream",
          description: "Stream MVP generation with real-time updates",
          rateLimit: "10 requests/minute",
          auth: "Bearer Token",
          request: {
            prompt: "Build a todo app with React",
            conversationHistory: []
          },
          response: {
            type: "Server-Sent Events (SSE)",
            events: ["file_operation", "sandbox_url", "status", "complete"]
          }
        },
        {
          method: "POST",
          path: "/api/mvpDevelopment",
          description: "Generate MVP code (non-streaming)",
          rateLimit: "10 requests/minute",
          auth: "Bearer Token",
          request: {
            productName: "TaskMaster",
            productIdea: "A collaborative task management app",
            coreFeatures: ["Task creation", "Team collaboration"],
            techStack: ["React", "TypeScript", "Tailwind CSS"]
          },
          response: {
            status: "success",
            files: [],
            fileCount: 12
          }
        }
      ]
    },
    {
      id: "idea",
      title: "Idea Validation",
      description: "Validate startup ideas with AI analysis",
      methods: [
        {
          method: "POST",
          path: "/api/idea-validation/validate",
          description: "Complete idea validation with market research",
          rateLimit: "5 requests/minute",
          auth: "Bearer Token",
          request: {
            idea: "AI-powered code review tool",
            industry: "SaaS",
            generate_pdf: true
          },
          response: {
            ai_feasibility_score: { overall: 85 },
            competitors: [],
            target_audience: {},
            risks: []
          }
        }
      ]
    },
    {
      id: "business",
      title: "Business Planning",
      description: "Generate comprehensive business plans",
      methods: [
        {
          method: "POST",
          path: "/api/business-plan/generate",
          description: "Generate complete business plan",
          rateLimit: "3 requests/minute",
          auth: "Bearer Token",
          request: {
            idea: "SaaS platform for developers",
            target_market: "Software developers",
            business_model: "Subscription"
          },
          response: {
            lean_canvas: {},
            financial_estimate: {},
            team_composition: {},
            marketing_strategy: {}
          }
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            API Documentation
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Complete reference for Nexora's powerful AI APIs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Endpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {endpoints.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setExpandedSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      expandedSection === section.id
                        ? "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{section.title}</span>
                      {expandedSection === section.id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {endpoints.map((section) => (
              expandedSection === section.id && (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </CardHeader>
                  </Card>

                  {section.methods.map((method, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              method.method === "POST" ? "bg-green-100 text-green-700" :
                              method.method === "GET" ? "bg-blue-100 text-blue-700" :
                              "bg-orange-100 text-orange-700"
                            }`}>
                              {method.method}
                            </span>
                            <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded">
                              {method.path}
                            </code>
                          </div>
                          <button
                            onClick={() => copyToClipboard(method.path, method.path)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          >
                            {copiedEndpoint === method.path ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <CardDescription className="mt-2">
                          {method.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Rate Limit:</span>
                            <span className="ml-2 font-medium">{method.rateLimit}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Auth:</span>
                            <span className="ml-2 font-medium">{method.auth}</span>
                          </div>
                        </div>

                        {/* Request/Response */}
                        <Tabs defaultValue="request">
                          <TabsList>
                            <TabsTrigger value="request">Request</TabsTrigger>
                            <TabsTrigger value="response">Response</TabsTrigger>
                          </TabsList>
                          <TabsContent value="request" className="mt-4">
                            <div className="relative">
                              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                                <code>{JSON.stringify(method.request, null, 2)}</code>
                              </pre>
                              <button
                                onClick={() => copyToClipboard(JSON.stringify(method.request, null, 2), `${method.path}-req`)}
                                className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                              >
                                {copiedEndpoint === `${method.path}-req` ? (
                                  <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </TabsContent>
                          <TabsContent value="response" className="mt-4">
                            <div className="relative">
                              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                                <code>{JSON.stringify(method.response, null, 2)}</code>
                              </pre>
                              <button
                                onClick={() => copyToClipboard(JSON.stringify(method.response, null, 2), `${method.path}-res`)}
                                className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                              >
                                {copiedEndpoint === `${method.path}-res` ? (
                                  <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
