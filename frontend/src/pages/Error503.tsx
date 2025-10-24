import React from "react";
import { useNavigate } from "react-router-dom";
import { Construction, Home, RefreshCw } from "lucide-react";

const Error503 = () => {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <Construction className="w-24 h-24 text-blue-500 mx-auto mb-6" />
          <h1 className="text-6xl font-bold text-gray-900 mb-4">503</h1>
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Service Unavailable
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            We're currently performing maintenance or experiencing high traffic. Please try again in a few moments.
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
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Status updates: <a href="https://status.nexora.ai" className="text-orange-500 hover:underline">status.nexora.ai</a></p>
        </div>
      </div>
    </div>
  );
};

export default Error503;
