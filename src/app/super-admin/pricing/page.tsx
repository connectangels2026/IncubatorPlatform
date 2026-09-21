'use client';

import React, { useState } from 'react';
import Sidebar from '@/frontend/components/super-admin/Sidebar';

interface Tier {
  id: string;
  name: string;
  badgeColor: string;
  price: number;
  popular?: boolean;
  active: boolean;
  maxStartups: string;
  maxMentors: string;
  maxUsers: string;
  features: { text: string; included: boolean }[];
  description: string;
  featureFlags: {
    csv_export: boolean;
    mentorship: boolean;
    ai_features: boolean;
    api_access: boolean;
  };
}

const INITIAL_TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Community Free',
    badgeColor: 'bg-slate-100 text-slate-700',
    price: 0,
    active: true,
    maxStartups: '10',
    maxMentors: '2',
    maxUsers: '5',
    features: [
      { text: 'Basic Startup Directory', included: true },
      { text: 'Public Programs', included: true },
      { text: 'Mentorship CRM', included: false },
      { text: 'AI Matching', included: false },
      { text: 'API Access', included: false },
    ],
    description: 'Entry-level tier for newly launched incubators and trial cohorts.',
    featureFlags: {
      csv_export: false,
      mentorship: false,
      ai_features: false,
      api_access: false,
    },
  },
  {
    id: 'pro',
    name: 'Incubator Pro',
    badgeColor: 'bg-cyan-50 text-cyan-800',
    price: 499,
    popular: true,
    active: true,
    maxStartups: '100',
    maxMentors: '25',
    maxUsers: '50',
    features: [
      { text: '1-on-1 Mentorship CRM', included: true },
      { text: 'CSV Export & Reports', included: true },
      { text: 'Demo Day Investor Access', included: true },
      { text: 'Custom Domain', included: true },
      { text: 'Full API Access', included: false },
    ],
    description: 'Designed for scaling accelerators managing multiple cohorts simultaneously.',
    featureFlags: {
      csv_export: true,
      mentorship: true,
      ai_features: true,
      api_access: false,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise Cluster',
    badgeColor: 'bg-purple-50 text-purple-800',
    price: 1299,
    active: true,
    maxStartups: 'Unlimited',
    maxMentors: 'Unlimited',
    maxUsers: 'Unlimited',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Dedicated Account Manager', included: true },
      { text: 'AI Evaluation Engine', included: true },
      { text: 'Full REST & Webhook API', included: true },
      { text: 'White-label Branding', included: true },
    ],
    description: 'High performance cluster deployment for university networks and global venture hubs.',
    featureFlags: {
      csv_export: true,
      mentorship: true,
      ai_features: true,
      api_access: true,
    },
  },
];

