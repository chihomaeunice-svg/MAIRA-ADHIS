import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, ArrowLeft, Phone, Mail, MapPin } from 'lucide-react';

const ContactPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <nav className="bg-primary-600 py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
            <Scale className="h-5 w-5" />
          </div>
          <span className="font-bold">MAIRA &amp; ADHIS COMPANY ADVOCATES</span>
        </Link>
        <Link to="/" className="flex items-center gap-2 text-primary-200 hover:text-white text-sm">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>
    </nav>
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-card flex items-start gap-4">
          <MapPin className="h-6 w-6 text-primary-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-2">Address</h3>
            <p className="text-gray-600 text-sm">17 Usalama Drive, Drive-in Estate, Old Bagamoyo Road, P.O.Box 2886, Dar Es Salaam, Tanzania</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-card flex items-start gap-4">
          <Phone className="h-6 w-6 text-primary-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-2">Phone</h3>
            <p className="text-gray-600 text-sm">+255 763 717 988</p>
            <p className="text-gray-600 text-sm">+255 754 494 010</p>
            <p className="text-gray-600 text-sm">+255 754 263 269 (Madam Irene)</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-card flex items-start gap-4">
          <Mail className="h-6 w-6 text-primary-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-2">Email</h3>
            <p className="text-gray-600 text-sm">info@maca.co.tz</p>
            <p className="text-gray-600 text-sm">mairaadhis@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ContactPage;
