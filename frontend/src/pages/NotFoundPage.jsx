import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, LayoutDashboard } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 mb-6">
          <AlertTriangle strokeWidth={2} className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          404 - Page Not Found
        </h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 h-11 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm rounded-xl transition-colors duration-200 shadow-lg"
        >
          <LayoutDashboard strokeWidth={2} className="w-4 h-4" />
          Go Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
