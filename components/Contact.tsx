"use client";
import React, { useState } from "react";
import { Button } from "./ui/Button";
import { dataService, Settings } from "@/services/dataService";
import { useData } from "@/hooks/useData";

export default function Contact() {
  const { data: settings } = useData<Settings>('settings');
  const s = settings?.[0];
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        throw new Error(result.error || "Unable to submit lead.");
      }

      setSuccess(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : String(submitError ?? "Unknown error");
      console.error("Lead submission failed:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 px-6 sm:px-12 md:px-24 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Let’s Start Growing Your Business.</h2>
            <p className="text-lg text-text-secondary mb-12">
              Ready to take your digital presence to the next level? Fill out the form and 
              our team will get back to you within 24 hours.
            </p>
            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="w-12 h-12 bg-accent-blue/10 border border-accent-blue/20 rounded-full flex items-center justify-center">
                  <span className="text-accent-blue font-bold tracking-tighter">PH</span>
                </div>
                <div>
                  <p className="text-xs uppercase font-bold text-text-secondary tracking-widest leading-none mb-1">CALL US</p>
                  <p className="text-lg font-bold text-white leading-none">{s?.contact_phone || "+91 77788-64972"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                 <div className="w-12 h-12 bg-accent-blue/10 border border-accent-blue/20 rounded-full flex items-center justify-center">
                   <span className="text-accent-blue font-bold tracking-tighter">EM</span>
                 </div>
                 <div>
                   <p className="text-xs uppercase font-bold text-text-secondary tracking-widest leading-none mb-1">EMAIL US</p>
                   <p className="text-lg font-bold text-white leading-none">{s?.contact_email || "brothersmediatech@gmail.com"}</p>
                 </div>
               </div>
            </div>
          </div>

          <div className="bg-surface p-8 rounded-2xl border border-border shadow-2xl">
            {success ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                 <h2 className="text-3xl font-bold text-white mb-4">Message Sent!</h2>
                 <p className="text-text-secondary mb-8">We'll get back to you soon.</p>
                 <Button onClick={() => setSuccess(false)}>Send another message</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error ? (
                  <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                    {error}
                  </div>
                ) : null}
                <div>
                  <label className="block text-sm font-bold text-text-secondary uppercase mb-2">Name</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-[#0B0F19] border border-border rounded-lg h-12 px-4 focus:outline-none focus:border-accent-blue transition-colors text-white"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-secondary uppercase mb-2">Email</label>
                  <input
                    required
                    type="email"
                    className="w-full bg-[#0B0F19] border border-border rounded-lg h-12 px-4 focus:outline-none focus:border-accent-blue transition-colors text-white"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-secondary uppercase mb-2">Message</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full bg-[#0B0F19] border border-border rounded-lg p-4 focus:outline-none focus:border-accent-blue transition-colors text-white resize-none"
                    placeholder="How can we help?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
                <Button disabled={loading} type="submit" className="w-full h-14">
                  {loading ? "Sending..." : "Submit Inquiry"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
