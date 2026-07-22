import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Mail, RefreshCw, CheckCircle2, Heart, ShieldCheck, Send, Sparkles, X } from 'lucide-react';
import { CreatorSettings, ServerResponseRecord } from '../types';

interface CreatorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CreatorSettings;
  onUpdateSettings: (newSettings: CreatorSettings) => void;
}

export const CreatorPanel: React.FC<CreatorPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'responses'>('settings');
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);
  const [responses, setResponses] = useState<ServerResponseRecord[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  const fetchResponses = async () => {
    setLoadingResponses(true);
    try {
      const res = await fetch('/api/responses');
      const data = await res.json();
      if (data.success) {
        setResponses(data.responses || []);
      }
    } catch (e) {
      console.error("Failed to fetch responses", e);
    } finally {
      setLoadingResponses(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchResponses();
    }
  }, [isOpen]);

  const handleTestEmail = async () => {
    setTestEmailLoading(true);
    setTestEmailStatus(null);
    try {
      const res = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: settings.recipientEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setTestEmailStatus(`Test alert logged for ${settings.recipientEmail}! ${data.emailResult?.success ? 'Email sent via SMTP/Resend!' : 'Alert stored in live response feed below!'}`);
      } else {
        setTestEmailStatus('Failed to send test email.');
      }
    } catch (e: any) {
      setTestEmailStatus('Error: ' + (e.message || 'Server error'));
    } finally {
      setTestEmailLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl shadow-2xl border border-pink-100 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Modal Header */}
          <div className="p-5 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CrownIcon className="w-6 h-6 text-yellow-200" />
              <div>
                <h3 className="text-lg font-serif font-semibold">King's Control Center</h3>
                <p className="text-xs text-red-100 font-sans">Proposal Settings & Email Notification Hub</p>
              </div>
            </div>
            <button
              id="close-creator-panel-btn"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-red-100 bg-red-50/40 p-2 space-x-2 font-sans">
            <button
              id="tab-settings-btn"
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-white text-red-600 shadow-xs border border-red-200'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Customize Names & Email</span>
            </button>
            <button
              id="tab-responses-btn"
              onClick={() => {
                setActiveTab('responses');
                fetchResponses();
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                activeTab === 'responses'
                  ? 'bg-white text-red-600 shadow-xs border border-red-200'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <Heart className="w-4 h-4 text-red-500" />
              <span>Live Responses ({responses.length})</span>
            </button>
          </div>

          {/* Tab Content Area */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {activeTab === 'settings' ? (
              <div className="space-y-5">
                <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-200/60 flex items-start space-x-3">
                  <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-900 leading-relaxed">
                    <strong>Email Alert Direct Delivery:</strong> Responses are automatically emailed to <strong>{settings.recipientEmail}</strong>. You can also view her live answer & note in the "Live Responses" tab anytime!
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Her Name / Nickname (e.g. Blessing)
                    </label>
                    <input
                      type="text"
                      value={settings.girlfriendName}
                      onChange={(e) => onUpdateSettings({ ...settings, girlfriendName: e.target.value })}
                      placeholder="e.g. My Princess, Sarah, Babe"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-slate-800 text-sm outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Your Name / Title (e.g. a King)
                    </label>
                    <input
                      type="text"
                      value={settings.boyfriendName}
                      onChange={(e) => onUpdateSettings({ ...settings, boyfriendName: e.target.value })}
                      placeholder="e.g. a King, Michael, Honey"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-slate-800 text-sm outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Notification Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={settings.recipientEmail}
                        onChange={(e) => onUpdateSettings({ ...settings, recipientEmail: e.target.value })}
                        placeholder="e.g. mcmikeyofficial@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-slate-800 text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      id="test-email-trigger-btn"
                      type="button"
                      onClick={handleTestEmail}
                      disabled={testEmailLoading}
                      className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-full shadow-md shadow-red-100 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {testEmailLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>Test Email Alert to {settings.recipientEmail}</span>
                    </button>

                    {testEmailStatus && (
                      <p className="mt-2 text-xs text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200 text-center font-sans">
                        {testEmailStatus}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-800">
                    Received Proposals & Responses
                  </h4>
                  <button
                    id="refresh-responses-btn"
                    onClick={fetchResponses}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer text-xs flex items-center space-x-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingResponses ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {responses.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
                    <Sparkles className="w-8 h-8 text-rose-300 mx-auto mb-2 animate-bounce" />
                    <p className="text-sm text-slate-600 font-medium">No proposal responses recorded yet!</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Share the page link with her. As soon as she clicks YES, her response will appear right here and be sent to {settings.recipientEmail}!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {responses.map((resp) => (
                      <div
                        key={resp.id}
                        className="p-4 bg-gradient-to-br from-rose-50 to-pink-50/50 rounded-2xl border border-rose-200 shadow-sm space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {resp.answer}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(resp.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <span className="text-[10px] text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-md font-mono">
                            {resp.emailSentStatus}
                          </span>
                        </div>

                        {resp.customNote && (
                          <div className="p-3 bg-white/80 rounded-xl border border-rose-100 text-xs text-slate-800 italic">
                            "{resp.customNote}"
                          </div>
                        )}

                        {resp.answersList && resp.answersList.length > 0 && (
                          <div className="text-xs text-slate-600 pt-1 border-t border-rose-100/80">
                            <strong>Quiz choices:</strong>{' '}
                            {resp.answersList.map((a) => `${a.question}: ${a.answer}`).join(' | ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              id="save-creator-panel-btn"
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl cursor-pointer transition-colors"
            >
              Done & Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

function CrownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
    </svg>
  );
}
