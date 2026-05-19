import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, Home, ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl mb-6">
          <Scale className="h-10 w-10 text-accent-400" />
        </div>
        <h1 className="text-8xl font-bold text-accent-400 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-3">Page Not Found</h2>
        <p className="text-primary-200 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-lg transition-colors"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors border border-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
        <p className="mt-8 text-primary-300 text-sm">
          MAIRA &amp; ADHIS ADVOCATES &mdash; Dar es Salaam, Tanzania
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
