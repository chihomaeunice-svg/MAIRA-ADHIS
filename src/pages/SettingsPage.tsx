import React, { useState } from 'react';
import { User, Lock, Bell, Settings, Save, Scale } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'system', label: 'System', icon: Settings },
];

const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('Settings saved successfully');
    setSaving(false);
  };

  return (
    <div className="max-w-4xl space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Settings</h2>

      <div className="flex gap-5">
        <div className="w-48 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-2 space-y-0.5">
            {tabs.map(tab => {
              const isSystem = tab.id === 'system';
              if (isSystem && !['ADMIN', 'MANAGING_PARTNER'].includes(user?.role || '')) return null;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    activeTab === tab.id ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold text-gray-900">Profile Information</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">{user?.role}</span>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Full Name" defaultValue={user?.name || ''} />
                <Input label="Email Address" type="email" defaultValue={user?.email || ''} />
                <Input label="Phone Number" defaultValue={user?.phone || ''} placeholder="+255 7XX XXX XXX" />
                <Input label="Role" defaultValue={user?.role || ''} disabled />
              </div>
              <Button onClick={handleSave} isLoading={saving} leftIcon={<Save className="h-4 w-4" />}>Save Changes</Button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold text-gray-900">Security Settings</h3>
              <div className="space-y-4">
                <Input label="Current Password" type="password" placeholder="Enter current password" />
                <Input label="New Password" type="password" placeholder="Enter new password" helperText="At least 8 characters with uppercase, lowercase, and numbers" />
                <Input label="Confirm New Password" type="password" placeholder="Confirm new password" />
              </div>
              <Button onClick={handleSave} isLoading={saving} leftIcon={<Lock className="h-4 w-4" />}>Update Password</Button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold text-gray-900">Notification Preferences</h3>
              <div className="space-y-3">
                {[
                  { label: 'Upcoming Hearings', desc: 'Receive reminders before court hearings', checked: true },
                  { label: 'New Case Assignments', desc: 'Notify when a new case is assigned to you', checked: true },
                  { label: 'Document Expiry Alerts', desc: 'Alert when documents are about to expire', checked: true },
                  { label: 'Procurement Approvals', desc: 'Notify on procurement request updates', checked: false },
                  { label: 'System Updates', desc: 'System maintenance and updates notifications', checked: false },
                ].map(notif => (
                  <div key={notif.label} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{notif.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{notif.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={notif.checked} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                    </label>
                  </div>
                ))}
              </div>
              <Button onClick={handleSave} isLoading={saving} leftIcon={<Save className="h-4 w-4" />}>Save Preferences</Button>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold text-gray-900">System Settings</h3>
              <div className="p-4 bg-primary-50 rounded-xl border border-primary-100 flex items-center gap-4">
                <Scale className="h-8 w-8 text-primary-600" />
                <div>
                  <p className="font-semibold text-primary-900">MAIRA &amp; ADHIS ADVOCATES LMS</p>
                  <p className="text-sm text-primary-700">Version 1.0.0 &bull; Dar es Salaam, Tanzania</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Firm Name', value: 'MAIRA & ADHIS ADVOCATES' },
                  { label: 'Address', value: '17 Usalama Drive, Drive-in Estate' },
                  { label: 'Phone', value: '+255 763 717 988 | +255 754 494 010' },
                  { label: 'Email', value: 'info@maca.co.tz' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
