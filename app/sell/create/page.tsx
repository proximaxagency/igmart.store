"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2, UploadCloud, ChevronRight } from "lucide-react";

export default function CreateListingPage() {
  const router = useRouter();
  
  const games = useQuery(api.listings.getGames);
  const categories = useQuery(api.listings.getCategories);
  const createListing = useMutation(api.listings.createListing);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    gameId: "" as Id<"games"> | "",
    categoryId: "" as Id<"categories"> | "",
    deliveryMethod: "manual" as "automatic" | "manual" | "coordinate",
    deliveryTime: "24 hours",
    autoDeliveryData: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.gameId || !formData.categoryId || !formData.title || !formData.price) return;
    
    setIsSubmitting(true);
    try {
      await createListing({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        gameId: formData.gameId as Id<"games">,
        categoryId: formData.categoryId as Id<"categories">,
        deliveryMethod: formData.deliveryMethod,
        deliveryTime: formData.deliveryTime,
        autoDeliveryData: formData.autoDeliveryData || undefined,
        images: ["https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800"], // placeholder
      });
      router.push("/seller/dashboard");
    } catch (error) {
      console.error("Failed to create listing:", error);
      alert("Failed to create listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-3xl py-12">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-text">Create a New Listing</h1>
        <p className="text-text-muted mt-2 text-lg">Provide details about what you are selling to attract buyers.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-card border border-border p-6 rounded-xl space-y-5">
          <h2 className="font-heading font-bold text-xl text-text border-b border-border pb-3">Basic Details</h2>
          
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Game</label>
              <select 
                value={formData.gameId} 
                onChange={(e) => setFormData({...formData, gameId: e.target.value as any})}
                required
                className="w-full bg-background border border-border rounded-lg p-3 text-text outline-none focus:border-primary/50"
              >
                <option value="">Select a game...</option>
                {games?.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Category</label>
              <select 
                value={formData.categoryId} 
                onChange={(e) => setFormData({...formData, categoryId: e.target.value as any})}
                required
                className="w-full bg-background border border-border rounded-lg p-3 text-text outline-none focus:border-primary/50"
              >
                <option value="">Select a category...</option>
                {categories?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-2">Listing Title</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Max Level Account with Rare Skins"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-background border border-border rounded-lg p-3 text-text outline-none focus:border-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-2">Description</label>
            <textarea 
              required
              rows={5}
              placeholder="Describe the account, item, or service in detail..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-background border border-border rounded-lg p-3 text-text outline-none focus:border-primary/50 resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-2">Price ($)</label>
            <input 
              type="number" 
              required
              min="1"
              step="0.01"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full bg-background border border-border rounded-lg p-3 text-text outline-none focus:border-primary/50 max-w-xs"
            />
          </div>
        </div>

        {/* Delivery Options */}
        <div className="bg-card border border-border p-6 rounded-xl space-y-5">
          <h2 className="font-heading font-bold text-xl text-text border-b border-border pb-3">Delivery Settings</h2>
          
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Delivery Method</label>
              <select 
                value={formData.deliveryMethod} 
                onChange={(e) => setFormData({...formData, deliveryMethod: e.target.value as any})}
                className="w-full bg-background border border-border rounded-lg p-3 text-text outline-none focus:border-primary/50"
              >
                <option value="manual">Manual Transfer (Chat)</option>
                <option value="automatic">Automatic Delivery (Instant)</option>
                <option value="coordinate">Coordinate with Buyer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Delivery Timeframe</label>
              <select 
                value={formData.deliveryTime} 
                onChange={(e) => setFormData({...formData, deliveryTime: e.target.value})}
                className="w-full bg-background border border-border rounded-lg p-3 text-text outline-none focus:border-primary/50"
              >
                <option value="Instant">Instant</option>
                <option value="1 hour">Within 1 hour</option>
                <option value="24 hours">Within 24 hours</option>
                <option value="1-3 days">1 - 3 days</option>
              </select>
            </div>
          </div>

          {formData.deliveryMethod === "automatic" && (
            <div>
              <label className="block text-sm font-semibold text-text mb-2 flex items-center gap-2">
                Automatic Delivery Data 
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Secure</span>
              </label>
              <p className="text-xs text-text-muted mb-3">This information will be automatically revealed to the buyer immediately after payment is confirmed.</p>
              <textarea 
                required
                rows={3}
                placeholder="Username: Player1&#10;Password: SecretPass123"
                value={formData.autoDeliveryData}
                onChange={(e) => setFormData({...formData, autoDeliveryData: e.target.value})}
                className="w-full bg-background border border-border rounded-lg p-3 text-text outline-none focus:border-primary/50 resize-y font-mono text-sm"
              />
            </div>
          )}
        </div>

        {/* Media */}
        <div className="bg-card border border-border p-6 rounded-xl space-y-5">
          <h2 className="font-heading font-bold text-xl text-text border-b border-border pb-3">Media (Coming Soon)</h2>
          <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center opacity-50">
            <UploadCloud size={40} className="text-text-muted mb-3" />
            <p className="text-sm font-semibold text-text">Drag & drop images here</p>
            <p className="text-xs text-text-muted mt-1">Image uploads will be enabled in the final production release.</p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting || !games || !categories}
            className="flex items-center gap-2 bg-primary text-white font-bold px-8 py-4 rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Publishing...</> : <>Publish Listing <ChevronRight size={18} /></>}
          </button>
        </div>
      </form>
    </div>
  );
}
