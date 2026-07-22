import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Mail, RefreshCw, CheckCircle2, Heart, ShieldCheck, Send, Sparkles, X, Camera, Upload, Trash2, Image as ImageIcon, Link as LinkIcon, Plus } from 'lucide-react';
import { CreatorSettings, ServerResponseRecord } from '../types';
import { SunflowerIcon } from './SunflowerIcon';

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
  const [activeTab, setActiveTab] = useState<'settings' | 'photos' | 'responses'>('settings');
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);
  const [responses, setResponses] = useState<ServerResponseRecord[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  // New photo input state
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');

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

  const compressImageFile = (file: File, maxDimension = 1200, quality = 0.82): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve((e.target?.result as string) || '');
          }
        };
        img.onerror = () => resolve((e.target?.result as string) || '');
        img.src = (e.target?.result as string) || '';
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files) as File[];
    let newPhotosList = [...(settings.photos || [])];

    for (const file of fileList) {
      const optimizedDataUrl = await compressImageFile(file);
      const newPhoto = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
        url: optimizedDataUrl,
        caption: file.name.split('.')[0].replace(/[-_]/g, ' ') || 'Our Precious Moment 🌻',
      };
      newPhotosList.push(newPhoto);
    }

    onUpdateSettings({
      ...settings,
      photos: newPhotosList,
    });

    e.target.value = '';
  };

  const handleAddPhotoUrl = () => {
    if (!newPhotoUrl.trim()) return;
    const newPhoto = {
      id: Date.now().toString(),
      url: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || 'Our Precious Moment 🌻',
    };
    onUpdateSettings({
      ...settings,
      photos: [...(settings.photos || []), newPhoto],
    });
    setNewPhotoUrl('');
    setNewPhotoCaption('');
  };

  const handleRemovePhoto = (id: string) => {
    onUpdateSettings({
      ...settings,
      photos: (settings.photos || []).filter((p) => p.id !== id),
    });
  };

  const handleUpdateCaption = (id: string, caption: string) => {
    onUpdateSettings({
      ...settings,
      photos: (settings.photos || []).map((p) => (p.id === id ? { ...p, caption } : p)),
    });
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
          <div className="p-5 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CrownIcon className="w-6 h-6 text-yellow-200" />
              <div>
                <h3 className="text-lg font-serif font-semibold flex items-center gap-1.5">
                  <span>King's Control Center</span>
                  <SunflowerIcon className="w-4 h-4 text-amber-200" />
                </h3>
                <p className="text-xs text-red-100 font-sans">Settings, Photos & Live Responses</p>
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
          <div className="flex border-b border-red-100 bg-red-50/40 p-2 space-x-1.5 font-sans overflow-x-auto">
            <button
              id="tab-settings-btn"
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-white text-red-600 shadow-xs border border-red-200'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Names & Email</span>
            </button>

            <button
              id="tab-photos-btn"
              onClick={() => setActiveTab('photos')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'photos'
                  ? 'bg-white text-amber-700 shadow-xs border border-amber-300'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-amber-500" />
              <span>📸 Photos ({(settings.photos || []).length})</span>
            </button>

            <button
              id="tab-responses-btn"
              onClick={() => {
                setActiveTab('responses');
                fetchResponses();
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'responses'
                  ? 'bg-white text-red-600 shadow-xs border border-red-200'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-red-500" />
              <span>Responses ({responses.length})</span>
            </button>
          </div>

          {/* Tab Content Area */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {activeTab === 'settings' && (
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
                      placeholder="e.g. Blessing, My Queen, Babe"
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
            )}

            {activeTab === 'photos' && (
              <div className="space-y-5">
                <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200/80 flex items-start space-x-3">
                  <SunflowerIcon className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                  <div className="text-xs text-amber-950 leading-relaxed">
                    <strong>Add Photos of You Two:</strong> Upload local photo files from your phone or computer, or paste photo links. They will be displayed in an interactive gallery for {settings.girlfriendName}!
                  </div>
                </div>

                {/* Upload or Add URL Box */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-amber-500" />
                    <span>Add New Photo</span>
                  </h4>

                  {/* Option 1: File Upload */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Upload Photo File (JPEG, PNG, WEBP)
                    </label>
                    <label className="flex items-center justify-center p-3 rounded-xl border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 transition-colors cursor-pointer text-xs font-medium text-amber-900 gap-2">
                      <Upload className="w-4 h-4 text-amber-600" />
                      <span>Choose Photo from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-2 text-[10px] text-slate-400 font-bold uppercase">or image link</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  {/* Option 2: Image URL Input */}
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      placeholder="Paste image URL (e.g. https://...)"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-amber-400"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPhotoCaption}
                        onChange={(e) => setNewPhotoCaption(e.target.value)}
                        placeholder="Caption (e.g. Our first date 🌻)"
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddPhotoUrl}
                        disabled={!newPhotoUrl.trim()}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Add Photo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Current Photos Grid List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Current Photo Collection ({(settings.photos || []).length})
                  </h4>

                  {(!settings.photos || settings.photos.length === 0) ? (
                    <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                      <p className="text-xs text-slate-500">No photos added yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {settings.photos.map((photo) => (
                        <div
                          key={photo.id}
                          className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex gap-3 items-center"
                        >
                          <img
                            src={photo.url}
                            alt={photo.caption}
                            className="w-14 h-14 object-cover rounded-lg bg-slate-100 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          <div className="flex-1 min-w-0 space-y-1">
                            <input
                              type="text"
                              value={photo.caption}
                              onChange={(e) => handleUpdateCaption(photo.id, e.target.value)}
                              placeholder="Photo caption..."
                              className="w-full px-2 py-1 rounded-md border border-slate-200 text-xs text-slate-800 focus:border-amber-400"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(photo.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'responses' && (
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
