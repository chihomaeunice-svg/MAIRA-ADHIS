import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Send, CheckCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';

const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in name, email and message.');
      return;
    }
    setSending(true);
    setError('');

    const subject = form.subject.trim() || 'General Enquiry';

    try {
      // Save to Firestore so staff can view it in the system
      await addDoc(collection(db, 'contactMessages'), {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        subject,
        message: form.message.trim(),
        read: false,
        createdAt: serverTimestamp(),
      });

      setSent(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setError('Failed to send message. Please try emailing us directly at info@maca.co.tz');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-primary-600 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/logo-icon.png" alt="" className="h-7 w-7 object-contain" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
            </div>
            <span className="font-bold">MAIRA &amp; ADHIS COMPANY ADVOCATES</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-primary-200 hover:text-white text-sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Contact Us</h1>
        <p className="text-gray-500 mb-10">Reach out to us for any legal enquiries or assistance.</p>

        {/* Contact Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
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
              <p className="text-gray-600 text-sm">+255 754 263 269</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-card flex items-start gap-4">
            <Mail className="h-6 w-6 text-primary-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Email</h3>
              <a href="mailto:info@maca.co.tz" className="text-primary-600 text-sm hover:underline">info@maca.co.tz</a>
              <p className="text-gray-600 text-sm">mairaadhis@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-card p-8 max-w-2xl">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Send us a message</h2>
          <p className="text-sm text-gray-500 mb-6">We'll get back to you as soon as possible.</p>

          {sent ? (
            <div className="flex flex-col items-center py-10 text-center">
              <CheckCircle className="h-14 w-14 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-gray-500 text-sm max-w-sm">Thank you for reaching out. Our team will review your message and get back to you shortly.</p>
              <button onClick={() => setSent(false)} className="mt-6 text-sm text-primary-600 hover:underline">Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your full name"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+255 7XX XXX XXX"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="e.g. Legal Consultation"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={5}
                  placeholder="Describe how we can help you..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors"
              >
                {sending ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                ) : (
                  <><Send className="h-4 w-4" /> Send Message</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