export default function SuperAdminPricingPage() {
  const [tiers, setTiers] = useState<Tier[]>(INITIAL_TIERS);
  const [editingTier, setEditingTier] = useState<Tier | null>(INITIAL_TIERS[1]); // open Pro by default as in screenshot
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleTier = (id: string) => {
    setTiers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    );
  };

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTier) return;
    setIsConfirmOpen(true);
  };

  const confirmAndPublish = () => {
    if (!editingTier) return;
    setTiers((prev) =>
      prev.map((t) => (t.id === editingTier.id ? editingTier : t))
    );
    setIsConfirmOpen(false);
    showToast(`Updated "${editingTier.name}" tier successfully.`);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex min-w-0 overflow-y-auto">
        <main className="flex-1 p-8">
          {/* Header Bar */}
          <header className="flex items-center justify-between pb-6 border-b border-slate-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span>Subscriptions</span>
            </div>

            <div className="flex items-center gap-4 text-slate-500">
              <button
                title="Help & Documentation"
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white transition text-xs font-bold"
              >
                ?
              </button>
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-xs font-semibold">
                👤
              </div>
            </div>
          </header>

          {/* Banner & Title Area */}
          <section className="my-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Subscription Tiers &amp; Plan Limits
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Configure pricing tiers, startup quotas, feature gates, and plan availability
              </p>
            </div>

            {/* Warning Callout */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 max-w-sm">
              <div className="font-semibold flex items-center gap-1.5">
                <span>⚠️</span>
                <span>Price changes apply to new signups only</span>
              </div>
              <p className="text-amber-800/90 pl-5 mt-0.5">• Existing tenants grandfathered</p>
            </div>
          </section>

          {/* 3 Tier Cards Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {tiers.map((tier) => {
              const isSelectedForEdit = editingTier?.id === tier.id;
              const isPro = tier.popular;

              return (
                <div
                  key={tier.id}
                  className={`bg-white rounded-2xl p-6 transition flex flex-col justify-between relative shadow-sm ${
                    isPro
                      ? 'border-2 border-sky-400 ring-4 ring-sky-500/10'
                      : 'border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* "Most Popular" floating pill */}
                  {isPro && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-cyan-100 text-cyan-900 text-[11px] font-bold px-3 py-0.5 rounded-full border border-cyan-300 shadow-sm">
                      Most Popular
                    </div>
                  )}

                  <div>
                    {/* Top Row: Title Badge & Switch */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          tier.id === 'enterprise'
                            ? 'bg-purple-100 text-purple-800'
                            : tier.id === 'pro'
                            ? 'bg-sky-50 text-sky-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {tier.name}
                      </span>

                      {/* Green Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleTier(tier.id)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          tier.active ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      >
                        <span className="sr-only">Toggle Active</span>
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            tier.active ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                        <span
                          className={`absolute text-[9px] font-extrabold uppercase select-none ${
                            tier.active
                              ? 'left-1 text-white top-0.5'
                              : 'right-1 text-slate-500 top-0.5'
                          }`}
                        >
                          {tier.active ? 'ON' : 'OFF'}
                        </span>
                      </button>
                    </div>

                    {/* Price */}
                    <div className="my-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                          ${tier.price}
                        </span>
                        <span className="text-sm font-medium text-slate-500">/ month</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">28px slate-900</p>
                    </div>

                    {/* Quota Badges */}
                    <div className="flex flex-wrap gap-1.5 my-4">
                      <span className="px-2.5 py-1 bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200">
                        Max Startups: {tier.maxStartups}
                      </span>
                      <span className="px-2.5 py-1 bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200">
                        Max Mentors: {tier.maxMentors}
                      </span>
                      {tier.maxUsers && (
                        <span className="px-2.5 py-1 bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200">
                          Max Users: {tier.maxUsers}
                        </span>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="mt-5 space-y-2.5 text-xs font-medium">
                      <p className="font-bold text-slate-900 text-xs tracking-wider uppercase mb-2">
                        Features
                      </p>
                      {tier.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {feat.included ? (
                            <span className="text-sky-600 font-bold">✓</span>
                          ) : (
                            <span className="text-slate-400 font-bold">✕</span>
                          )}
                          <span
                            className={feat.included ? 'text-slate-700' : 'text-slate-400'}
                          >
                            {feat.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Edit Button */}
                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={() => setEditingTier(tier)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-sm ${
                        isPro
                          ? 'bg-gradient-to-r from-sky-400 to-cyan-500 hover:from-sky-500 hover:to-cyan-600 text-white shadow-sky-500/20'
                          : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
                      }`}
                    >
                      Edit Tier Settings
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Create Custom Tier Card */}
            <div
              onClick={() => {
                const newTier: Tier = {
                  id: 'custom-' + Date.now(),
                  name: 'Custom Tier',
                  badgeColor: 'bg-emerald-50 text-emerald-800',
                  price: 799,
                  active: true,
                  maxStartups: '250',
                  maxMentors: '50',
                  maxUsers: '100',
                  features: [
                    { text: '1-on-1 Mentorship CRM', included: true },
                    { text: 'CSV Export & Reports', included: true },
                    { text: 'Custom Subdomain', included: true },
                  ],
                  description: 'Special customized cohort tier for accelerators.',
                  featureFlags: {
                    csv_export: true,
                    mentorship: true,
                    ai_features: false,
                    api_access: true,
                  },
                };
                setTiers([...tiers, newTier]);
                setEditingTier(newTier);
                showToast('New tier added. Configure settings in the right form.');
              }}
              className="border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-2xl p-6 transition flex flex-col items-center justify-center text-center cursor-pointer min-h-[360px] bg-white/40 hover:bg-sky-50/20 group shadow-xs"
            >
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 group-hover:border-sky-400 group-hover:bg-sky-50 flex items-center justify-center text-slate-400 group-hover:text-sky-500 transition mb-3">
                <span className="text-2xl font-light leading-none">+</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 group-hover:text-sky-600 transition">
                Create Custom Tier
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                Add custom startup quota limits, mentor capacities, and feature flags.
              </p>
            </div>
          </section>
        </main>

        {/* Right Side Drawer / Edit Form */}
        {editingTier && (
          <aside className="w-[360px] bg-white border-l border-slate-200 p-6 flex flex-col justify-between shrink-0 shadow-lg min-h-screen">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Edit Tier Form ({editingTier.name})
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingTier(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-base"
                >
                  ✕
                </button>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleSaveEdit} className="mt-5 space-y-4 text-xs font-medium">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tier Name
                  </label>
                  <input
                    type="text"
                    value={editingTier.name}
                    onChange={(e) =>
                      setEditingTier({ ...editingTier, name: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Monthly Price (USD)
                  </label>
                  <input
                    type="text"
                    value={`$${editingTier.price}.00`}
                    onChange={(e) => {
                      const val = Number(e.target.value.replace(/[^0-9]/g, ''));
                      setEditingTier({ ...editingTier, price: isNaN(val) ? 0 : val });
                    }}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-sm"
                  />
                </div>

                {/* Quotas: 3 Columns */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 truncate">
                      Max Startups
                    </label>
                    <input
                      type="text"
                      value={editingTier.maxStartups}
                      onChange={(e) =>
                        setEditingTier({ ...editingTier, maxStartups: e.target.value })
                      }
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-center font-medium bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 truncate">
                      Max Mentors
                    </label>
                    <input
                      type="text"
                      value={editingTier.maxMentors}
                      onChange={(e) =>
                        setEditingTier({ ...editingTier, maxMentors: e.target.value })
                      }
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-center font-medium bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 truncate">
                      Max Users ({editingTier.maxUsers})
                    </label>
                    <input
                      type="text"
                      value={editingTier.maxUsers}
                      onChange={(e) =>
                        setEditingTier({ ...editingTier, maxUsers: e.target.value })
                      }
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-center font-medium bg-white"
                    />
                  </div>
                </div>

                {/* Feature Flags */}
                <div className="pt-2">
                  <label className="block text-slate-700 font-bold mb-2">
                    Feature Flags
                  </label>
                  <div className="space-y-2 text-slate-700">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingTier.featureFlags.csv_export}
                        onChange={(e) =>
                          setEditingTier({
                            ...editingTier,
                            featureFlags: {
                              ...editingTier.featureFlags,
                              csv_export: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-slate-300 text-sky-500 focus:ring-sky-400 mt-0.5 cursor-pointer"
                      />
                      <div>
                        <p className="font-semibold text-slate-800">CSV Export &amp; Reporting</p>
                        <p className="text-[10px] text-slate-400 font-mono">csv_export</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingTier.featureFlags.mentorship}
                        onChange={(e) =>
                          setEditingTier({
                            ...editingTier,
                            featureFlags: {
                              ...editingTier.featureFlags,
                              mentorship: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-slate-300 text-sky-500 focus:ring-sky-400 mt-0.5 cursor-pointer"
                      />
                      <div>
                        <p className="font-semibold text-slate-800">1-on-1 Mentorship CRM</p>
                        <p className="text-[10px] text-slate-400 font-mono">mentorship</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingTier.featureFlags.ai_features}
                        onChange={(e) =>
                          setEditingTier({
                            ...editingTier,
                            featureFlags: {
                              ...editingTier.featureFlags,
                              ai_features: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-slate-300 text-sky-500 focus:ring-sky-400 mt-0.5 cursor-pointer"
                      />
                      <div>
                        <p className="font-semibold text-slate-800">AI Evaluation &amp; Matching</p>
                        <p className="text-[10px] text-slate-400 font-mono">ai_features</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingTier.featureFlags.api_access}
                        onChange={(e) =>
                          setEditingTier({
                            ...editingTier,
                            featureFlags: {
                              ...editingTier.featureFlags,
                              api_access: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-slate-300 text-sky-500 focus:ring-sky-400 mt-0.5 cursor-pointer"
                      />
                      <div>
                        <p className="font-semibold text-slate-800">Dedicated REST API Access</p>
                        <p className="text-[10px] text-slate-400 font-mono">api_access</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Plan Description */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Plan Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingTier.description}
                    onChange={(e) =>
                      setEditingTier({ ...editingTier, description: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-sm"
                  />
                </div>

                {/* Notice Box */}
                <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-3 text-[11px] text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">Notice:</span> Changes will
                  update the <code className="text-sky-700 font-mono">pricing_tiers</code> database table and apply to future subscriptions.
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingTier(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-lg shadow-sm shadow-sky-500/20 active:scale-95 transition"
                  >
                    Save &amp; Publish Changes
                  </button>
                </div>
              </form>
            </div>
          </aside>
        )}
      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && editingTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm mb-3">
              <span>⚠️</span>
              <span>Confirm Pricing &amp; Quota Updates</span>
            </div>

            <div className="space-y-2 text-slate-600 leading-relaxed bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80 mb-4">
              <p className="font-semibold text-amber-900">
                Are you sure you want to update &ldquo;{editingTier.name}&rdquo;?
              </p>
              <p>
                • Price updates (${editingTier.price}/mo) will only apply to <strong>new signups</strong>.
              </p>
              <p>
                • All active organizations currently subscribed to this tier are grandfathered at their existing rate.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="px-3.5 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAndPublish}
                className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg shadow-sm transition"
              >
                Confirm &amp; Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <span className="text-emerald-400">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
