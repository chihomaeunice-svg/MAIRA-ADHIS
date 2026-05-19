import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale, Briefcase, Heart, Building, Users, FileText, Shield,
  Phone, Mail, MapPin, Star, ChevronRight, Menu, X, ArrowRight,
  CheckCircle, Clock, Award, Lock
} from 'lucide-react';

const practiceAreas = [
  { icon: Briefcase, title: 'Commercial & Corporate Law', desc: 'Expert handling of business disputes, contract enforcement, and corporate governance matters.', color: 'bg-blue-50 text-blue-600' },
  { icon: Heart, title: 'Family Matters', desc: 'Compassionate representation in divorce, custody, inheritance, and family dispute resolutions.', color: 'bg-pink-50 text-pink-600' },
  { icon: Building, title: 'Conveyances & Property', desc: 'Comprehensive property law services including title transfers, land disputes, and conveyancing.', color: 'bg-green-50 text-green-600' },
  { icon: Users, title: 'Labour Law', desc: 'Protecting employee and employer rights in employment disputes, unfair dismissal, and workplace matters.', color: 'bg-purple-50 text-purple-600' },
  { icon: FileText, title: 'Notary Public', desc: 'Official notarization, certification of documents, and commissioner for oaths services.', color: 'bg-yellow-50 text-yellow-600' },
  { icon: Shield, title: 'Criminal Defense', desc: 'Vigorous defense representation in criminal proceedings across all court levels in Tanzania.', color: 'bg-red-50 text-red-600' },
];

const testimonials = [
  { initials: 'J.K.', name: 'J. Kimaro', role: 'Business Owner', text: 'MAIRA & ADHIS handled our complex corporate dispute with utmost professionalism. Their expertise in commercial law is unmatched in Dar es Salaam.' },
  { initials: 'G.O.', name: 'G. Odhiambo', role: 'Individual Client', text: 'The team guided me through a difficult estate matter with compassion and efficiency. I felt supported every step of the way.' },
  { initials: 'T.L.', name: 'Tanzaprint Ltd', role: 'Corporate Client', text: 'We have relied on MAIRA & ADHIS for all our legal needs for over 5 years. Their deep understanding of Tanzanian law is invaluable.' },
];

const features = [
  { icon: Award, title: 'Expert Legal Team', desc: 'Our advocates are highly qualified with years of courtroom experience across multiple practice areas.' },
  { icon: Lock, title: 'Strict Confidentiality', desc: 'Your case information is handled with the highest level of professional secrecy and discretion.' },
  { icon: Clock, title: 'Timely Service', desc: 'We respect your time and deadlines, ensuring prompt responses and efficient case management.' },
  { icon: CheckCircle, title: 'Proven Track Record', desc: 'Over 500 cases successfully resolved, building a reputation for excellence in Tanzanian courts.' },
];

