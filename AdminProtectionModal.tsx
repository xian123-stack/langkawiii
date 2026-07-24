import { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function isLocalhost(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.endsWith('.localhost')
  );
}

interface AdminProtectionModalProps {
  isOpen: boolean;
  actionTitle?: string;
  actionDescription?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function AdminProtectionModal({
  isOpen,
  actionTitle = 'Start Over Restricted',
  actionDescription = "To prevent users on shared deployments from accidentally deleting or resetting uploaded videos and images, this action is restricted to Localhost or requires Admin verification.",
  onClose,
  onConfirm
}: AdminProtectionModalProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const isLocal = isLocalhost();

  const handleVerifyAndProceed = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLocal) {
      onConfirm();
      onClose();
      return;
    }

    const cleanPass = passcode.trim().toLowerCase();
    if (cleanPass === 'admin123' || cleanPass === 'admin' || cleanPass === 'langkawi') {
      setError(false);
      setPasscode('');
      onConfirm();
      onClose();
    } else {
      setError(true);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      >
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative z-10 border border-slate-200 text-slate-800"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon Badge */}
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mb-4 shadow-sm">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            {actionTitle}
          </h3>

          <p className="text-xs text-slate-500 leading-relaxed mt-2">
            {actionDescription}
          </p>

          {!isLocal ? (
            <form onSubmit={handleVerifyAndProceed} className="mt-5 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-amber-800 text-xs">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>Non-localhost environment detected ({typeof window !== 'undefined' ? window.location.hostname : 'remote'}). Enter Admin Passcode to proceed.</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  Admin Passcode
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setError(false);
                  }}
                  placeholder="Enter passcode (e.g. admin123)"
                  autoFocus
                  className={`w-full px-4 py-2.5 bg-slate-50 border ${
                    error ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:border-emerald-500'
                  } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all`}
                />
                {error && (
                  <p className="text-xs text-rose-600 font-medium mt-1">
                    Incorrect passcode. Localhost or valid admin credentials required.
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Unlock & Proceed
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Running on Localhost ({window.location.hostname}). Direct access granted!</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyAndProceed}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md transition-colors"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
