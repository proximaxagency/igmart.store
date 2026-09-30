"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SectionHeading } from "@/components/ui/index";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

export default function SubmitTicketPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    category: "General Inquiry",
    priority: "normal",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate ticket creation
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="bg-background min-h-[calc(100vh-76px)] py-12">
      <div className="container max-w-2xl">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Support
        </button>

        {submitted ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h1 className="font-heading font-black text-2xl text-text">Ticket Submitted!</h1>
            <p className="text-text-muted text-sm max-w-md mx-auto">
              Thank you for contacting IGMART Support. Our agent team has received your ticket and will respond within 4 hours.
            </p>
            <button 
              onClick={() => router.push("/support")}
              className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary-hover transition-colors"
            >
              Return to Support Center
            </button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-8">
            <SectionHeading eyebrow="Support Ticket" title="Submit a Request" />
            
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              <div>
                <label className="block text-sm font-bold text-text mb-2">Subject</label>
                <input 
                  type="text" 
                  required
                  placeholder="Summarize your issue..."
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl p-3.5 text-text outline-none focus:border-primary/50 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-text mb-2">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl p-3.5 text-text outline-none focus:border-primary/50 text-sm"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Account & Security">Account & Security</option>
                    <option value="Order & Delivery">Order & Delivery</option>
                    <option value="Dispute & Refund">Dispute & Refund</option>
                    <option value="Seller Issue">Seller Issue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-text mb-2">Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl p-3.5 text-text outline-none focus:border-primary/50 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High / Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text mb-2">Description</label>
                <textarea 
                  required
                  rows={6}
                  placeholder="Provide all relevant details (order numbers, usernames, issue description)..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl p-3.5 text-text outline-none focus:border-primary/50 text-sm resize-y"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-hover disabled:opacity-50 flex items-center justify-center gap-2 transition-colors text-sm"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Submit Ticket"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
