import React, { useState } from 'react';
import { X, User, Mail, Shield, Check, Lock, Youtube } from 'lucide-react';
import { User as UserType } from '../types.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  onLogin: (name: string, email: string) => void;
  onConnectYouTube: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onConnectYouTube
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(currentUser?.name || 'Bittu Kumar');
  const [email, setEmail] = useState(currentUser?.email || 'bittubam349@gmail.com');
  const [role, setRole] = useState<'creator' | 'admin'>(currentUser?.role || 'creator');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(name, email);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleQuickSwitch = (quickName: string, quickEmail: string) => {
    setName(quickName);
    setEmail(quickEmail);
    onLogin(quickName, quickEmail);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0c101b] p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Creator Account</h3>
            <p className="text-xs text-slate-400">Manage creator credentials & OAuth access</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Creator Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-900 border border-slate-700/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-900 border border-slate-700/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-purple-600 hover:bg-purple-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/20 transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-4 w-4 text-white" />
                  <span>Account Updated!</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </div>
        </form>

        {/* Fast Switch Demo Profiles */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Fast Profile Switcher
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickSwitch('Bittu Kumar (Creator)', 'bittubam349@gmail.com')}
              className="rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2 text-left text-xs transition-colors"
            >
              <p className="font-semibold text-slate-200">Bittu Kumar</p>
              <p className="text-[10px] text-slate-400 truncate">bittubam349@gmail.com</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSwitch('Viral AI Producer', 'producer@clipmitra.ai')}
              className="rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2 text-left text-xs transition-colors"
            >
              <p className="font-semibold text-slate-200">AI Producer</p>
              <p className="text-[10px] text-slate-400 truncate">producer@clipmitra.ai</p>
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-5 flex items-start space-x-2 rounded-xl bg-purple-950/20 border border-purple-500/20 p-3 text-[11px] text-purple-200">
          <Shield className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
          <span>
            ClipMitra never stores Google passwords. Official OAuth 2.0 tokens are encrypted on your local server.
          </span>
        </div>
      </div>
    </div>
  );
};
