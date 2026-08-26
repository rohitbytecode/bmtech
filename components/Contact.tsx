'use client';
import React, { useState } from 'react';
import { Phone, Mail, Clock } from 'lucide-react';
import { Button } from './ui/Button';
import { dataService, Settings } from '@/services/dataService';
import { useData } from '@/hooks/useData';

function SuccessCheckmark() {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative w-20 h-20">
        {/* Circle */}
        <svg className="w-20 h-20" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r="30"
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            style={{
              transformOrigin: 'center',
              animation: 'circleGrow 0.5s ease forwards',
            }}
          />
          <path
            d="M20 33 L28 41 L44 25"
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="48"
            strokeDashoffset="48"
            style={{
              animation: 'checkDraw 0.4s ease 0.4s forwards',
            }}
          />
        </svg>
      </div>
      <div className="text-center">
        <h3 className="text-2xl font-bold text-foreground mb-2">Message Sent!</h3>
        <p className="text-text-secondary">We&apos;ll get back to you within 24 hours.</p>
      </div>
    </div>
  );
}

export default function Contact() {
  const { data: settings } = useData<Settings>('settings');
  const s = settings?.[0];
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await dataService.submitLead({
        name: formData.name,
        email: formData.email,
        message: formData.message,
      });

      if (!result.success) {
        throw new Error(result.error || 'Unable to submit lead.');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : String(submitError ?? 'Unknown error');
      console.error('Lead submission failed:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const isFieldActive = (field: string, value: string) => focusedField === field || value.length > 0;

  return (
    <section id="contact" className="py-16 md:py-20 px-6 sm:px-12 md:px-24 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-xl md:text-3xl font-extrabold mb-6 text-foreground">
              Let&apos;s Start{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                Growing
              </span>{' '}
              Your Business.
            </h2>
            <p className="text-lg text-text-secondary mb-12">
              Ready to take your digital presence to the next level? Fill out the form and our team
              will get back to you within 24 hours.
            </p>
            <div className="space-y-8">
              {/* PHONE */}
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 shrink-0 bg-accent-blue/10 border border-accent-blue/20 rounded-full flex items-center justify-center">
                  <Phone size={20} className="text-accent-blue" />
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase font-semibold text-text-secondary tracking-wider">
                    Call Us
                  </p>

                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-foreground">
                      {s?.contact_phone || '+91 77788-64972'}
                    </p>
                    <p className="text-lg font-semibold text-foreground/80">+91 77788-64972</p>
                  </div>
                </div>
              </div>

              {/* EMAIL */}
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 shrink-0 bg-accent-blue/10 border border-accent-blue/20 rounded-full flex items-center justify-center">
                  <Mail size={20} className="text-accent-blue" />
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase font-semibold text-text-secondary tracking-wider">
                    Email Us
                  </p>

                  <p className="text-lg font-semibold text-foreground break-all">
                    {s?.contact_email || 'brothersmediatech@gmail.com'}
                  </p>
                </div>
              </div>

              {/* HOURS */}
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 shrink-0 bg-accent-blue/10 border border-accent-blue/20 rounded-full flex items-center justify-center">
                  <Clock size={20} className="text-accent-blue" />
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase font-semibold text-text-secondary tracking-wider">
                    Working Hours
                  </p>

                  <p className="text-lg font-semibold text-foreground">Mon – Fri, 10 AM – 7 PM IST</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface/80 backdrop-blur-xl p-8 rounded-2xl border border-border shadow-2xl transition-shadow duration-300 focus-within:shadow-accent-blue/10 focus-within:border-accent-blue/30">
            {success ? (
              <div className="h-full flex flex-col items-center justify-center text-center min-h-[360px]">
                <SuccessCheckmark />
                <Button onClick={() => setSuccess(false)} className="mt-8">
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error ? (
                  <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                    {error}
                  </div>
                ) : null}

                {/* Name field with floating label */}
                <div className="relative">
                  <input
                    required
                    type="text"
                    id="contact-name"
                    className="peer w-full bg-background dark:bg-[#0B0F19] border border-border rounded-lg h-14 px-4 pt-5 pb-2 focus:outline-none focus:border-accent-blue transition-colors text-foreground placeholder-transparent"
                    placeholder="Name"
                    value={formData.name}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <label
                    htmlFor="contact-name"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                      ${isFieldActive('name', formData.name)
                        ? 'top-2 text-[10px] font-bold uppercase tracking-wider text-accent-blue'
                        : 'top-4 text-sm text-text-secondary'
                      }`}
                  >
                    Your Name
                  </label>
                </div>

                {/* Email field with floating label */}
                <div className="relative">
                  <input
                    required
                    type="email"
                    id="contact-email"
                    className="peer w-full bg-background dark:bg-[#0B0F19] border border-border rounded-lg h-14 px-4 pt-5 pb-2 focus:outline-none focus:border-accent-blue transition-colors text-foreground placeholder-transparent"
                    placeholder="Email"
                    value={formData.email}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <label
                    htmlFor="contact-email"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                      ${isFieldActive('email', formData.email)
                        ? 'top-2 text-[10px] font-bold uppercase tracking-wider text-accent-blue'
                        : 'top-4 text-sm text-text-secondary'
                      }`}
                  >
                    Email Address
                  </label>
                </div>

                {/* Message field with floating label */}
                <div className="relative">
                  <textarea
                    required
                    rows={4}
                    id="contact-message"
                    className="peer w-full bg-background dark:bg-[#0B0F19] border border-border rounded-lg p-4 pt-7 focus:outline-none focus:border-accent-blue transition-colors text-foreground resize-none placeholder-transparent"
                    placeholder="Message"
                    value={formData.message}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                  <label
                    htmlFor="contact-message"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                      ${isFieldActive('message', formData.message)
                        ? 'top-2 text-[10px] font-bold uppercase tracking-wider text-accent-blue'
                        : 'top-4 text-sm text-text-secondary'
                      }`}
                  >
                    How can we help?
                  </label>
                </div>

                <Button disabled={loading} type="submit" className="w-full h-14 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Submit Inquiry'
                  )}
                </Button>

                <p className="text-center text-xs text-text-secondary/70 mt-2">
                  🔒 Your information is secure and never shared.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
