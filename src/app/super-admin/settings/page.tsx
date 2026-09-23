'use client';

import React, { useState } from 'react';
import Sidebar from '@/frontend/components/super-admin/Sidebar';
import {
  User,
  Key,
  Mail,
  Webhook,
  Laptop,
  Copy,
  Eye,
  EyeOff,
  Globe,
  Check,
  Loader2,
} from 'lucide-react';

export default function SuperAdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'profile' | 'email' | 'webhooks' | 'api' | 'sessions'>('all');
  const [fullName, setFullName] = useState('Root Admin');
  const [workEmail, setWorkEmail] = useState('root@arba.internal');
  const [currentKey, setCurrentKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);

  // Email template state
  const [selectedTemplate, setSelectedTemplate] = useState('reminder');
  const [templateSubject, setTemplateSubject] = useState(
    'Action Required: Overdue Invoice {{invoice_number}} for {{org_name}}'
  );
  const [templateBody, setTemplateBody] = useState(
    `Dear {{org_name}} Team,

Your account has an outstanding balance of {{amount_due}} due on {{due_date}}.
Please settle this invoice to avoid service interruption:
{{payment_link}}

Sincerely,
Arba Incubator Platform`
  );

  // API Key state
  const fullApiKey = 'arba_live_948f9382173bc8a719284a71';
  const maskedApiKey = 'arba_live_948f93...4a71';
  const [copiedKey, setCopiedKey] = useState(false);

  const fullWebhookSecret = 'whsec_892348917234abcdef91823';
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Button loading states
  const [savingCreds, setSavingCreds] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyKey = () => {
    navigator.clipboard?.writeText?.(fullApiKey);
    setCopiedKey(true);
    showToast('API Key copied to clipboard');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyWebhook = () => {
    navigator.clipboard?.writeText?.(fullWebhookSecret);
    setCopiedWebhook(true);
    showToast('Webhook secret copied to clipboard');
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleSaveCreds = () => {
    setSavingCreds(true);
    setTimeout(() => {
      setSavingCreds(false);
      showToast('Master credentials updated successfully.');
    }, 600);
  };

  const handleSaveTemplate = () => {
    setSavingTemplate(true);
    setTimeout(() => {
      setSavingTemplate(false);
      showToast('Template changes saved successfully.');
    }, 600);
  };

  const handleSendTest = () => {
    setSendingTestEmail(true);
    setTimeout(() => {
      setSendingTestEmail(false);
      showToast('Test notification email dispatched to ' + workEmail);
    }, 700);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-8 max-w-[1550px]">
          {/* Header */}
          <header className="pb-4">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Platform Settings &amp; Administration
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage master credentials, notification email templates, developer webhooks, API keys, and active sessions.
            </p>
          </header>

          {/* Interactive Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 mb-6 text-xs font-semibold text-slate-500">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-1 px-1 transition ${
                activeTab === 'all'
                  ? 'text-sky-600 border-b-2 border-sky-500 font-bold'
                  : 'hover:text-slate-800'
              }`}
            >
              All Settings (Overview)
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-1 px-1 transition ${
                activeTab === 'profile'
                  ? 'text-sky-600 border-b-2 border-sky-500 font-bold'
                  : 'hover:text-slate-800'
              }`}
            >
              General &amp; Profile
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setActiveTab('email')}
              className={`pb-1 px-1 transition ${
                activeTab === 'email'
                  ? 'text-sky-600 border-b-2 border-sky-500 font-bold'
                  : 'hover:text-slate-800'
              }`}
            >
              Email Templates
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`pb-1 px-1 transition ${
                activeTab === 'webhooks'
                  ? 'text-sky-600 border-b-2 border-sky-500 font-bold'
                  : 'hover:text-slate-800'
              }`}
            >
              Webhooks &amp; Integrations
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setActiveTab('api')}
              className={`pb-1 px-1 transition ${
                activeTab === 'api'
                  ? 'text-sky-600 border-b-2 border-sky-500 font-bold'
                  : 'hover:text-slate-800'
              }`}
            >
              API Keys
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`pb-1 px-1 transition ${
                activeTab === 'sessions'
                  ? 'text-sky-600 border-b-2 border-sky-500 font-bold'
                  : 'hover:text-slate-800'
              }`}
            >
              Active Sessions (3)
            </button>
          </div>

          {/* Responsive Layout: 3-column when 'all', max-w-4xl focused when single tab */}
          <div className={activeTab === 'all' ? 'grid grid-cols-1 lg:grid-cols-3 gap-6 items-start' : 'w-full max-w-4xl space-y-6'}>
            {/* COLUMN 1: Profile & Credentials + API Keys */}
            {(activeTab === 'all' || activeTab === 'profile' || activeTab === 'api') && (
              <div className="space-y-6 flex flex-col justify-between">
                {/* Admin Profile & Master Credentials */}
                {(activeTab === 'all' || activeTab === 'profile') && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <h2 className="text-xs font-bold text-slate-900 leading-none">
                            Admin Profile &amp; Master Credentials
                          </h2>
                          <p className="text-[11px] text-slate-400 mt-0.5">Profile Information</p>
                        </div>
                      </div>

                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                        alt="Root Admin Avatar"
                        className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                      />
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-600 font-medium mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-medium mb-1">
                            Master Work Email
                          </label>
                          <input
                            type="email"
                            value={workEmail}
                            onChange={(e) => setWorkEmail(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                          />
                        </div>
                      </div>

                      {/* Password Section */}
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-[11px] font-bold text-slate-700 mb-2">
                          Password Update Section
                        </p>
                        <div className="space-y-2">
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={currentKey}
                              onChange={(e) => setCurrentKey(e.target.value)}
                              placeholder="Current Master Key"
                              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 pr-7"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="New Password"
                              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Confirm New"
                              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 2FA Security Switch */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-bold text-slate-800">Two-Factor Authentication (2FA)</p>
                          <p className="text-[10px] text-slate-400">Enforce TOTP authenticator app</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIs2FAEnabled(!is2FAEnabled);
                            showToast(!is2FAEnabled ? '2FA Enabled for Root Admin' : '2FA Disabled');
                          }}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                            is2FAEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                              is2FAEnabled ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={handleSaveCreds}
                          disabled={savingCreds}
                          className="w-full py-2 bg-white border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-700 rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
                        >
                          {savingCreds && <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-500" />}
                          <span>Update Credentials</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Master Developer API Keys */}
                {(activeTab === 'all' || activeTab === 'api') && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Key className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-slate-900 leading-none">
                          Master Developer API Keys
                        </h2>
                        <p className="text-[11px] text-slate-400 mt-0.5">Backend Integration API Keys</p>
                      </div>
                    </div>

                    <div className="text-xs space-y-3">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 overflow-x-auto">
                        <div className="min-w-[360px] space-y-1.5">
                          <div className="grid grid-cols-12 gap-2 text-[11px] text-slate-400 font-semibold uppercase">
                            <span className="col-span-4">Label</span>
                            <span className="col-span-5">Key</span>
                            <span className="col-span-3 text-right">Created</span>
                          </div>

                          <div className="grid grid-cols-12 gap-2 items-center text-xs pt-1">
                            <span className="col-span-4 font-semibold text-slate-700 truncate">Production Master</span>
                            <div className="col-span-5 flex items-center justify-between gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded font-mono text-[11px] text-slate-600 min-w-0">
                              <span className="truncate">{showApiKey ? fullApiKey.substring(0, 18) + '...' : maskedApiKey}</span>
                              <div className="flex items-center shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setShowApiKey(!showApiKey)}
                                  className="text-slate-400 hover:text-slate-600 p-0.5"
                                  title={showApiKey ? 'Hide Key' : 'Reveal Key'}
                                >
                                  {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCopyKey}
                                  className="text-slate-400 hover:text-slate-600 p-0.5"
                                  title="Copy Key"
                                >
                                  {copiedKey ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            </div>
                            <span className="col-span-3 text-[11px] text-slate-400 text-right leading-tight">
                              Aug 15, 2026<br />2 mins ago
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => {
                            showToast('New API key generated.');
                          }}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-lg transition"
                        >
                          Regenerate Key
                        </button>
                        <button
                          onClick={() => showToast('API key revoked.')}
                          className="text-rose-600 hover:text-rose-700 font-bold text-xs"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* COLUMN 2: Notification Email Templates */}
            {(activeTab === 'all' || activeTab === 'email') && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-slate-900 leading-none">
                          Notification Email Templates
                        </h2>
                        <p className="text-[11px] text-slate-400 mt-0.5">Automated Email Notification Templates</p>
                      </div>
                    </div>

                    <Globe className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* Template Selector Pills */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1.5">
                        Template Selector Pill Tabs
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => setSelectedTemplate('reminder')}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                            selectedTemplate === 'reminder'
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Payment Reminder Notice (Active)
                        </button>
                        <button
                          onClick={() => setSelectedTemplate('suspension')}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                            selectedTemplate === 'suspension'
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Account Suspension Alert
                        </button>
                        <button
                          onClick={() => setSelectedTemplate('welcome')}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                            selectedTemplate === 'welcome'
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Welcome Onboard
                        </button>
                      </div>
                    </div>

                    {/* Subject Input */}
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={templateSubject}
                        onChange={(e) => setTemplateSubject(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
                      />
                    </div>

                    {/* Body Editor */}
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">
                        Template Body Editor
                      </label>
                      <textarea
                        rows={7}
                        value={templateBody}
                        onChange={(e) => setTemplateBody(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-sans leading-relaxed resize-none"
                      />
                    </div>

                    {/* Variable Helper Buttons */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button
                        onClick={() => setTemplateBody((prev) => prev + ' {{org_name}}')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-mono transition"
                      >
                        [+ {'{{org_name}}'}]
                      </button>
                      <button
                        onClick={() => setTemplateBody((prev) => prev + ' {{amount_due}}')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-mono transition"
                      >
                        [+ {'{{amount_due}}'}]
                      </button>
                      <button
                        onClick={() => setTemplateBody((prev) => prev + ' {{payment_link}}')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-mono transition"
                      >
                        [+ {'{{pay_link}}'}]
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
                  <button
                    onClick={handleSendTest}
                    disabled={sendingTestEmail}
                    className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                  >
                    {sendingTestEmail && <Loader2 className="w-3 h-3 animate-spin text-sky-500" />}
                    <span>Send Test Email</span>
                  </button>
                  <button
                    onClick={handleSaveTemplate}
                    disabled={savingTemplate}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm active:scale-95 transition flex items-center gap-1.5"
                  >
                    {savingTemplate && <Loader2 className="w-3 h-3 animate-spin text-white" />}
                    <span>Save Template Changes</span>
                  </button>
                </div>
              </div>
            )}

            {/* COLUMN 3: Webhooks & Active Sessions */}
            {(activeTab === 'all' || activeTab === 'webhooks' || activeTab === 'sessions') && (
              <div className="space-y-6 flex flex-col justify-between">
                {/* Webhooks & Integrations */}
                {(activeTab === 'all' || activeTab === 'webhooks') && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-4">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Webhook className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-slate-900 leading-none">
                          Webhooks &amp; Integrations
                        </h2>
                        <p className="text-[11px] text-slate-400 mt-0.5">Platform Webhook Endpoints</p>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
                          <span>Endpoint</span>
                          <span>Secret Token</span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <input
                            type="text"
                            readOnly
                            value="https://api.internal.com/webhooks/incubator"
                            className="flex-1 min-w-0 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-slate-50 font-mono truncate"
                          />
                          <div className="flex items-center justify-between sm:justify-start gap-1 bg-white border border-slate-200 px-2 py-1.5 rounded-lg text-slate-600 font-mono text-[11px] shrink-0">
                            <span>{showWebhookSecret ? 'whsec_8923...' : '••••••••'}</span>
                            <button
                              type="button"
                              onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                              className="text-slate-400 hover:text-slate-600"
                              title={showWebhookSecret ? 'Hide Secret' : 'Reveal Secret'}
                            >
                              {showWebhookSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              type="button"
                              onClick={handleCopyWebhook}
                              className="text-slate-400 hover:text-slate-600"
                              title="Copy Secret"
                            >
                              {copiedWebhook ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Subscribed Events */}
                      <div>
                        <p className="text-[11px] font-bold text-slate-700 mb-1.5">
                          Subscribed Events
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                            ✓ organization.created
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                            ✓ payment.overdue
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                            ✓ tenant.suspended
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => showToast('Ping sent! Webhook responded: 200 OK (38ms)')}
                          className="flex-1 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg text-xs transition"
                        >
                          Ping Test (200 OK)
                        </button>
                        <button
                          onClick={() => showToast('Opening Webhook configuration modal...')}
                          className="flex-1 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs transition"
                        >
                          + New Endpoint
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Active Sessions & Device Security */}
                {(activeTab === 'all' || activeTab === 'sessions') && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-4">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-slate-900 leading-none">
                          Active Sessions &amp; Device Security
                        </h2>
                        <p className="text-[11px] text-slate-400 mt-0.5">Active Admin Login Sessions</p>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="text-[11px] text-slate-400 font-semibold uppercase">
                        Device
                      </div>

                      {/* Device 1 (Current) */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">
                            Chrome on macOS • IP: 192.168.1.42
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <span>Austin, US</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              (Current Session)
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Device 2 */}
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">
                            Firefox on Windows • IP: 104.28.19.12
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            New York, US • Active 3 hours ago
                          </p>
                        </div>
                        <button
                          onClick={() => showToast('Session revoked.')}
                          className="px-2.5 py-1 text-xs font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-lg transition shrink-0 self-start sm:self-auto"
                        >
                          Revoke
                        </button>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => showToast('All other sessions signed out.')}
                          className="w-full py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-lg text-xs transition"
                        >
                          Sign Out of All Other Sessions
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <span className="text-emerald-400">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
