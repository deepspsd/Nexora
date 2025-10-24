import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Home, LogIn } from "lucide-react";

const Error403 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <ShieldAlert className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Access Forbidden
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            You don't have permission to access this resource. Please contact your administrator if you believe this is an error.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Login
          </button>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Error403;
