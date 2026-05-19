import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, ArrowLeft } from 'lucide-react';

const AboutPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <nav className="bg-primary-600 py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
            <Scale className="h-5 w-5" />
          </div>
          <span className="font-bold">MAIRA &amp; ADHIS ADVOCATES</span>
        </Link>
        <Link to="/" className="flex items-center gap-2 text-primary-200 hover:text-white text-sm">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>
    </nav>
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">About Our Firm</h1>
      <p className="text-gray-600 text-lg leading-relaxed mb-6">
        MAIRA &amp; ADHIS ADVOCATES is a full-service law firm based in Dar es Salaam, Tanzania. Founded with a commitment to providing exceptional legal services, we have grown to become one of the trusted legal practices in the region.
      </p>
      <p className="text-gray-600 leading-relaxed">
        Our team comprises advocates, chartered secretaries, and legal consultants with expertise spanning commercial law, family matters, conveyances, labour law, and more.
      </p>
    </div>
  </div>
);

export default AboutPage;
