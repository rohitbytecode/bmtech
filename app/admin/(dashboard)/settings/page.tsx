'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Palette, Globe, Save, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { InputField, TextAreaField, ToggleSwitch } from '@/components/admin/FormFields';
import { cn } from '@/lib/utils';
import { useData } from '@/hooks/useData';
import { Settings, dataService } from '@/services/dataService';
import { SecuritySettings } from '@/components/admin/SecuritySettings';

const tabs = [
  { id: 'business', icon: Globe, label: 'Business Profile' },
  { id: 'branding', icon: Palette, label: 'Branding' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'security', icon: Shield, label: 'Security' },
];

export default function SettingsPage() {
  const {
    data: globalSettings,
    loading: settingsLoading,
    refresh: refreshSettings,
  } = useData<Settings>('settings');
  const [activeTab, setActiveTab] = useState('business');
  const [isSaving, setIsSaving] = useState(false);

  // Local state for notification toggles
  const [notifSettings, setNotifSettings] = useState({
    email_alerts_enabled: true,
    push_notifications_enabled: true,
    weekly_reports_enabled: false,
    slack_integration_enabled: false,
  });

  useEffect(() => {
    if (globalSettings?.[0]) {
      const s = globalSettings[0];
      setNotifSettings({
        email_alerts_enabled: s.email_alerts_enabled,
        push_notifications_enabled: s.push_notifications_enabled,
        weekly_reports_enabled: s.weekly_reports_enabled,
        slack_integration_enabled: s.slack_integration_enabled,
      });
    }
  }, [globalSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const updates: Partial<Settings> = {
      agency_name: formData.get('agency_name') as string,
      headline: formData.get('headline') as string,
      contact_email: formData.get('contact_email') as string,
      contact_phone: formData.get('contact_phone') as string,
      about_text: formData.get('about_text') as string,
      description: formData.get('description') as string,
      ...notifSettings,
    };

    try {
      const { success, error } = await dataService.updateSettings(updates);
      if (success) {
        alert('Settings saved successfully!');
        refreshSettings();
      } else {
        alert('Failed to save settings: ' + error);
      }
    } catch (err) {
      alert('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (settingsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <Loader2 className="h-12 w-12 text-accent-blue animate-spin" />
        <p className="text-text-secondary font-medium">Loading system configurations...</p>
      </div>
    );
  }

  const s = globalSettings?.[0] || ({} as Settings);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-text-primary tracking-tight">System Settings</h2>
          <p className="text-text-secondary">
            Configure your platform globally to match your vision.
          </p>
        </div>
        {activeTab !== 'security' && (
          <Button
            onClick={() =>
              document
                .getElementById('settings-form')
                ?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
            }
            disabled={isSaving}
            className="h-14 px-8 gap-2 group shadow-lg shadow-accent-blue/30"
          >
            {isSaving ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Save size={20} className="group-hover:scale-110 transition-transform" />
            )}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        )}
      </div>

      <div className="flex flex-col xl:flex-row gap-12 items-start">
        <aside className="w-full xl:w-80 bg-surface border border-border rounded-3xl p-6 space-y-2 sticky top-24">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 group font-semibold',
                  isActive
                    ? 'bg-accent-blue text-white shadow-xl shadow-accent-blue/20'
                    : 'text-text-secondary hover:bg-background hover:text-text-primary',
                )}
              >
                <Icon
                  size={20}
                  className={cn(
                    'shrink-0',
                    isActive ? 'text-white' : 'text-text-secondary group-hover:text-text-primary',
                  )}
                />
                <span className="text-sm tracking-wide uppercase">{tab.label}</span>
              </button>
            );
          })}
        </aside>

        <div className="flex-1 w-full bg-surface border border-border rounded-3xl p-8 xl:p-12 min-h-[600px] shadow-2xl shadow-black/20 overflow-hidden">
          <div className="max-w-3xl space-y-12">
            {activeTab === 'security' ? (
              <SecuritySettings />
            ) : (
              <form id="settings-form" onSubmit={handleSave}>
                {activeTab === 'business' && (
                  <section className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="space-y-1 border-l-4 border-accent-blue pl-6">
                      <h3 className="text-2xl font-bold text-text-primary tracking-tight">
                        Agency Information
                      </h3>
                      <p className="text-text-secondary text-sm">
                        Public details visible on the main page.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <InputField
                        name="agency_name"
                        label="Agency Name"
                        defaultValue={s.agency_name}
                      />
                      <InputField name="headline" label="Headline" defaultValue={s.headline} />
                      <InputField
                        name="contact_email"
                        label="Contact Email"
                        defaultValue={s.contact_email}
                      />
                      <InputField
                        name="contact_phone"
                        label="Contact Phone"
                        defaultValue={s.contact_phone}
                      />
                      <div className="md:col-span-2">
                        <InputField
                          name="description"
                          label="Hero Description"
                          defaultValue={s.description}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <TextAreaField
                          name="about_text"
                          label="About Agency"
                          defaultValue={s.about_text}
                        />
                      </div>
                    </div>
                  </section>
                )}

                {/* {activeTab === "notifications" && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="space-y-1 border-l-4 border-accent-blue pl-6 mb-10">
                      <h3 className="text-2xl font-bold text-text-primary tracking-tight">Alert Settings</h3>
                      <p className="text-text-secondary text-sm">Control how you get notified of new leads.</p>
                    </div>
                    <ToggleSwitch
                      label="Email Alerts on New Leads"
                      checked={notifSettings.email_alerts_enabled}
                      onChange={(checked) => setNotifSettings({ ...notifSettings, email_alerts_enabled: checked })}
                    />
                    <ToggleSwitch
                      label="System Push Notifications"
                      checked={notifSettings.push_notifications_enabled}
                      onChange={(checked) => setNotifSettings({ ...notifSettings, push_notifications_enabled: checked })}
                    />
                    <ToggleSwitch
                      label="Weekly Summary Reports"
                      checked={notifSettings.weekly_reports_enabled}
                      onChange={(checked) => setNotifSettings({ ...notifSettings, weekly_reports_enabled: checked })}
                    />
                    <ToggleSwitch
                      label="Slack Integration"
                      checked={notifSettings.slack_integration_enabled}
                      onChange={(checked) => setNotifSettings({ ...notifSettings, slack_integration_enabled: checked })}
                    />
                  </div>
                )} */}

                {activeTab === 'notifications' && (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-text-primary tracking-tight">
                        Notifications
                      </h3>

                      <p className="text-text-secondary text-sm max-w-md">
                        This feature is currently under development. You’ll soon be able to manage
                        alerts, integrations, and reports from this panel.
                      </p>

                      <div className="inline-block px-4 py-2 rounded-full bg-accent-blue/10 text-accent-blue text-sm font-medium border border-accent-blue/20">
                        Coming Soon
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'branding' && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="space-y-1 border-l-4 border-accent-blue pl-6">
                      <h3 className="text-2xl font-bold text-text-primary tracking-tight">
                        Visual Identity
                      </h3>
                      <p className="text-text-secondary text-sm">Manage logos and visual assets.</p>
                    </div>
                    <div className="p-12 text-center bg-background/50 border-2 border-dashed border-border rounded-3xl">
                      <Palette className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                      <p className="text-text-secondary">
                        Custom branding and logo management coming soon.
                      </p>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