const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your message! We will contact you within 24 hours.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="min-h-screen font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-600/95 backdrop-blur-md border-b border-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-accent-500 rounded-lg flex items-center justify-center">
                <Scale className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">MAIRA &amp; ADHIS</p>
                <p className="text-primary-200 text-xs">ADVOCATES</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {['Home', 'About', 'Practice Areas', 'Contact'].map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-primary-100 hover:text-accent-400 text-sm font-medium transition-colors">
                  {item}
                </a>
              ))}
              <Link to="/login" className="ml-2 bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                Client Portal
              </Link>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white p-2">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-primary-700">
              {['Home', 'About', 'Practice Areas', 'Contact'].map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} onClick={() => setMobileMenuOpen(false)} className="block py-2 text-primary-100 hover:text-white text-sm font-medium">
                  {item}
                </a>
              ))}
              <Link to="/login" className="block mt-3 bg-accent-500 text-white px-4 py-2 rounded-lg text-sm font-semibold text-center" onClick={() => setMobileMenuOpen(false)}>
                Client Portal
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="relative min-h-screen flex items-center bg-gradient-to-br from-primary-900 via-primary-700 to-primary-800 pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-accent-500/20 border border-accent-500/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
              <span className="text-accent-300 text-sm font-medium">Established 2005 &bull; Dar es Salaam, Tanzania</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              MAIRA &amp; ADHIS<br />
              <span className="text-accent-400">ADVOCATES</span>
            </h1>
            <p className="text-primary-100 text-lg leading-relaxed mb-8 max-w-xl">
              Advocates, Chartered Secretaries, Legal Consultants in Commercial &amp; Corporate Disputes, Conveyances, Family Matters, Labour, Notary Public &amp; Commissioners for Oaths.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#contact" className="bg-accent-500 hover:bg-accent-600 text-white px-8 py-3.5 rounded-xl font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2">
                Book Consultation <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#practice-areas" className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-3.5 rounded-xl font-semibold transition-all flex items-center gap-2">
                Learn More <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-72 h-72 lg:w-80 lg:h-80 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                <div className="w-56 h-56 lg:w-64 lg:h-64 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                  <Scale className="h-28 w-28 text-accent-400" />
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-accent-500 rounded-2xl p-4 shadow-xl">
                <p className="text-white text-2xl font-bold">20+</p>
                <p className="text-white/80 text-xs">Years</p>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl">
                <p className="text-primary-600 text-2xl font-bold">500+</p>
                <p className="text-gray-500 text-xs">Cases Won</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="bg-primary-600 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '20+', label: 'Years Experience' },
              { value: '500+', label: 'Cases Won' },
              { value: '1000+', label: 'Clients Served' },
              { value: '6', label: 'Practice Areas' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-accent-400">{stat.value}</p>
                <p className="text-primary-200 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Practice Areas */}
      <section id="practice-areas" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-accent-600 font-semibold text-sm uppercase tracking-widest mb-2">What We Do</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Practice Areas</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We provide comprehensive legal services across multiple disciplines, ensuring expert representation for all your legal needs.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practiceAreas.map((area) => (
              <div key={area.title} className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 border border-gray-100 group">
                <div className={`w-12 h-12 rounded-xl ${area.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <area.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{area.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{area.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-accent-600 font-semibold text-sm uppercase tracking-widest mb-2">About Us</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Serving Tanzanians With Excellence Since 2005</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                MAIRA &amp; ADHIS ADVOCATES is a premier law firm headquartered in Dar es Salaam, Tanzania. We specialize in providing expert legal counsel to individuals, businesses, and organizations across a wide range of legal matters.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Our team of qualified advocates and chartered secretaries brings decades of combined experience in Tanzanian law, ensuring that our clients receive the highest quality legal representation in courts at all levels.
              </p>
              <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Our Location</p>
                  <p className="text-sm text-gray-600">17 Usalama Drive, Drive-in Estate, Old Bagamoyo Road</p>
                  <p className="text-sm text-gray-600">P.O.Box 2886, Dar Es Salaam, Tanzania</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 text-white">
                <Scale className="h-20 w-20 text-accent-400 mb-6 mx-auto" />
                <h3 className="text-2xl font-bold text-center mb-4">Legal Excellence</h3>
                <p className="text-primary-200 text-center leading-relaxed">
                  Committed to upholding justice and providing our clients with the best legal representation in Tanzania.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  {[
                    { label: 'High Court', value: 'Accredited' },
                    { label: 'Court of Appeal', value: 'Listed' },
                    { label: 'Labour Court', value: 'Active' },
                    { label: 'Land Division', value: 'Certified' },
                  ].map(item => (
                    <div key={item.label} className="bg-white/10 rounded-xl p-3 text-center">
                      <p className="text-accent-400 font-bold text-sm">{item.value}</p>
                      <p className="text-primary-200 text-xs">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-accent-600 font-semibold text-sm uppercase tracking-widest mb-2">Why Choose Us</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Sets Us Apart</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 text-center">
                <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <f.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-accent-400 font-semibold text-sm uppercase tracking-widest mb-2">Testimonials</p>
            <h2 className="text-4xl font-bold text-white mb-4">What Our Clients Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-accent-400 text-accent-400" />)}
                </div>
                <p className="text-primary-100 leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{t.initials}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-primary-300 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-accent-600 font-semibold text-sm uppercase tracking-widest mb-2">Contact Us</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Ready to discuss your legal matter? Contact us today for a consultation.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Office Address</h3>
                  <p className="text-gray-600 text-sm">17 Usalama Drive, Drive-in Estate</p>
                  <p className="text-gray-600 text-sm">Old Bagamoyo Road, P.O.Box 2886</p>
                  <p className="text-gray-600 text-sm">Dar Es Salaam, Tanzania</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Phone Numbers</h3>
                  <p className="text-gray-600 text-sm">+255 763 717 988</p>
                  <p className="text-gray-600 text-sm">+255 754 494 010</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email Addresses</h3>
                  <p className="text-gray-600 text-sm">info@maca.co.tz</p>
                  <p className="text-gray-600 text-sm">mairaadhis@gmail.com</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="+255 7XX XXX XXX" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea rows={4} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} required className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Briefly describe your legal matter..." />
              </div>
              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                Send Message <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent-500 rounded-lg flex items-center justify-center">
                  <Scale className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold">MAIRA &amp; ADHIS ADVOCATES</p>
                  <p className="text-primary-300 text-xs">Legal Excellence in Tanzania</p>
                </div>
              </div>
              <p className="text-primary-300 text-sm leading-relaxed mb-4">
                Advocates, Chartered Secretaries &amp; Legal Consultants providing excellence in legal services throughout Tanzania since 2005.
              </p>
              <div className="space-y-1 text-sm text-primary-300">
                <p>17 Usalama Drive, Drive-in Estate</p>
                <p>Old Bagamoyo Road, Dar Es Salaam</p>
                <p>+255 763 717 988 | +255 754 494 010</p>
                <p>info@maca.co.tz</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-accent-400">Quick Links</h4>
              <ul className="space-y-2 text-sm text-primary-300">
                {['Home', 'About Us', 'Practice Areas', 'Contact Us'].map(l => (
                  <li key={l}><a href="#" className="hover:text-accent-400 transition-colors">{l}</a></li>
                ))}
                <li><Link to="/login" className="hover:text-accent-400 transition-colors">Client Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-accent-400">Practice Areas</h4>
              <ul className="space-y-2 text-sm text-primary-300">
                {['Commercial & Corporate', 'Family Matters', 'Conveyances', 'Labour Law', 'Notary Public', 'Criminal Defense'].map(a => (
                  <li key={a}><a href="#practice-areas" className="hover:text-accent-400 transition-colors">{a}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-700 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-primary-400 text-sm">&copy; 2024 MAIRA &amp; ADHIS ADVOCATES. All Rights Reserved.</p>
            <div className="flex gap-4 text-sm text-primary-400">
              <a href="#" className="hover:text-accent-400">Privacy Policy</a>
              <a href="#" className="hover:text-accent-400">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
