import React from "react";
import { useNavigate } from "react-router-dom";
import { ServerCrash, Home, RefreshCw, Mail } from "lucide-react";

const Error500 = () => {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <ServerCrash className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h1 className="text-6xl font-bold text-gray-900 mb-4">500</h1>
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Internal Server Error
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Oops! Something went wrong on our end. Our team has been notified and is working to fix the issue.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </button>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </button>
          <a
            href="mailto:support@nexora.ai"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors"
          >
            <Mail className="w-5 h-5 mr-2" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default Error500;
