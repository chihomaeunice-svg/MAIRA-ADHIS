import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useUIStore } from '@/stores/uiStore';
import { Mail, Phone, Clock, Trash2, MailOpen, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const MessagesPage: React.FC = () => {
  const { setPageTitle } = useUIStore();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => { setPageTitle('Messages'); }, [setPageTitle]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'contactMessages'), orderBy('createdAt', 'desc')));
      setMessages(snap.docs.map(d => ({
        id: d.id,
        name: d.data().name || '',
        email: d.data().email || '',
        phone: d.data().phone || undefined,
        subject: d.data().subject || 'General Enquiry',
        message: d.data().message || '',
        read: d.data().read ?? false,
        createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date(),
      })));
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const openMessage = async (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.read) {
      try {
        await updateDoc(doc(db, 'contactMessages', msg.id), { read: true });
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
      } catch { /* ignore */ }
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'contactMessages', id));
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success('Message deleted');
    } catch {
      toast.error('Failed to delete message');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const formatDate = (date: Date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const unread = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Contact Messages</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unread > 0 ? <span className="text-primary-600 font-medium">{unread} unread</span> : 'All read'} · {messages.length} total
          </p>
        </div>
        <button onClick={fetchMessages} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
          <RefreshCw className="h-4 w-4 text-gray-500" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-[500px]">
        {/* Message List */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="py-16 text-center">
              <Mail className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No messages yet</p>
              <p className="text-gray-400 text-xs mt-1">Messages from your website contact form will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  className={clsx(
                    'p-4 cursor-pointer hover:bg-gray-50 transition-colors',
                    selected?.id === msg.id && 'bg-primary-50 border-l-2 border-primary-600',
                    !msg.read && 'bg-blue-50/30'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {!msg.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                        <p className={clsx('text-sm truncate', !msg.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700')}>{msg.name}</p>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{msg.subject}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{msg.message}</p>
                    </div>
                    <p className="text-xs text-gray-400 flex-shrink-0">{msg.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          {!selected ? (
            <div className="flex items-center justify-center h-full py-20">
              <div className="text-center">
                <MailOpen className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Select a message to read</p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selected.subject}</h2>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(selected.createdAt)}
                  </div>
                </div>
                {deleteConfirmId === selected.id ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => deleteMessage(selected.id)} className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700">Confirm Delete</button>
                    <button onClick={() => setDeleteConfirmId(null)} className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirmId(selected.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 w-16">From:</span>
                  <span className="font-medium text-gray-900">{selected.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  <a href={`mailto:${selected.email}`} className="text-primary-600 hover:underline">{selected.email}</a>
                </div>
                {selected.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-700">{selected.phone}</span>
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-white border border-gray-100 rounded-xl p-4">
                {selected.message}
              </div>

              <div className="mt-6">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Mail className="h-4 w-4" /> Reply via Email
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
